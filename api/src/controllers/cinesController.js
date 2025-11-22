import { db } from "../db.js";

export const getCines = async (req, res) => {
  try {
    const [cines] = await db.query(`
      SELECT id_cine, nombre, direccion, municipio, telefono
      FROM cines
      ORDER BY municipio, nombre
    `);

    res.json(cines);
  } catch (error) {
    console.error("Error al obtener cines:", error);
    res.status(500).json({ error: "Error al obtener cines" });
  }
};



