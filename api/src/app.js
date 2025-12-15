import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cinesRouter from "./routes/cines.js";
import peliculasRouter from "./routes/peliculas.js";
import funcionesRouter from "./routes/funciones.js";
import salasRouter from "./routes/salas.js";
import recibosRouter from "./routes/recibos.js";
import descuentosRouter from "./routes/descuentos.js";
import comprasRouter from "./routes/compras.js";
import clientesRouter from "./routes/clientes.js"; 

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
app.use("/api/recibos", recibosRouter);
app.use("/api/descuentos", descuentosRouter);
app.use("/api/compras", comprasRouter); 
app.use("/api/clientes", clientesRouter);

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:" + PORT);
});