import express from "express";
import { obtenerCines } from "C:\Users\PC1\OneDrive - Instituto Tecnologico de Durango\Escritorio\Proyecto Cine\Reservas-cine\api\src\controllers\cinesController.js";

const router = express.Router();

router.get("/", obtenerCines);

export default router;

