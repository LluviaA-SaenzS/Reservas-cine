import { db } from "../db.js";

export const getAsientosFuncion = async (req, res) => {
  const { id_funcion } = req.params;

  try {
    const [asientos] = await db.query(`
      SELECT 
        a.id_asiento,
        a.fila,
        a.numero,
        a.tipo_asiento,
        fa.disponible
      FROM asientos a
      JOIN funciones_asientos fa ON a.id_asiento = fa.id_asiento
      WHERE fa.id_funcion = ?
      ORDER BY a.fila, a.numero
    `, [id_funcion]);

    res.json(asientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener asientos" });
  }
};

export const reservarAsientos = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id_funcion, asientos } = req.body; // asientos: [id_asiento1, id_asiento2, ...]

    await connection.beginTransaction();

    // Verificar que todos los asientos estén disponibles
    const [disponibles] = await connection.query(`
      SELECT id_asiento, disponible
      FROM funciones_asientos
      WHERE id_funcion = ?
        AND id_asiento IN (?)
        AND disponible = TRUE
      FOR UPDATE  -- ⭐ Bloquear para evitar double booking
    `, [id_funcion, asientos]);

    if (disponibles.length !== asientos.length) {
      await connection.rollback();
      return res.status(400).json({ 
        error: "Uno o más asientos ya no están disponibles" 
      });
    }

    // Marcar asientos como no disponibles
    await connection.query(`
      UPDATE funciones_asientos
      SET disponible = FALSE
      WHERE id_funcion = ?
        AND id_asiento IN (?)
    `, [id_funcion, asientos]);

    await connection.commit();

    res.json({ 
      message: "Asientos reservados correctamente",
      asientos_reservados: asientos.length
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Error al reservar asientos" });
  } finally {
    connection.release();
  }
};