import { db } from "../db.js";

export const getPeliculas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_pelicula, titulo, sinopsis, duracion_minutos, clasificacion, fecha_estreno 
      FROM peliculas
      ORDER BY fecha_estreno DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las películas" });
  }
};
