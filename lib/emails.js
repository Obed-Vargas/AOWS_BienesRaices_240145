import nodemailer from "nodemailer";

const emailPlantilla = ({ nombre, token, actionUrl, titulo, descripcion, botonTexto }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo}</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background-color: #f3f4f6; padding: 20px; color: #374151; }
        .container { max-widh: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(to right, #4f46e5, #ec4899); padding: 30px; text-align: center; color: white; font-size: 24px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .btn { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Bienes Raíces</div>
        <div class="content">
            <h2 style="color: #111827;">Hola ${nombre},</h2>
            <p>${descripcion}</p>
            <div style="text-align: center;">
                <a href="${actionUrl}" class="btn">${botonTexto}</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Si no solicitaste esto, puedes ignorar este mensaje.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} Bienes Raíces. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
`;

const getTransport = () => nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos
    const actionUrl = `http://localhost:${process.env.PORT || 3000}/auth/confirma/${token}`;
    
    await getTransport().sendMail({
        from: "BienesRaices-240145.com",
        to: email,
        subject: `Bienvenido a Bienes Raíces - Confirma tu cuenta`,
        html: emailPlantilla({
            nombre,
            token,
            actionUrl,
            titulo: 'Confirma tu Cuenta',
            descripcion: 'Tu cuenta ya está casi lista, solo debes de confirmarla haciendo clic en el siguiente enlace:',
            botonTexto: 'Confirmar Cuenta'
        })
    });
}

const emailOlvidePassword = async (datos) => {
    const { email, nombre, token } = datos
    const actionUrl = `http://localhost:${process.env.PORT || 3000}/auth/olvide-password/${token}`;
    
    await getTransport().sendMail({
        from: "BienesRaices-240145.com",
        to: email,
        subject: `Restablece tu contraseña - Bienes Raíces`,
        html: emailPlantilla({
            nombre,
            token,
            actionUrl,
            titulo: 'Restablecer Contraseña',
            descripcion: 'Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:',
            botonTexto: 'Restablecer Contraseña'
        })
    });
}

const emailCuentaBloqueada = async (datos) => {
    const { email, nombre, token } = datos
    const actionUrl = `http://localhost:${process.env.PORT || 3000}/auth/desbloquear/${token}`;
    
    await getTransport().sendMail({
        from: "BienesRaices-240145.com",
        to: email,
        subject: `ALERTA DE SEGURIDAD: Cuenta bloqueada en Bienes Raíces`,
        html: emailPlantilla({
            nombre,
            token,
            actionUrl,
            titulo: 'Cuenta Bloqueada',
            descripcion: 'Hemos detectado múltiples intentos fallidos de inicio de sesión en tu cuenta, por lo cual tu cuenta ha sido bloqueada por seguridad. Para desbloquearla, haz clic en el siguiente botón:',
            botonTexto: 'Desbloquear Mi Cuenta'
        })
    });
}

export { emailRegistro, emailOlvidePassword, emailCuentaBloqueada }