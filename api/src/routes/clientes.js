import express from "express";
import { 
  registrarCliente, 
  loginCliente, 
  getCliente,
  buscarClientePorEmail
} from "../controllers/clientesController.js";

const router = express.Router();

router.post("/register", registrarCliente);
router.post("/login", loginCliente);
router.get("/buscar", buscarClientePorEmail);
router.get("/:id_cliente", getCliente);

export default router;