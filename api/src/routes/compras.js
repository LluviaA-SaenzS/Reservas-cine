import express from "express";
import { 
  crearCompra, 
  getRecibo, 
  getComprasCliente 
} from "../controllers/comprasController.js";

const router = express.Router();

// Crear una compra (genera recibo + detalles)
router.post("/", crearCompra);

// Obtener un recibo específico
router.get("/recibo/:id_recibo", getRecibo);

// Obtener historial de compras de un cliente
router.get("/cliente/:id_cliente", getComprasCliente);

export default router;