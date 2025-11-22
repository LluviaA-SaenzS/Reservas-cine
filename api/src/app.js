import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cinesRouter from "./routes/cines.js";
import peliculasRouter from "./routes/peliculas.js";
import funcionesRouter from "./routes/funciones.js";
import salasRouter from "./routes/salas.js";

dotenv.config();

const app = express();

// Configurar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Debug para verificar
console.log("📁 Carpeta uploads:", path.join(__dirname, "..", "uploads"));

// Rutas
app.use("/api/cines", cinesRouter);
app.use("/api/peliculas", peliculasRouter);
app.use("/api/funciones", funcionesRouter);
app.use("/api/salas", salasRouter);

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:" + PORT);
});