import express from "express";
import { getRecibo } from "../controllers/recibosController.js";

const router = express.Router();

router.get("/", getRecibo);

export default router;