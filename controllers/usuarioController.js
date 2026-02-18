const formularioLogin = (req, res) => {
    res.render('auth/login', {pagina: 'Iniciar Sesión'})
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro',{pagina: 'Registrarse con nosotros'})
}

export { formularioLogin, formularioRegistro }