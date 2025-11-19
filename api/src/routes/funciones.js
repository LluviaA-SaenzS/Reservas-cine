import express from "express";
import { getFunciones } from "../controllers/funcionesController.js";

const router = express.Router();

router.get("/", getFunciones);

export default router;
