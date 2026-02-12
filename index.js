import express from "express";
import usuarioRoutes from './routes/usuarioRoutes.js'

const app = express();

//habilitamos PUG
app.set("view engine", "pug")
app.set("views", "./views")

//Definimos la carpeta publica
app.use(express.static('public'))

app.use("/auth",usuarioRoutes)

app.get("/",usuarioRoutes)
app.use("/",usuarioRoutes)


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`El servidor esta iniciando en el puerto ${PORT}`)
})
