import express from "express";
import session from "express-session";
import passport from "./config/passport.js";
import usuarioRoutes from './routes/usuarioRoutes.js';
import { connectDB } from "./config/db.js";

const app = express();

//habilitamos PUG
app.set("view engine", "pug")
app.set("views", "./views")

//Definimos la carpeta publica
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`El servidor esta iniciando en el puerto ${PORT}`)
})
