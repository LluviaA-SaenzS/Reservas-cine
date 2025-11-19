import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cinesRouter from "./routes/cines.js";
import peliculasRouter from "./routes/peliculas.js";
import funcionesRouter from "./routes/funciones.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/cines", cinesRouter);
app.use("/api/peliculas", peliculasRouter);
app.use("/api/funciones", funcionesRouter);


const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:" + PORT);
});
