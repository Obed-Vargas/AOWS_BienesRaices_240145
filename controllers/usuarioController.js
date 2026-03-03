import { check, validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import { generarToken } from '../lib/token.js';
import { emailRegistro } from '../lib/emails.js';


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
    res.render("auth/recuperarPassword", { pagina: "Recupera tu contraseña" })
}


export {
    formularioLogin,
    formularioRegistro,
    formularioPassword,
    perfilGithub,
    registrarUsuario,
    paginaConfirmacion,
    formularioRecuperacion
}