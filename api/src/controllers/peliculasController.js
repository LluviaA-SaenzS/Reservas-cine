import { db } from "../db.js";

export const getPeliculas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_pelicula, titulo, sinopsis, duracion_minutos, clasificacion, fecha_estreno, idioma, subtitulos 
      FROM peliculas
      ORDER BY fecha_estreno DESC
    `);

    
    const peliculas = rows.map(p => ({
      ...p,
      idioma: JSON.parse(p.idioma || "[]"),
      subtitulos: JSON.parse(p.subtitulos || "[]")
    }));

    res.json(peliculas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las películas" });
  }
};



export const insertarPelicula = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      titulo,
      duracion_minutos,
      clasificacion,
      sinopsis,
      fecha_estreno,
      generos,
      idioma,
      subtitulos
    } = req.body;

    // Convertir a arrays
    const idiomaArray = Array.isArray(idioma) ? idioma : [];
    const subtitulosArray = Array.isArray(subtitulos) ? subtitulos : [];
    const generosArray = Array.isArray(generos) ? generos : [];

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO peliculas 
       (titulo, duracion_minutos, clasificacion, sinopsis, idioma, subtitulos, fecha_estreno, imagen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        duracion_minutos,
        clasificacion,
        sinopsis,
        JSON.stringify(idiomaArray),
        JSON.stringify(subtitulosArray),
        fecha_estreno,
        req.file ? `/uploads/${req.file.filename}` : null
      ]
    );

    const idPelicula = result.insertId;

   
    for (const idGenero of generosArray) {
      await connection.query(
        `INSERT INTO peliculas_generos (id_pelicula, id_genero)
         VALUES (?, ?)`,
        [idPelicula, idGenero]
      );
    }

    await connection.commit();
    res.json({ message: "Película insertada correctamente" });

  } catch (error) {
    console.error("Error al insertar película:", error);
    await connection.rollback();
    res.status(500).json({ error: "Error al insertar película", detalle: error.message });
  } finally {
    connection.release();
  }
};

