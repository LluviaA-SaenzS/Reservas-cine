import express from "express";
import { getSalas } from "../controllers/salasController.js";

const router = express.Router();

router.get("/", getSalas);

export default router;
