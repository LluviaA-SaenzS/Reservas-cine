import { db } from "../db.js";

export const getHorarios = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        f.id_funcion,
        p.titulo,
        h.hora_inicio,
        h.hora_fin,
        s.numero_sala,
        c.nombre AS cine,
        f.fecha
      FROM funciones f
      JOIN peliculas p ON f.id_pelicula = p.id_pelicula
      JOIN horarios h ON f.id_horario = h.id_horario
      JOIN salas s ON f.id_sala = s.id_sala
      JOIN cines c ON s.id_cine = c.id_cine
      WHERE f.fecha = CURDATE()
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los horarios" });
  }
};
