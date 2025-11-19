import { db } from "../db.js";

export const getFunciones = async (req, res) => {
  try {
    const [funciones] = await db.query(`
      SELECT 
        f.id_funcion,
        f.fecha,
        f.hora_inicio,
        f.hora_fin,
        f.estado,
        f.precio_base,
        p.titulo,
        p.duracion_minutos,
        p.clasificacion,
        p.imagen,
        s.numero_sala,
        s.capacidad,
        s.tipo as tipo_sala,
        c.nombre as nombre_cine,
        c.direccion,
        -- ⭐ Contar asientos disponibles
        (SELECT COUNT(*) 
         FROM funciones_asientos fa 
         WHERE fa.id_funcion = f.id_funcion 
         AND fa.disponible = TRUE) as asientos_disponibles,
        -- ⭐ Capacidad total
        s.capacidad as capacidad_total
      FROM funciones f
      JOIN peliculas p ON f.id_pelicula = p.id_pelicula
      JOIN salas s ON f.id_sala = s.id_sala
      JOIN cines c ON s.id_cine = c.id_cine
      WHERE f.fecha >= CURDATE()
        AND f.estado = 'disponible'
      ORDER BY f.fecha, f.hora_inicio
    `);

    // Agregar indicador de disponibilidad
    const funcionesConDisponibilidad = funciones.map(f => ({
      ...f,
      esta_llena: f.asientos_disponibles === 0,
      porcentaje_ocupacion: ((f.capacidad_total - f.asientos_disponibles) / f.capacidad_total * 100).toFixed(0)
    }));

    res.json(funcionesConDisponibilidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener funciones" });
  }
};

export const insertarFuncion = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const {
      id_pelicula,
      id_sala,
      fecha,
      hora_inicio,
      precio_base
    } = req.body;

    await connection.beginTransaction();

    // 1️⃣ Obtener duración de la película
    const [pelicula] = await connection.query(
      'SELECT duracion_minutos FROM peliculas WHERE id_pelicula = ?',
      [id_pelicula]
    );

    if (!pelicula.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Película no encontrada" });
    }

    const duracionMinutos = pelicula[0].duracion_minutos;
    
    // 2️⃣ Calcular hora_fin (duración + 30 min de limpieza)
    const tiempoTotal = duracionMinutos + 30;
    const horaFin = calcularHoraFin(hora_inicio, tiempoTotal);

    // 3️⃣ Validar horario del cine (10 AM - 11 PM)
    if (!validarHorarioCine(hora_inicio, horaFin)) {
      await connection.rollback();
      return res.status(400).json({ 
        error: "La función debe estar entre 10:00 AM y 11:00 PM" 
      });
    }

    // 4️⃣ Verificar que no haya traslape con otras funciones
    const [traslape] = await connection.query(`
      SELECT id_funcion 
      FROM funciones 
      WHERE id_sala = ? 
        AND fecha = ?
        AND estado != 'cancelada'
        AND (
          (? BETWEEN hora_inicio AND hora_fin)
          OR (? BETWEEN hora_inicio AND hora_fin)
          OR (? <= hora_inicio AND ? >= hora_fin)
        )
    `, [id_sala, fecha, hora_inicio, horaFin, hora_inicio, horaFin]);

    if (traslape.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: "Ya existe una función en ese horario para esta sala" 
      });
    }

    // 5️⃣ Insertar la función
    const [resultado] = await connection.query(`
      INSERT INTO funciones 
      (id_pelicula, id_sala, fecha, hora_inicio, hora_fin, estado, precio_base)
      VALUES (?, ?, ?, ?, ?, 'disponible', ?)
    `, [id_pelicula, id_sala, fecha, hora_inicio, horaFin, precio_base]);

    const idFuncion = resultado.insertId;

    // 6️⃣ ⭐ CREAR TODOS LOS ASIENTOS PARA ESTA FUNCIÓN
    await connection.query(`
      INSERT INTO funciones_asientos (id_funcion, id_asiento, disponible)
      SELECT ?, id_asiento, TRUE
      FROM asientos
      WHERE id_sala = ?
    `, [idFuncion, id_sala]);

    await connection.commit();
    
    res.json({ 
      message: "Función creada correctamente",
      id_funcion: idFuncion,
      hora_inicio,
      hora_fin
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error al crear función:", error);
    res.status(500).json({ error: "Error al crear función" });
  } finally {
    connection.release();
  }
};

// Funciones auxiliares
function calcularHoraFin(horaInicio, minutos) {
  const [horas, mins] = horaInicio.split(':').map(Number);
  const totalMinutos = horas * 60 + mins + minutos;
  
  const nuevasHoras = Math.floor(totalMinutos / 60);
  const nuevosMinutos = totalMinutos % 60;
  
  return `${String(nuevasHoras).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}:00`;
}

function validarHorarioCine(horaInicio, horaFin) {
  const inicio = horaInicio.split(':').map(Number);
  const fin = horaFin.split(':').map(Number);
  
  const minutosInicio = inicio[0] * 60 + inicio[1];
  const minutosFin = fin[0] * 60 + fin[1];
  
  const apertura = 10 * 60; // 10:00 AM
  const cierre = 23 * 60;   // 11:00 PM
  
  return minutosInicio >= apertura && minutosFin <= cierre;
}