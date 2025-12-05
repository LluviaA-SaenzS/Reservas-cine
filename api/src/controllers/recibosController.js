import { db } from "../db.js";

export const getRecibo = async (req, res) => {
  const { id_recibo } = req.params;

  try {
    // Obtener información del recibo
    const [recibo] = await db.query(`
      SELECT 
        r.*,
        c.nombre as nombre_cliente,
        c.correo,
        f.fecha as fecha_funcion,
        f.hora_inicio,
        p.titulo as pelicula,
        s.numero_sala,
        ci.nombre as nombre_cine
      FROM recibos r
      JOIN clientes c ON r.id_cliente = c.id_cliente
      JOIN funciones f ON r.id_funcion = f.id_funcion
      JOIN peliculas p ON f.id_pelicula = p.id_pelicula
      JOIN salas s ON f.id_sala = s.id_sala
      JOIN cines ci ON s.id_cine = ci.id_cine
      WHERE r.id_recibo = ?
    `, [id_recibo]);

    if (!recibo.length) {
      return res.status(404).json({ error: "Recibo no encontrado" });
    }

    // Obtener detalles (asientos)
    const [detalles] = await db.query(`
      SELECT 
        rd.*,
        a.fila,
        a.numero,
        a.tipo_asiento
      FROM recibos_detalles rd
      JOIN asientos a ON rd.id_asiento = a.id_asiento
      WHERE rd.id_recibo = ?
      ORDER BY a.fila, a.numero
    `, [id_recibo]);

    res.json({
      recibo: recibo[0],
      asientos: detalles
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener recibo" });
  }
};


export const crearCompra = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const {
      id_cliente,
      id_funcion,
      asientos,  // Array: [1, 5, 8]
      id_descuento,
      metodo_pago
    } = req.body;

    await connection.beginTransaction();

    // 1️⃣ Verificar que los asientos estén disponibles
    const [disponibles] = await connection.query(`
      SELECT id_asiento, disponible
      FROM funciones_asientos
      WHERE id_funcion = ?
        AND id_asiento IN (?)
        AND disponible = TRUE
      FOR UPDATE
    `, [id_funcion, asientos]);

    if (disponibles.length !== asientos.length) {
      await connection.rollback();
      return res.status(400).json({ 
        error: "Uno o más asientos ya no están disponibles" 
      });
    }

    // 2️⃣ Obtener precio base de la función
    const [funcion] = await connection.query(
      'SELECT precio_base FROM funciones WHERE id_funcion = ?',
      [id_funcion]
    );

    const precioUnitario = funcion[0].precio_base;
    const cantidadBoletos = asientos.length;
    const subtotal = precioUnitario * cantidadBoletos;

    // 3️⃣ Calcular descuento (si aplica)
    let descuentoAplicado = 0;
    if (id_descuento) {
      const [descuento] = await connection.query(
        'SELECT porcentaje FROM descuentos WHERE id_descuento = ?',
        [id_descuento]
      );
      if (descuento.length > 0) {
        descuentoAplicado = (subtotal * descuento[0].porcentaje) / 100;
      }
    }

    const total = subtotal - descuentoAplicado;

    // 4️⃣ Crear el recibo principal
    const [recibo] = await connection.query(`
      INSERT INTO recibos 
      (id_cliente, id_funcion, id_descuento, subtotal, descuento_aplicado, total, metodo_pago)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id_cliente, id_funcion, id_descuento, subtotal, descuentoAplicado, total, metodo_pago]);

    const idRecibo = recibo.insertId;

    // 5️⃣ Insertar detalles (cada asiento)
    for (const idAsiento of asientos) {
      await connection.query(`
        INSERT INTO recibos_detalles (id_recibo, id_asiento, precio_unitario)
        VALUES (?, ?, ?)
      `, [idRecibo, idAsiento, precioUnitario]);
    }

    // 6️⃣ Marcar asientos como no disponibles
    await connection.query(`
      UPDATE funciones_asientos
      SET disponible = FALSE
      WHERE id_funcion = ?
        AND id_asiento IN (?)
    `, [id_funcion, asientos]);

    await connection.commit();

    res.json({ 
      message: "Compra realizada correctamente",
      id_recibo: idRecibo,
      total: total,
      boletos_comprados: cantidadBoletos
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error al crear compra:", error);
    res.status(500).json({ error: "Error al procesar la compra" });
  } finally {
    connection.release();
  }
};


