import express from "express";
import { getHorarios } from "../controllers/horariosController.js";

const router = express.Router();

router.get("/", getHorarios);

export default router;
