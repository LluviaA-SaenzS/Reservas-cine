import express from "express";
import { getDescuento } from "../controllers/descuentosController.js";

const router = express.Router();

router.get("/", getDescuento);

export default router;