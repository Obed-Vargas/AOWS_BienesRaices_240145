import 'dotenv/config';
import express from "express";
import passport from "./config/passport.js";
import usuarioRoutes from './routes/usuarioRoutes.js';
import { connectDB } from "./config/db.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import csurf from "@dr.pogodin/csurf";

const app = express();

//habilitamos PUG
app.set("view engine", "pug")
app.set("views", "./views")

//Definimos la carpeta publica
app.use(express.static('public'))

//habilitamos lectura de datos a traves de request
app.use(express.urlencoded({ extended: true }))

//activamos la opcion para maniular la cookie - almacenamiento en el cliente (navegador)
app.use(cookieParser());
app.use(express.json());

//definimos el middleware
app.use(session({
    secret: process.env.SESSION_SECRET || "BienesRaices_240145_csrf_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    }
}));


//Habiotamos el mecanismo para proeccion de CSRF
app.use(csurf())

//habilitar los tokens de csrf para cualquier formulario
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
})


// ─── Sesiones (requerido para OAuth) ──────────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'secreto_bienesraices',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

// ─── Passport ─────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", usuarioRoutes)
app.get("/", usuarioRoutes)
app.use("/", usuarioRoutes)

await connectDB();


app.listen(process.env.PORT || 3000, () => {
    console.log(`El servidor esta iniciando en el puerto ${process.env.PORT || 3000}`)
})
