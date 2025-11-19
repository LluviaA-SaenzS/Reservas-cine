import { db } from "../db.js";


export const getSalas = async (req, res) => {
  try {
    const { id_cine } = req.query; // ⭐ Recibir filtro opcional

    let query = `
      SELECT 
        s.id_sala,
        s.id_cine,
        s.numero_sala,
        s.capacidad,
        s.tipo,
        c.nombre as nombre_cine
      FROM salas s
      JOIN cines c ON s.id_cine = c.id_cine
    `;

    const params = [];

    // ⭐ Si viene id_cine, filtrar por ese cine
    if (id_cine) {
      query += ` WHERE s.id_cine = ?`;
      params.push(id_cine);
    }

    query += ` ORDER BY s.numero_sala`;

    const [salas] = await db.query(query, params);
    res.json(salas);

  } catch (error) {
    console.error("Error al obtener salas:", error);
    res.status(500).json({ error: "Error al obtener salas" });
  }
};

// Obtener una sala específica
export const getSala = async (req, res) => {
  try {
    const { id_sala } = req.params;

    const [sala] = await db.query(`
      SELECT 
        s.id_sala,
        s.id_cine,
        s.numero_sala,
        s.capacidad,
        s.tipo,
        c.nombre as nombre_cine,
        c.direccion
      FROM salas s
      JOIN cines c ON s.id_cine = c.id_cine
      WHERE s.id_sala = ?
    `, [id_sala]);

    if (!sala.length) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    res.json(sala[0]);

  } catch (error) {
    console.error("Error al obtener sala:", error);
    res.status(500).json({ error: "Error al obtener sala" });
  }
};
