import express from "express";
import passport from "passport";
import { formularioLogin, formularioRegistro, formularioPassword,
    registrarUsuario, paginaConfirmacion, autenticarUsuario,
    desbloquearCuenta, solicitarRecuperacion, comprobarTokenPassword, nuevoPassword } from "../controllers/usuarioController.js";

const router = express.Router();

//definir los endpoints GET
router.get("/login", formularioLogin);
router.post("/login", autenticarUsuario); // Nuevo: Maneja el POST del login
router.get("/registro", formularioRegistro);
router.get("/recuperarPassword", formularioPassword);
router.get("/confirma/:token", paginaConfirmacion)
router.get("/desbloquear/:token", desbloquearCuenta)


// ─── Rutas Google OAuth ────────────────────────────────────────────────────
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/registro' }),
    (req, res) => res.redirect('/mis-propiedades')
);

// ─── Rutas GitHub OAuth ────────────────────────────────────────────────────
router.get('/github',
    passport.authenticate('github', { scope: ['user:email'], prompt: 'consent' })
);
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/auth/registro' }),
    (req, res) => res.redirect('/mis-propiedades')
);

// ─── Ruta de Perfil Detallado ─────────────────────────────────────────────
router.get('/perfil', (req, res) => {
    if (!req.user) return res.redirect('/auth/login');
    res.render('auth/perfil', {
        pagina: 'Mi Perfil de GitHub',
        usuario: req.user
    });
});

// --- Fin rutas OAuth ---



router.post("/registro", registrarUsuario);
router.post("/login", autenticarUsuario); 

router.get("/", (req, res) => {
    res.redirect('/auth/login')
})

router.get("/mis-propiedades", (req, res) => {
    // Si viene de Local login, la sesion tiene req.session.user
    // Si viene de OAuth, Passport pone al usuario en req.user
    const usuarioLogueado = req.session.user || req.user;
    
    if (!usuarioLogueado) {
        return res.redirect('/auth/login');
    }

    res.render('propiedades/mis-propiedades', {
        pagina: 'Mis Propiedades',
        usuario: usuarioLogueado
    });
});

// ─── Logout ───────────────────────────────────────────────────────────────
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Destroy the session cookie completely
            res.redirect('/auth/login');
        });
    });
});

router.get("/olvide-password", formularioPassword);
router.post("/olvide-password", solicitarRecuperacion);
router.get("/olvide-password/:token", comprobarTokenPassword);
router.post("/olvide-password/:token", nuevoPassword);


router.get("/saludo/:nombre", (req, res) => {
    const { nombre } = req.params;
    console.log(`El usuario: ${nombre}`)
    res.status(200).send(`<p>Bienvenido <b>${nombre}</b></p> </h1>`)
})

export default router;

router.post("/", (req, res) => {
    console.log("Bienvenido al sistema de raices");
    console.log("Procesando una peticion de tipo POST")
    res.json({
        status: 400,
        message: "lo sentimos, no se puede aceptan peticiones POST"
    })
})

router.post("/createUser", (req, res) => {
    console.log("Se a solicitado una creacion de usuario");
    const nuevoUsuario =
    {
        nombre: "Obed Vargas Luna",
        correo: "obed@gmail.com"
    }

    res.json({
        status: 200,
        message: `Solicitud ha solicitado la creacion de un nuevo usuario con el nombre de ${nuevoUsuario.nombre} y el correo ${nuevoUsuario.correo} `

    })
})

//Ejemplo de un ENDPOINT PUT 
router.put("/updateUser", (req, res) => {
    console.log("Se a solicitado la actualizacion de datos del usuario, tiempo PUT una actualizacion completa");
    console.log("Procesando una peticion de tipo PUT")
    const usuario = {
        nombre: "Obed Vargas Luna",
        correo: "obed@gmail.com"
    }
    const usuarioActualizado = {
        nombre: "francisco Ojeda",
        correo: "franciscoojeda@gmail.com"
    }
    res.json({
        status: 200,
        message: `se a solicitado la actualizacion completa de los datos de usuario de nombre: ${usuario.nombre} y correo: ${usuario.correo}= ${usuarioActualizado.nombre} y correo: ${usuarioActualizado.correo}`
    })
})


//Ejemplo de un ENDPOINT PATCH
router.patch("/updatePassword/:nuevoPassword", (req, res) => {
    console.log("Se a solicitado la actualizacion de datos de la contraseña, siendo PATCH una actualizacion parcial");
    console.log("Procesando una peticion de tipo PATCH")
    const usuario = {
        nombre: "Obed Vargas Luna",
        correo: "obed@gmail.com",
        password: "abcde"
    }
    const nuevoPassword = req.params.nuevoPassword;
    res.json({
        status: 200,
        message: `se a solicitado la actualizacion parcail de la contraseña del usuario de nombre: ${usuario.nombre} y correo: ${usuario.correo} del password: ${usuario.password} = a ${nuevoPassword}`
    })
})

//Ejemplo de un ENDPOINT del tipo DELETE

router.delete("/deleteProperty/:id", (req, res) => {

    console.log("Procesando una peticion de tipo DELETE");
    const { id } = req.params;

    res.json({
        status: 200,
        message: `se a solicitado la eliminacion de la propiedad con id: ${id}`
    })
})