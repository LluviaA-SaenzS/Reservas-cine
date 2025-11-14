import express from "express";
import { getPeliculas } from "../controllers/peliculasController.js";

const router = express.Router();

router.get("/", getPeliculas);

export default router;
