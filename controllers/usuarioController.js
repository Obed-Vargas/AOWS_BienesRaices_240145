import Usuario from "../models/Usuario.js";

const formularioLogin = (req, res) => {
    res.render('auth/login', { pagina: 'Iniciar Sesión' })
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', { pagina: 'Registrarse con nosotros' })
}

const registrarUsuario = async (req, res) => {
    console.log("intentando registrar a un usuario nuevo con os datos del formulario");
    console.log(req.body);
    const data =
    {
        nombre: req.body.nombreUsuario,
        email: req.body.emailUsuario,
        password: req.body.passwordUsuario
    }
    try {
        const usuario = await Usuario.create(data);
        res.json({ status: 201, message: "Usuario registrado correctamente", usuario });
    } catch (error) {
        console.error("❌ Error al registrar usuario:", error.message);
        res.status(500).json({ status: 500, message: error.message });
    }
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/recuperarContraseña', { pagina: 'Recuperar mi contraseña' })
}

export { formularioLogin, formularioRegistro, formularioOlvidePassword, registrarUsuario }