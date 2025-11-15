import express from "express";
import { obtenerCines } from "../controllers/cinesController.js";

const router = express.Router();

router.get("/", obtenerCines);

export default router;

