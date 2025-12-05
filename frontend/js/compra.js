// ============================================
// CONFIGURACIÓN
// ============================================

const API_URL = "http://localhost:3006";
let funcionSeleccionada = null;
let asientosSeleccionados = []; // Array de objetos: { id_asiento, fila, numero }
let precioUnitario = 0;
let descuentos = [];

// ============================================
// INICIALIZAR
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  // Obtener ID de función de la URL
  const params = new URLSearchParams(window.location.search);
  const idFuncion = params.get("funcion");

  if (!idFuncion) {
    alert("No se especificó una función");
    window.location.href = "/frontend/index.html";
    return;
  }

  await cargarFuncion(idFuncion);
  await cargarAsientos(idFuncion);
  await cargarDescuentos();
  configurarEventos();
});

// ============================================
// CARGAR DATOS
// ============================================

async function cargarFuncion(idFuncion) {
  try {
    const response = await fetch(`${API_URL}/api/funciones/${idFuncion}`);
    const funcion = await response.json();

    funcionSeleccionada = funcion;
    precioUnitario = parseFloat(funcion.precio_base);

    // Mostrar información
    document.getElementById("pelicula-poster").src = `${API_URL}${funcion.imagen}`;
    document.getElementById("pelicula-titulo").textContent = funcion.titulo;
    document.getElementById("pelicula-clasificacion").textContent = 
      `Clasificación: ${funcion.clasificacion} | ${funcion.duracion_minutos} min`;
    document.getElementById("funcion-detalles").textContent = 
      `${formatearFecha(funcion.fecha)} - ${formatearHora(funcion.hora_inicio)}`;
    document.getElementById("funcion-cine").textContent = 
      `${funcion.nombre_cine} - Sala ${funcion.numero_sala} (${funcion.tipo})`;
    
    document.getElementById("precio-unitario").textContent = `$${precioUnitario.toFixed(2)}`;

  } catch (error) {
    console.error("Error al cargar función:", error);
    alert("Error al cargar la información de la función");
  }
}

async function cargarAsientos(idFuncion) {
  try {
    const response = await fetch(`${API_URL}/api/funciones/${idFuncion}/asientos`);
    const asientos = await response.json();

    renderizarAsientos(asientos);

  } catch (error) {
    console.error("Error al cargar asientos:", error);
    alert("Error al cargar los asientos");
  }
}

async function cargarDescuentos() {
  try {
    const response = await fetch(`${API_URL}/api/descuentos`);
    descuentos = await response.json();

    const select = document.getElementById("select-descuento");
    select.innerHTML = '<option value="">Sin descuento</option>';

    descuentos.forEach(d => {
      const option = document.createElement("option");
      option.value = d.id_descuento;
      option.textContent = `${d.tipo} (${d.porcentaje}% OFF)`;
      option.dataset.porcentaje = d.porcentaje;
      select.appendChild(option);
    });

  } catch (error) {
    console.error("Error al cargar descuentos:", error);
  }
}

// ============================================
// RENDERIZAR ASIENTOS
// ============================================

function renderizarAsientos(asientos) {
  const mapaAsientos = document.getElementById("mapa-asientos");
  mapaAsientos.innerHTML = "";

  // Agrupar asientos por fila
  const asientosPorFila = {};
  asientos.forEach(asiento => {
    if (!asientosPorFila[asiento.fila]) {
      asientosPorFila[asiento.fila] = [];
    }
    asientosPorFila[asiento.fila].push(asiento);
  });

  // Ordenar filas alfabéticamente
  const filasOrdenadas = Object.keys(asientosPorFila).sort();

  // Crear cada fila
  filasOrdenadas.forEach(fila => {
    const filaDiv = document.createElement("div");
    filaDiv.className = "fila-asientos";

    // Etiqueta de fila
    const filaLabel = document.createElement("div");
    filaLabel.className = "fila-label";
    filaLabel.textContent = fila;

    // Contenedor de asientos
    const filaContenido = document.createElement("div");
    filaContenido.className = "fila-contenido";

    // Ordenar asientos por número
    const asientosOrdenados = asientosPorFila[fila].sort((a, b) => a.numero - b.numero);

    asientosOrdenados.forEach(asiento => {
      const asientoDiv = document.createElement("div");
      asientoDiv.className = "asiento";
      asientoDiv.textContent = asiento.numero;
      asientoDiv.dataset.idAsiento = asiento.id_asiento;
      asientoDiv.dataset.fila = asiento.fila;
      asientoDiv.dataset.numero = asiento.numero;

      // Determinar estado del asiento
      if (!asiento.disponible) {
        asientoDiv.classList.add("ocupado");
      } else if (asiento.tipo_asiento === "Discapacitado") {
        asientoDiv.classList.add("discapacitado", "disponible");
      } else {
        asientoDiv.classList.add("disponible");
      }

      // Evento click (solo si está disponible)
      if (asiento.disponible) {
        asientoDiv.addEventListener("click", () => toggleAsiento(asiento, asientoDiv));
      }

      filaContenido.appendChild(asientoDiv);
    });

    filaDiv.appendChild(filaLabel);
    filaDiv.appendChild(filaContenido);
    mapaAsientos.appendChild(filaDiv);
  });
}

// ============================================
// SELECCIÓN DE ASIENTOS
// ============================================

function toggleAsiento(asiento, elemento) {
  const index = asientosSeleccionados.findIndex(a => a.id_asiento === asiento.id_asiento);

  if (index > -1) {
    // Deseleccionar
    asientosSeleccionados.splice(index, 1);
    elemento.classList.remove("seleccionado");
  } else {
    // Seleccionar
    asientosSeleccionados.push({
      id_asiento: asiento.id_asiento,
      fila: asiento.fila,
      numero: asiento.numero
    });
    elemento.classList.add("seleccionado");
  }

  actualizarResumen();
}

function actualizarResumen() {
  const listaContainer = document.getElementById("lista-asientos-seleccionados");
  const cantidadBoletos = document.getElementById("cantidad-boletos");
  const subtotalElement = document.getElementById("subtotal");
  const btnComprar = document.getElementById("btn-comprar");

  // Actualizar lista de asientos
  if (asientosSeleccionados.length === 0) {
    listaContainer.innerHTML = '<p class="texto-vacio">No has seleccionado asientos</p>';
    btnComprar.disabled = true;
  } else {
    listaContainer.innerHTML = asientosSeleccionados
      .map(a => `
        <div class="asiento-tag">
          ${a.fila}${a.numero}
          <button onclick="deseleccionarAsiento(${a.id_asiento})">×</button>
        </div>
      `)
      .join("");
    btnComprar.disabled = false;
  }

  // Calcular precios
  const cantidad = asientosSeleccionados.length;
  const subtotal = precioUnitario * cantidad;

  cantidadBoletos.textContent = cantidad;
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;

  calcularTotal();
}

function deseleccionarAsiento(idAsiento) {
  // Remover de la lista
  asientosSeleccionados = asientosSeleccionados.filter(a => a.id_asiento !== idAsiento);

  // Remover clase del elemento visual
  const elemento = document.querySelector(`[data-id-asiento="${idAsiento}"]`);
  if (elemento) {
    elemento.classList.remove("seleccionado");
  }

  actualizarResumen();
}

function calcularTotal() {
  const cantidad = asientosSeleccionados.length;
  const subtotal = precioUnitario * cantidad;

  const selectDescuento = document.getElementById("select-descuento");
  const opcionSeleccionada = selectDescuento.selectedOptions[0];
  const porcentaje = parseFloat(opcionSeleccionada?.dataset.porcentaje || 0);

  const descuento = (subtotal * porcentaje) / 100;
  const total = subtotal - descuento;

  document.getElementById("descuento").textContent = `-$${descuento.toFixed(2)}`;
  document.getElementById("total").textContent = `$${total.toFixed(2)}`;
}

// ============================================
// EVENTOS
// ============================================

function configurarEventos() {
  // Cambio de descuento
  document.getElementById("select-descuento").addEventListener("change", calcularTotal);

  // Botón de comprar
  document.getElementById("btn-comprar").addEventListener("click", finalizarCompra);
}

async function finalizarCompra() {
  const metodoPago = document.getElementById("metodo-pago").value;
  const idDescuento = document.getElementById("select-descuento").value || null;

  if (!metodoPago) {
    alert("Por favor selecciona un método de pago");
    return;
  }

  if (asientosSeleccionados.length === 0) {
    alert("Por favor selecciona al menos un asiento");
    return;
  }

  const confirmacion = confirm(
    `¿Confirmar compra de ${asientosSeleccionados.length} boleto(s)?\n` +
    `Total: ${document.getElementById("total").textContent}`
  );

  if (!confirmacion) return;

  try {
    const response = await fetch(`${API_URL}/api/compras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_cliente: 1, // ⭐ TEMPORAL - Después obtendrás del login
        id_funcion: funcionSeleccionada.id_funcion,
        asientos: asientosSeleccionados.map(a => a.id_asiento),
        id_descuento: idDescuento,
        metodo_pago: metodoPago
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert(`✅ Compra realizada correctamente\nRecibo #${result.id_recibo}`);
      // Redirigir a página de confirmación o recibo
     // window.location.href = `/recibo.html?id=${result.id_recibo}`;
    } else {
      alert(`❌ Error: ${result.error}`);
    }

  } catch (error) {
    console.error("Error al realizar compra:", error);
    alert("Error al procesar la compra");
  }
}

// ============================================
// UTILIDADES
// ============================================

function formatearFecha(fechaStr) {
  const [fechaParte] = String(fechaStr).split('T');
  const [year, month, day] = fechaParte.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  
  return fecha.toLocaleDateString('es-MX', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatearHora(horaStr) {
  const [horas, minutos] = horaStr.split(':');
  const hora = parseInt(horas);
  const ampm = hora >= 12 ? 'PM' : 'AM';
  const hora12 = hora % 12 || 12;
  return `${hora12}:${minutos} ${ampm}`;
}