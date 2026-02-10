import express from "express";
import usuarioRoutes from './routes/usuarioRoutes.js'

const app = express();


app.get("/",usuarioRoutes)
app.use("/",usuarioRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`El servidor esta iniciando en el puerto ${PORT}`)
})
