import express from "express";
import { getCines } from "../controllers/cinesController.js";

const router = express.Router();

router.get("/", getCines);

export default router;

