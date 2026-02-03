import express from "express";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.get("/", (req, res) => {
    console.log("Saludos desde la web");
    res.json({
        status: 200,
        message: "Solicitud recibido"
    })
})

app.get("/login", (req, res) => {
    console.log("El usuario desea acceder al sistema");
    res.status(200).send(`<h1>Bienvenido al sistema</h1>
 <form>
    <input type="text" placeholder="Usuario" />
    <input type="password" placeholder="Contraseña" />
    <button type="submit">Iniciar Sesión</button>
 </form>`
    );
})

app.get("/saludo/:nombre", (req, res) => {
    const { nombre } = req.params;
    console.log(`El usuario: ${nombre}`)
    res.status(200).send(`<p>Bienvenido <b>${nombre}</b></p> </h1`)
})

app.listen(PORT, () => {
    console.log(`El servidor esta iniciando en el puerto ${PORT}`);
});