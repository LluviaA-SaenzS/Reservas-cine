// ============================================
// CARGAR Y MOSTRAR FUNCIONES
// ============================================
const API_URL = "http://localhost:3006"; 

//----------------------------------------------------------------------------------------------------------------- Función principal para cargar funciones
async function cargarFunciones() {
  try {
    const cine = getCineSeleccionado();
    
    let url = `${API_URL}/api/funciones`;  
    
    if (cine && cine.id) {
      url += `?id_cine=${cine.id}`;
      console.log(`🎬 Cargando funciones del cine: ${cine.nombre}`);
    } else {
      console.log("🎬 Cargando todas las funciones");
    }

    const response = await fetch(url);
    const funciones = await response.json();

    console.log(`✅ ${funciones.length} funciones encontradas`);
    renderizarFunciones(funciones);

  } catch (error) {
    console.error("❌ Error al cargar funciones:", error);
    mostrarErrorFunciones();
  }
}

//----------------------------------------------------------------------------------------------------------------- Renderizar funciones en el HTML
function renderizarFunciones(funciones) {
  const container = document.getElementById("contenedor-funciones"); // ⭐ Ajusta el ID según tu HTML
  funciones.forEach(f => {
    console.log("Fecha original:", f.fecha, "Tipo:", typeof f.fecha);
  });

  //----------------------------------------------------------------------------------------------------------------- Si no hay funciones
  if (funciones.length === 0) {
    const cine = getCineSeleccionado();
    const mensaje = cine 
      ? `No hay funciones disponibles en ${cine.nombre}`
      : "No hay funciones disponibles";
    
    container.innerHTML = `
      <div class="sin-funciones">
        <p>📽️ ${mensaje}</p>
      </div>
    `;
    return;
  }

  //----------------------------------------------------------------------------------------------------------------- Agrupar funciones por fecha
  const funcionesPorFecha = agruparPorFecha(funciones);

  //----------------------------------------------------------------------------------------------------------------- Renderizar
  let html = '';

  Object.keys(funcionesPorFecha).forEach(fecha => {
    const funcionesDia = funcionesPorFecha[fecha];
    
    html += `
      <div class="fecha-grupo">
        <h3 class="fecha-titulo">${formatearFecha(fecha)}</h3>
        <div class="funciones-grid">
          ${funcionesDia.map(f => crearTarjetaFuncion(f)).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  //----------------------------------------------------------------------------------------------------------------- Agregar eventos a los botones de comprar
  agregarEventosCompra();
}

//----------------------------------------------------------------------------------------------------------------- Agrupar funciones por fecha
function agruparPorFecha(funciones) {
  const agrupadas = {};

  funciones.forEach(funcion => {
    const fecha = funcion.fecha;
    
    if (!agrupadas[fecha]) {
      agrupadas[fecha] = [];
    }
    
    agrupadas[fecha].push(funcion);
  });

  return agrupadas;
}

//----------------------------------------------------------------------------------------------------------------- Crear tarjeta de función
function crearTarjetaFuncion(funcion) {
  //----------------------------------------------------------------------------------------------------------------- Construir URL completa con el servidor del backend
  const imagenUrl = funcion.imagen 
    ? `http://localhost:3006${funcion.imagen}`  //----------------------------------------------------------------------------------------------------------------- Agregar el dominio completo
    : '/images/placeholder.jpg';
  
  const disponibilidad = funcion.esta_llena 
    ? '<span class="badge-llena">Agotada</span>'
    : `<span class="badge-disponible">${funcion.asientos_disponibles} asientos</span>`;

  return `
    <div class="funcion-card" data-id-funcion="${funcion.id_funcion}">
      <div class="funcion-imagen">
        <img src="${imagenUrl}" alt="${funcion.titulo}" 
             onerror="this.src='/images/placeholder.jpg'">
        <span class="clasificacion">${funcion.clasificacion}</span>
      </div>
      <div class="funcion-info">
        <h4 class="funcion-titulo">${funcion.titulo}</h4>
        <p class="funcion-cine">📍 ${funcion.nombre_cine} - Sala ${funcion.numero_sala}</p>
        <p class="funcion-municipio">${funcion.municipio}</p>
        <div class="funcion-detalles">
          <span>⏰ ${formatearHora(funcion.hora_inicio)}</span>
          <span>🎭 ${funcion.tipo_sala}</span>
          <span>⏱️ ${funcion.duracion_minutos} min</span>
        </div>
        <div class="funcion-idioma">
          <strong>Idioma:</strong> ${funcion.idioma.join(', ') || 'N/A'}
        </div>
        <div class="funcion-subtitulos">
          <strong>Subtítulos:</strong> ${funcion.subtitulos.join(', ') || 'No'}
        </div>
        <div class="funcion-footer">
          <span class="precio">$${parseFloat(funcion.precio_base).toFixed(2)}</span>
          ${disponibilidad}
        </div>
        ${!funcion.esta_llena ? `
          <button class="btn-comprar" data-id-funcion="${funcion.id_funcion}">
            Comprar boletos
          </button>
        ` : `
          <button class="btn-comprar" disabled>
            Agotada
          </button>
        `}
      </div>
    </div>
  `;
}

function formatearFecha(fechaStr) {
  try {
    if (!fechaStr) return "Fecha no disponible";
    
    ///----------------------------------------------------------------------------------------------------------------- Convertir a string y extraer solo la parte de la fecha
    const fechaString = String(fechaStr);
    let year, month, day;
    
    //----------------------------------------------------------------------------------------------------------------- Si viene como ISO "2025-11-26T06:00:00.000Z"
    if (fechaString.includes('T')) {
      const [fechaParte] = fechaString.split('T');
      [year, month, day] = fechaParte.split('-').map(Number);
    } else {
      //----------------------------------------------------------------------------------------------------------------- Si viene como "2025-11-26"
      [year, month, day] = fechaString.split('-').map(Number);
    }
    
    //----------------------------------------------------------------------------------------------------------------- Crear fecha en hora local
    const fecha = new Date(year, month - 1, day);
    
    if (isNaN(fecha.getTime())) {
      return "Fecha inválida";
    }
    
    const opciones = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return fecha.toLocaleDateString('es-MX', opciones);
    
  } catch (error) {
    console.error("Error al formatear fecha:", error, fechaStr);
    return "Fecha inválida";
  }
}

//----------------------------------------------------------------------------------------------------------------- Formatear hora (14:30:00 → 2:30 PM)
function formatearHora(horaStr) {
  const [horas, minutos] = horaStr.split(':');
  const hora = parseInt(horas);
  const ampm = hora >= 12 ? 'PM' : 'AM';
  const hora12 = hora % 12 || 12;
  return `${hora12}:${minutos} ${ampm}`;
}

//----------------------------------------------------------------------------------------------------------------- Mostrar mensaje de error
function mostrarErrorFunciones() {
  const container = document.getElementById("contenedor-funciones");
  container.innerHTML = `
    <div class="error-funciones">
      <p>❌ Error al cargar las funciones</p>
      <button onclick="cargarFunciones()">Reintentar</button>
    </div>
  `;
}

//----------------------------------------------------------------------------------------------------------------- Eventos para botones de compra
function agregarEventosCompra() {
  const botones = document.querySelectorAll(".btn-comprar");
  
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      const idFuncion = btn.dataset.idFuncion;
      //----------------------------------------------------------------------------------------------------------------- AQUÍ implementar la compra de boletos
      console.log("Comprar boletos para función:", idFuncion);
      alert(`Redirigiendo a compra de boletos para función ${idFuncion}`);
      // window.location.href = `/comprar.html?funcion=${idFuncion}`;
    });
  });
}

// ============================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  cargarFunciones();
});