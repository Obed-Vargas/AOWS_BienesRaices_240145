import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { generarToken } from '../lib/token.js';
import { emailRegistro, emailResetearPassword } from '../lib/emails.js';


const formularioLogin = (req, res) => {
    res.render("auth/login", {
        pagina: "Inicia sesión",
        csrfToken: req.csrfToken()
    })
}
const formularioRegistro = (req, res) => {
    res.render("auth/registro", {
        pagina: "Registrate con nosotros :)",
        csrfToken: req.csrfToken()
    })
}

const formularioPassword = (req, res) => {
    res.render("auth/recuperarPassword", {
        pagina: "Recupera tu contraseña",
        csrfToken: req.csrfToken()
    })
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
            csrfToken: req.csrfToken(),
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
            token: generarToken()
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
            csrfToken: req.csrfToken(),
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
    res.render("auth/recuperarPassword", { pagina: "Ingresa tu correo" })
}

const formularioActualizacionPassword = async (req, res) => {
    console.log(req.body)
    const {token} = req.params;
    console.log(`el usuario con token: ${token} esta intentando actualizr su contraseña`)

    const usuarioSolicitante = await Usuario.findOne({ where: { token } });
    if(usuarioSolicitante) {
        console.log(`el usuario dueño del token es: ${usuarioSolicitante.email}`);
    }

    res.render("auth/reastrearPassword", {
        pagina: "Reestablece tu contraseña",
        csrfToken: req.csrfToken(),
        token
    })
}

const actualizarPassword = async (req, res) => {
    // Validar los campos
    const { password_actual, password, token } = req.body;

    await check('password_actual').notEmpty().withMessage('La contraseña actual es obligatoria').run(req);
    await check('password').isLength({ min: 8 }).withMessage('La nueva contraseña debe ser de al menos 8 caracteres').run(req);

    let resultado = validationResult(req);

    // Verificar si hay errores de validación
    if (!resultado.isEmpty()) {
        return res.render('auth/reastrearPassword', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            token
        });
    }

    // Identificar al usuario por el token
    const usuario = await Usuario.findOne({ where: { token } });

    if (!usuario) {
        return res.render('auth/reastrearPassword', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Hubo un error al intentar validar tu información, intenta de nuevo.' }],
            token
        });
    }

    // Verificar la contraseña actual
    const passwordValido = await bcrypt.compare(password_actual, usuario.password);
    if (!passwordValido) {
        return res.render('auth/reastrearPassword', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'La contraseña actual es incorrecta' }],
            token
        });
    }

    // Hashear el nuevo password y guardar cambios
    usuario.password = password;
    usuario.token = null;
    await usuario.save();

    res.render('templates/mensajes', {
        titulo: 'Password Reestablecido',
        msg: 'El password se guardó correctamente'
    });
}

const resetearPassword = async (req, res) => {
    const { emailUsuario } = req.body;

    //Validaciones del frontend
    await check('emailUsuario').notEmpty().withMessage('El correo electrónico no puede ser vacio')
    .isEmail().withMessage('El correo electrónico no tiene un formato adecuado').run(req); 

    //Aplicar las validaciones
    let resultadoValidacion = validationResult(req);

    if(!resultadoValidacion.isEmpty())
    {
        res.render("auth/recuperarPassword", {
            pagina: "Error, correo invalido",
            errores: resultadoValidacion.array(),
            usuario: {emailUsuario: emailUsuario}
        })
    }

    // Identificar el usuario
    const usuario = await Usuario.findOne({ where: { email: emailUsuario } });

    if (!usuario) {
        return res.render("auth/recuperarPassword", {
            pagina: "Recupera tu contraseña",
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'este correo no existe' }]});
    }




    // Validación 2
    if (!usuario.confirmado) {
        return res.render('auth/recuperarPassword', {
            pagina: "Recupera tu contraseña",
            csrfToken: req.csrfToken(),
            errores: [{ msg: `La cuenta asociada al correo: ${emailUsuario}, no ha sido validada.` }]
        });
    }
    // Generar un nuevo token
    usuario.token = generarToken();
    await usuario.save();

    //enviar el codigo por correo
    emailResetearPassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })
    //responder con una vista de correo enviado
    res.render('templates/mensajes', {
        titulo: 'Reestablece tu Password',
        msg: 'Hemos enviado un email con las instrucciones'
    });
}

const nuevoPassword = async (req, res) => {
    // Validar el email y el password
    const { email, password } = req.body;
    const { token } = req.params;

    await check('email').isEmail().withMessage('Eso no parece un email').run(req);
    await check('password').isLength({ min: 8 }).withMessage('El password debe ser de al menos 8 caracteres').run(req);

    let resultado = validationResult(req);

    // Verificar si hay errores
    if (!resultado.isEmpty()) {
        return res.render('auth/reastrearPassword', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }

    // Identificar quién hace el cambio
    const usuario = await Usuario.findOne({ where: { token, email } });

    if (!usuario) {
        return res.render('auth/reastrearPassword', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El correo no coincide con el token solicitado o el token no es válido' }]
        });
    }

    // Hashear el nuevo password y guardar cambios
    usuario.password = password;
    usuario.token = null;
    await usuario.save();

    res.render('templates/mensajes', {
        titulo: 'Password Reestablecido',
        msg: 'El password se guardó correctamente'
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
    resetearPassword,
    formularioActualizacionPassword,
    nuevoPassword,
    actualizarPassword
}