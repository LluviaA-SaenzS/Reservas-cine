import express from "express";
import { getPeliculas, insertarPelicula } from "../controllers/peliculasController.js";
import { upload } from "../multerConfig.js";

const router = express.Router();

router.get("/", getPeliculas);


router.post("/", upload.single("imagen_pelicula"), insertarPelicula);

export default router;

