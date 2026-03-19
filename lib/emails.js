import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    const { email, nombre, token } = datos

    await transport.sendMail({
        from: "BienesRaices-240145.com",
        to: email,
        subject: `Bienvenido al sistema de Bienes Raíces - Confirma tu cuenta`,

        html: `
            <p> Hola ${nombre}, comprueba tu cuenta en BienesRaices-240145.com </p>
            <hr>
            <p> Tu cuenta ya esta lista, solo debes de confirmarla en el siguiente enlace:
            <a href="localhost:${process.env.PORT}/auth/confirma/${token}">Confirmar Cuenta</a></p>
            <p>En caso de que no seas tu quien creo esta cuenta ignora el correo electronico.</p>`
    })
}

const emailResetearPassword = async (datos) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    const { email, nombre, token } = datos

    await transport.sendMail({
        from: "BienesRaices-240145.com",
        to: email,
        subject: `Recupera tu contraseña en Bienes Raíces`,

        html: `
            <p> Hola ${nombre}, has solicitado reestablecer tu contraseña en BienesRaices-240145.com </p>
            <hr>
            <p> Sigue el siguiente enlace para generar una nueva contraseña:
            <a href="localhost:${process.env.PORT}/auth/olvide-password/${token}">Reestablecer Contraseña</a></p>
            <p>En caso de que no hayas solicitado esto ignora el correo electronico.</p>`
    })
}


export { emailRegistro, emailResetearPassword }