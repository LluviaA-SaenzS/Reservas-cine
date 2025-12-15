import { db } from "../db.js";
import bcrypt from "bcrypt";  // npm install bcrypt


// Registrar nuevo cliente
export const registrarCliente = async (req, res) => {
  try {
    const { nombre, apellidos, correo, password, telefono, fecha_nacimiento } = req.body;

    // Validar datos
    if (!nombre || !apellidos || !correo || !password || !telefono || !fecha_nacimiento) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar si el correo ya existe
    const [existe] = await db.query(
      'SELECT id_cliente FROM clientes WHERE correo = ?',
      [correo]
    );

    if (existe.length > 0) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar cliente
    const [result] = await db.query(`
      INSERT INTO clientes 
      (nombre, apellidos, correo, password, telefono, fecha_nacimiento, fecha_registro)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [nombre, apellidos, correo, passwordHash, telefono, fecha_nacimiento]);

    res.json({ 
      message: "Registro exitoso",
      id_cliente: result.insertId
    });

  } catch (error) {
    console.error("Error al registrar cliente:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

// Iniciar sesión
export const loginCliente = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
    }

    // Buscar cliente por correo o nombre
    const [clientes] = await db.query(`
      SELECT * FROM clientes 
      WHERE correo = ? OR nombre = ?
    `, [usuario, usuario]);

    if (clientes.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const cliente = clientes[0];

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, cliente.password);

    if (!passwordValida) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // ⭐ Login exitoso - Enviar datos del cliente (sin password)
    res.json({
      message: "Login exitoso",
      cliente: {
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre,
        apellidos: cliente.apellidos,
        correo: cliente.correo,
        telefono: cliente.telefono,
        fecha_nacimiento: cliente.fecha_nacimiento
      }
    });

  } catch (error) {
    console.error("Error al hacer login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// Obtener datos del cliente
export const getCliente = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const [cliente] = await db.query(
      'SELECT id_cliente, nombre, apellidos, correo, telefono, fecha_nacimiento, fecha_registro FROM clientes WHERE id_cliente = ?',
      [id_cliente]
    );

    if (!cliente.length) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(cliente[0]);

  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({ error: "Error al obtener datos del cliente" });
  }
};

// Buscar cliente por email (para la compra)
export const buscarClientePorEmail = async (req, res) => {
  const { email } = req.query;

  try {
    const [cliente] = await db.query(
      'SELECT id_cliente, nombre, apellidos, correo FROM clientes WHERE correo = ?',
      [email]
    );

    if (!cliente.length) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(cliente[0]);

  } catch (error) {
    console.error("Error al buscar cliente:", error);
    res.status(500).json({ error: "Error al buscar cliente" });
  }
};