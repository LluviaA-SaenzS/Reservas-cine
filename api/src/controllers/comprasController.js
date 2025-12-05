import { db } from "../db.js";

// Crear una compra (genera recibo + detalles)
export const crearCompra = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const {
      id_cliente,
      id_funcion,
      asientos,  // Array de IDs: [1, 5, 8]
      id_descuento,
      metodo_pago
    } = req.body;

    console.log("📥 Datos de compra:", req.body);

    // Validar datos obligatorios
    if (!id_cliente || !id_funcion || !asientos || asientos.length === 0 || !metodo_pago) {
      return res.status(400).json({ 
        error: "Faltan datos obligatorios" 
      });
    }

    await connection.beginTransaction();

    // 1️⃣ Verificar que los asientos estén disponibles
    const [disponibles] = await connection.query(`
      SELECT fa.id_asiento, fa.disponible, a.fila, a.numero
      FROM funciones_asientos fa
      JOIN asientos a ON fa.id_asiento = a.id_asiento
      WHERE fa.id_funcion = ?
        AND fa.id_asiento IN (?)
        AND fa.disponible = TRUE
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

    if (!funcion.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Función no encontrada" });
    }

    const precioUnitario = parseFloat(funcion[0].precio_base);
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
      (id_cliente, id_funcion, id_descuento, subtotal, descuento_aplicado, total, metodo_pago, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pagado')
    `, [id_cliente, id_funcion, id_descuento || null, subtotal, descuentoAplicado, total, metodo_pago]);

    const idRecibo = recibo.insertId;
    console.log("✅ Recibo creado:", idRecibo);

    // 5️⃣ Insertar detalles (cada asiento)
    for (const idAsiento of asientos) {
      await connection.query(`
        INSERT INTO recibos_detalles (id_recibo, id_asiento, precio_unitario)
        VALUES (?, ?, ?)
      `, [idRecibo, idAsiento, precioUnitario]);
    }

    console.log("✅ Detalles insertados");

    // 6️⃣ Marcar asientos como no disponibles
    await connection.query(`
      UPDATE funciones_asientos
      SET disponible = FALSE
      WHERE id_funcion = ?
        AND id_asiento IN (?)
    `, [id_funcion, asientos]);

    console.log("✅ Asientos marcados como ocupados");

    await connection.commit();

    res.json({ 
      message: "Compra realizada correctamente",
      id_recibo: idRecibo,
      total: total,
      boletos_comprados: cantidadBoletos
    });

  } catch (error) {
    await connection.rollback();
    console.error("❌ Error al crear compra:", error);
    res.status(500).json({ 
      error: "Error al procesar la compra",
      detalle: error.message 
    });
  } finally {
    connection.release();
  }
};

// Obtener un recibo completo
export const getRecibo = async (req, res) => {
  const { id_recibo } = req.params;

  try {
    // Obtener información del recibo
    const [recibo] = await db.query(`
      SELECT 
        r.*,
        c.nombre as nombre_cliente,
        c.email,
        f.fecha as fecha_funcion,
        f.hora_inicio,
        p.titulo as pelicula,
        p.clasificacion,
        p.imagen,
        s.numero_sala,
        s.tipo as tipo_sala,
        ci.nombre as nombre_cine,
        ci.direccion
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

// Obtener historial de compras de un cliente
export const getComprasCliente = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const [compras] = await db.query(`
      SELECT 
        r.id_recibo,
        r.fecha_compra,
        r.total,
        r.estado,
        p.titulo as pelicula,
        p.imagen,
        f.fecha as fecha_funcion,
        f.hora_inicio,
        ci.nombre as nombre_cine,
        COUNT(rd.id_detalle) as cantidad_boletos
      FROM recibos r
      JOIN funciones f ON r.id_funcion = f.id_funcion
      JOIN peliculas p ON f.id_pelicula = p.id_pelicula
      JOIN salas s ON f.id_sala = s.id_sala
      JOIN cines ci ON s.id_cine = ci.id_cine
      JOIN recibos_detalles rd ON r.id_recibo = rd.id_recibo
      WHERE r.id_cliente = ?
      GROUP BY r.id_recibo
      ORDER BY r.fecha_compra DESC
    `, [id_cliente]);

    res.json(compras);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};