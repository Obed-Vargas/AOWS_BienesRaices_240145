import { check, validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';

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
    console.log("Intenyando registrar a un Usuario Nuevo con los datos del formulario:");
    console.log(req.body);

    //Validación de los datos del formulario previo a registro en la BD
    //Definir las reglas de validación
    await check('nombreUsuario').notEmpty().withMessage("El nombre de la persona no puede ser vacio").run(req);
    await check('emailUsuario').notEmpty().withMessage("El correo electrónico no puede ser vació").isEmail().withMessage("El correo electrónico no tiene un formato adecuado").run(req);
    await check('passwordUsuario').notEmpty().withMessage("La contraseña no puede estar vacía").isLength({ min: 8, max: 30 }).withMessage("La longitud de la contraseña debe ser entre 8 y 30 caracterés").run(req);
    await check('confirmacionUsuario').equals(req.body.passwordUsuario).withMessage("Ambas contraseñas deben ser iguales").run(req);

    //Aplicamos la reglas definidas
    let resultadoValidacion = validationResult(req);

    // Validar si hay errores en la recepción de datos, si no mandar a bd

    // 2. Verificar si hay errores
    if (!resultadoValidacion.isEmpty()) {
        // HAY ERRORES: Volvemos al formulario
        return res.render("auth/registro", {
            pagina: "Error al intentar crear una cuenta.",
            // Enviamos solo el mensaje de texto para que Pug lo lea bien
            errores: resultadoValidacion.array().map(err => err.msg), 
            usuario: { 
                nombreUsuario: req.body.nombreUsuario, 
                emailUsuario: req.body.emailUsuario 
            }
        });
    }

    // 3. NO HAY ERRORES: Intentar guardar en la BD
    try {
        const { nombreUsuario, emailUsuario, passwordUsuario } = req.body;

        const usuario = await Usuario.create({
            nombre: nombreUsuario, // <-- CAMBIO CLAVE: Usa 'nombre' si así está en tu modelo
            email: emailUsuario,
            password: passwordUsuario
        });

        return res.json(usuario);

    } catch (error) {
        console.error(error);
        return res.render("auth/registro", {
            pagina: "Error en el servidor",
            errores: ["Hubo un error al intentar guardar el registro."],
            usuario: { 
                nombreUsuario: req.body.nombreUsuario, 
                emailUsuario: req.body.emailUsuario 
            }
        });
    }
}



export { formularioLogin, formularioRegistro, formularioPassword, perfilGithub, registrarUsuario }