const formularioLogin = (req, res) => {
    res.render('auth/login', { pagina: 'Iniciar Sesión' })
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', { pagina: 'Registrarse con nosotros' })
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/recuperarContraseña', { pagina: 'Recuperar mi contraseña' })
}

export { formularioLogin, formularioRegistro, formularioOlvidePassword }