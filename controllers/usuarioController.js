import { check, validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import { generarToken } from '../lib/token.js';
import { emailRegistro, emailCuentaBloqueada, emailOlvidePassword } from '../lib/emails.js';
import bcrypt from 'bcrypt';


const formularioLogin = (req, res) => {
    res.render("auth/login", { pagina: "Inicia sesión" })
}
const formularioRegistro = (req, res) => {
    res.render("auth/registro", { pagina: "Registrate con nosotros :)" })
}

const formularioPassword = (req, res) => {
    res.render("auth/recuperarPassword", { pagina: "Recupera tu contraseña" })
}

const perfilGithub = (req, res) => {
    if (!req.user) return res.redirect('/auth/login');

    const { username, photos, id, provider } = req.user;
    res.render('auth/perfil', {
        usuario: username,
        foto: photos[0].value,
        idUsuario: id,
        proveedor: provider
    })
}

const registrarUsuario = async (req, res) => {
    console.log("Intentando registrar a un Usuario Nuevo con los datos del formulario:");

    // Destructuring data from the request body
    const { nombreUsuario, emailUsuario, passwordUsuario, confirmacionUsuario } = req.body;

    //Validación de los datos del formulario previo a registro en la BD
    //Definir las reglas de validación
    await check('nombreUsuario').notEmpty().withMessage("El nombre de la persona no puede ser vacio").run(req);
    await check('emailUsuario').notEmpty().withMessage("El correo electrónico no puede ser vació").isEmail().withMessage("El correo electrónico no tiene un formato adecuado").run(req);
    await check('passwordUsuario').notEmpty().withMessage("La contraseña no puede estar vacía").isLength({ min: 8, max: 30 }).withMessage("La longitud de la contraseña debe ser entre 8 y 30 caracterés").run(req);
    await check('confirmacionUsuario').equals(passwordUsuario).withMessage("Ambas contraseñas deben ser iguales").run(req);

    //Aplicamos la reglas definidas
    let resultadoValidacion = validationResult(req);

    // 1. Verificar si el usuario ya existe
    const existeUsuario = await Usuario.findOne({ where: { email: emailUsuario } });
    if (existeUsuario) {
        return res.render("auth/registro", {
            pagina: "Registrate con nosotros",
            errores: [{ msg: `Ya existe un usuario registrado con ese correo electrónico ${emailUsuario}` }],
            usuario: {
                nombreUsuario,
                emailUsuario
            }
        });
    }

    // 2. Verificar si hay errores de validación
    if (!resultadoValidacion.isEmpty()) {
        // HAY ERRORES: Volvemos al formulario
        return res.render("auth/registro", {
            pagina: "Error al intentar crear una cuenta.",
            // Enviamos los errores con el formato que el Pug espera (con .msg)
            errores: resultadoValidacion.array(),
            usuario: {
                nombreUsuario,
                emailUsuario
            }
        });
    }

    // 3. NO HAY ERRORES: Intentar guardar en la BD
    try {
        const usuario = await Usuario.create({
            nombre: nombreUsuario,
            email: emailUsuario,
            password: passwordUsuario,
            token: generarToken(),
            tokenExpiracion: new Date(Date.now() + 3600000) // 1 hora
        });

        //Enviar correo de confirmación
        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })

        // Mostrar mensaje de confirmación
        res.render("templates/mensajes", {
            titulo: "Bienvenido a la página de Bienes Raíces",
            msg: `La cuenta asociada al correo: ${emailUsuario}, se ha creado exitosamente, te pedimos confirmar tu cuenta a través de tu correo electrónico`
        });

    } catch (error) {
        console.error(error);
        return res.render("auth/registro", {
            pagina: "Error en el servidor",
            errores: [{ msg: "Hubo un error al intentar guardar el registro." }],
            usuario: {
                nombreUsuario,
                emailUsuario
            }
        });
    }
}

const paginaConfirmacion = async (req, res) => {
    const { token: tokenCuenta } = req.params;
    console.log("Confirmando la cuenta asociada al token: ", tokenCuenta);

    //cofirmar que el token es valido
    const usuarioToken = await Usuario.findOne({ where: { token: tokenCuenta } });
    console.log(usuarioToken);
    if (!usuarioToken) {
        return res.render("templates/mensajes", {
            titulo: "Error al confirmar la cuenta",
            msg: `El código de verificación no es válido, por favor inténtalo de nuevo.`
        });
    }

    if (usuarioToken.tokenExpiracion && usuarioToken.tokenExpiracion < new Date()) {
        return res.render("templates/mensajes", {
            titulo: "Error al confirmar la cuenta",
            msg: `El token de confirmación ha expirado por seguridad (1 hora de límite).`
        });
    }

    // Actualizar los datos del usuario
    usuarioToken.token = null;
    usuarioToken.tokenExpiracion = null;
    usuarioToken.confirmado = true;
    await usuarioToken.save();

    res.render("templates/mensajes", {
        titulo: "Cuenta confirmada",
        msg: `La cuenta asociada al correo: ${usuarioToken.email}, se ha confirmado exitosamente`
    });
}

const formularioRecuperacion = (req, res) => {
    res.render("auth/recuperarPassword", { pagina: "Recupera tu contraseña" })
}


const autenticarUsuario = async (req, res) => {
    // Validación
    console.log("El usuario desea autenticarse en la plataforma...");
    const { emailUsuario, passwordUsuario } = req.body; 
    console.log(`Un usuario: ${emailUsuario} quiere ingresar al sistema...`);
    
    //Validacion de front (campos vacios)
    await check('emailUsuario').notEmpty().withMessage("El correo electrónico no puede estar vacío").isEmail().withMessage("El correo electrónico no tiene un formato adecuado").run(req);
    await check('passwordUsuario').notEmpty().withMessage("La contraseña no puede estar vacía").run(req);
    
    let resultadoValidacion = validationResult(req);
    if (!resultadoValidacion.isEmpty()) {
        return res.render("auth/login", {
            pagina: "Inicia sesión",
            errores: resultadoValidacion.array(),
            usuario: {
                email: emailUsuario
            }
        });
    }

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email: emailUsuario } })
    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Error al ingresar a la pagina',
            csrfToken: req.csrfToken(),
            errores: [{ msg: `No existe un usuario asociado a: ${emailUsuario}` }]
        })
    }

    // Comprobar si el usuario está confirmado
    if (!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Error al intentar ingresar a la plataforma',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Tu cuenta no está confirmada' }]
        })
    }

    // Comprobar si la cuenta está bloqueada
    if (usuario.bloqueado) {
        return res.render('auth/login', {
            pagina: 'Cuenta Bloqueada',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Tu cuenta ha sido bloqueada por exceso de intentos fallidos. Revisa tu correo electrónico para desbloquearla.' }]
        })
    }

    console.log("Validando contraseñas");

    if(!(await usuario.validarPassword(passwordUsuario))){
        usuario.intentosFallidos += 1;
        
        let errorMsg = 'Contraseña incorrecta, por favor intentalo de nuevo';
        
        if(usuario.intentosFallidos >= 5) {
            usuario.bloqueado = true;
            usuario.tokenDesbloqueo = generarToken();
            errorMsg = 'Tu cuenta ha sido bloqueada por exceso de intentos fallidos. Revisa tu correo.';
            
            // Send email
            emailCuentaBloqueada({
                nombre: usuario.nombre,
                email: usuario.email,
                token: usuario.tokenDesbloqueo
            });
        }
        
        await usuario.save();

        return res.render('auth/login', {
            pagina: 'Error al intentar ingresar a la plataforma',
            csrfToken: req.csrfToken(),
            errores: [{ msg: errorMsg }]
        });
    }

    // Autenticación correcta, resetear intentos fallidos
    usuario.intentosFallidos = 0;
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    // Guardar el usuario en session
    req.session.user = usuario;

    // Redirigir a 'Mis Propiedades'
    res.redirect('/mis-propiedades');
}

// FUNCIONES NUEVAS: Desbloqueo y Recuperación

const desbloquearCuenta = async (req, res) => {
    const { token } = req.params;

    const usuario = await Usuario.findOne({ where: { tokenDesbloqueo: token } });
    
    if (!usuario) {
        return res.render("templates/mensajes", {
            titulo: "Error al desbloquear la cuenta",
            msg: `El código de desbloqueo no es válido o ya fue utilizado.`
        });
    }

    usuario.bloqueado = false;
    usuario.intentosFallidos = 0;
    usuario.tokenDesbloqueo = null;
    await usuario.save();

    res.render("templates/mensajes", {
        titulo: "Cuenta Desbloqueada",
        msg: `Tu cuenta ha sido desbloqueada exitosamente. Ya puedes iniciar sesión.`,
        boton: { url: '/auth/login', texto: 'Iniciar Sesión' }
    });
}

const solicitarRecuperacion = async (req, res) => {
    // Validacion
    await check('emailUsuario').isEmail().withMessage('Debe ser un email válido').run(req);
    
    let resultadoValidacion = validationResult(req);
    if (!resultadoValidacion.isEmpty()) {
        return res.render('auth/recuperarPassword', {
            pagina: 'Recupera tu contraseña',
            csrfToken: req.csrfToken(),
            errores: resultadoValidacion.array()
        });
    }

    const { emailUsuario } = req.body;
    const usuario = await Usuario.findOne({ where: { email: emailUsuario } });

    if (!usuario) {
        return res.render('auth/recuperarPassword', {
            pagina: 'Error',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El correo electrónico no se encuentra registrado.' }]
        });
    }

    if (!usuario.confirmado) {
        return res.render('auth/recuperarPassword', {
            pagina: 'Error',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'primero debes de confirmar tu cuenta' }]
        });
    }

    // Generar nuevo token
    usuario.token = generarToken();
    usuario.tokenExpiracion = new Date(Date.now() + 3600000); // 1 hora de límite
    await usuario.save();

    // Enviar email
    emailOlvidePassword({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    });

    res.render("templates/mensajes", {
        titulo: "Correo enviado",
        msg: `Hemos enviado un correo a ${emailUsuario} con las instrucciones para restablecer tu contraseña.`
    });
}

const comprobarTokenPassword = async (req, res) => {
    const { token } = req.params;
    const usuario = await Usuario.findOne({ where: { token } });

    if (!usuario) {
        return res.render("templates/mensajes", {
            titulo: "Error",
            msg: `El código de recuperación no es válido.`
        });
    }

    if (usuario.tokenExpiracion && usuario.tokenExpiracion < new Date()) {
        return res.render("templates/mensajes", {
            titulo: "Error",
            msg: `El token de seguridad ha expirado por límite de tiempo (1 hora). Por favor solicita uno nuevo.`
        });
    }

    res.render('auth/reset-password', {
        pagina: 'Restablecer Tu Contraseña',
        csrfToken: req.csrfToken()
    });
}

const nuevoPassword = async (req, res) => {
    // Validar el password
    await check('passwordUsuario').isLength({ min: 8 }).withMessage('El password debe ser de al menos 8 caracteres').run(req);
    
    let resultadoValidacion = validationResult(req);
    if (!resultadoValidacion.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Restablecer Tu Contraseña',
            csrfToken: req.csrfToken(),
            errores: resultadoValidacion.array()
        });
    }

    const { token } = req.params;
    const { passwordUsuario } = req.body;

    const usuario = await Usuario.findOne({ where: { token } });

    if (!usuario) {
        return res.render("templates/mensajes", {
            titulo: "Error",
            msg: `El token no es válido.`
        });
    }

    if (usuario.tokenExpiracion && usuario.tokenExpiracion < new Date()) {
        return res.render("templates/mensajes", {
            titulo: "Error",
            msg: `El token de recuperación ha vencido por caducidad (límite 1 hora). Por favor solicita uno nuevo.`
        });
    }

    // Actualizar password
    usuario.password = passwordUsuario; // trigger hashing in model before update? Wait, we might need a little logic here
    // In Usuario model, we only hash on beforeCreate! Let's check model.
    // WAIT: Model only has `beforeCreate`. If we update password, we must hash it.
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(passwordUsuario, salt);
    
    usuario.token = null;
    await usuario.save();

    res.render("templates/mensajes", {
        titulo: "Contraseña Restablecida",
        msg: `Tu contraseña ha sido guardada correctamente.`,
        boton: { url: '/auth/login', texto: 'Iniciar Sesión' }
    });
}

export {
    formularioLogin,
    formularioRegistro,
    formularioPassword,
    perfilGithub,
    registrarUsuario,
    paginaConfirmacion,
    formularioRecuperacion,
    autenticarUsuario,
    desbloquearCuenta,
    solicitarRecuperacion,
    comprobarTokenPassword,
    nuevoPassword     
}