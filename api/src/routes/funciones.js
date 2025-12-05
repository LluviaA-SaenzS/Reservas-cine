import express from "express";
import { 
  getFuncionCompra,
  getFunciones, 
  insertarFuncion,
  getAsientosFuncion,
  reservarAsientos
} from "../controllers/funcionesController.js";

const router = express.Router();


router.post("/", insertarFuncion);  // POST /api/funciones
router.get("/", getFunciones);       // GET /api/funciones
router.get("/:id_funcion", getFuncionCompra);
router.get("/:id_funcion/asientos", getAsientosFuncion);
router.post("/:id_funcion/reservar", reservarAsientos);

export default router;
