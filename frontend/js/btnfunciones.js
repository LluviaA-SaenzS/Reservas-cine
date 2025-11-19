// ============================================
// CARGAR DATOS INICIALES
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  await cargarPeliculas();
  await cargarCines();
  configurarEventos();
});

// Cargar películas
async function cargarPeliculas() {
  try {
    const response = await fetch("http://localhost:3006/api/peliculas");
    const peliculas = await response.json();
    
    const select = document.getElementById("selPeliculas");
    select.innerHTML = '<option value="">Seleccione una película...</option>';
    
    peliculas.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id_pelicula;
      option.textContent = `${p.titulo} (${p.duracion_minutos} min)`;
      option.dataset.duracion = p.duracion_minutos;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar películas:", error);
  }
}

// Cargar cines
async function cargarCines() {
  try {
    const response = await fetch("http://localhost:3006/api/cines");
    const cines = await response.json();
    
    const select = document.getElementById("selCines");
    select.innerHTML = '<option value="">Seleccione un cine...</option>';
    
    cines.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id_cine;
      option.textContent = c.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar cines:", error);
  }
}

// Cargar salas según el cine seleccionado ---------------------------------------------------------------------------------------
async function cargarSalas(idCine) {
  try {
    const response = await fetch(`http://localhost:3006/api/salas?id_cine=${idCine}`);
    const salas = await response.json();
    
    const select = document.getElementById("selSalas");
    select.innerHTML = '<option value="">Seleccione una sala...</option>';
    select.disabled = false;
    
    salas.forEach(s => {
      const option = document.createElement("option");
      option.value = s.id_sala;
      option.textContent = `Sala ${s.numero_sala} - ${s.tipo} (${s.capacidad} asientos)`;
      option.dataset.capacidad = s.capacidad;
      option.dataset.tipo = s.tipo;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar salas:", error);
  }
}

// ============================================
// CONFIGURAR EVENTOS
// ============================================

function configurarEventos() {
  const selPeliculas = document.getElementById("selPeliculas");
  const selCines = document.getElementById("selCines");
  const selSalas = document.getElementById("selSalas");
  const horaInicio = document.getElementById("hora_inicio");

  // Mostrar duración cuando se selecciona película
  selPeliculas.addEventListener("change", (e) => {
    const option = e.target.selectedOptions[0];
    const duracion = option?.dataset.duracion;
    
    if (duracion) {
      document.getElementById("duracion-pelicula").textContent = 
        `Duración: ${duracion} minutos (+ 30 min de limpieza = ${parseInt(duracion) + 30} min total)`;
      calcularHoraFin();
    } else {
      document.getElementById("duracion-pelicula").textContent = "";
    }
  });

  // Cargar salas cuando se selecciona cine
  selCines.addEventListener("change", (e) => {
    const idCine = e.target.value;
    if (idCine) {
      cargarSalas(idCine);
    } else {
      selSalas.innerHTML = '<option value="">Primero seleccione un cine...</option>';
      selSalas.disabled = true;
    }
  });

  // Mostrar info de sala
  selSalas.addEventListener("change", (e) => {
    const option = e.target.selectedOptions[0];
    const capacidad = option?.dataset.capacidad;
    const tipo = option?.dataset.tipo;
    
    if (capacidad) {
      document.getElementById("info-sala").textContent = 
        `Capacidad: ${capacidad} asientos | Tipo: ${tipo}`;
    } else {
      document.getElementById("info-sala").textContent = "";
    }
  });

  // Calcular hora fin cuando cambia la hora de inicio
  horaInicio.addEventListener("change", calcularHoraFin);

  // Establecer fecha mínima como hoy
  document.getElementById("fecha").min = new Date().toISOString().split('T')[0];
}

// ============================================
// CALCULAR HORA FIN
// ============================================

function calcularHoraFin() {
  const selPeliculas = document.getElementById("selPeliculas");
  const horaInicio = document.getElementById("hora_inicio").value;
  
  const option = selPeliculas.selectedOptions[0];
  const duracion = option?.dataset.duracion;

  if (!horaInicio || !duracion) {
    document.getElementById("hora_fin").value = "";
    return;
  }

  const [horas, minutos] = horaInicio.split(':').map(Number);
  const totalMinutos = horas * 60 + minutos + parseInt(duracion) + 30; // +30 limpieza
  
  const nuevasHoras = Math.floor(totalMinutos / 60);
  const nuevosMinutos = totalMinutos % 60;
  
  const horaFin = `${String(nuevasHoras).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}`;
  document.getElementById("hora_fin").value = horaFin;

  // Validar que no pase de las 11 PM
  if (nuevasHoras > 23 || (nuevasHoras === 23 && nuevosMinutos > 0)) {
    alert("⚠️ La función terminaría después de las 11:00 PM. Por favor ajuste la hora de inicio.");
    document.getElementById("hora_inicio").value = "";
    document.getElementById("hora_fin").value = "";
  }
}

// ============================================
// ENVIAR FORMULARIO
// ============================================

document.getElementById("form-funcion").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    id_pelicula: document.getElementById("selPeliculas").value,
    id_sala: document.getElementById("selSalas").value,
    fecha: document.getElementById("fecha").value,
    hora_inicio: document.getElementById("hora_inicio").value,
    precio_base: document.getElementById("precio_base").value
  };

  // Validación básica
  if (!formData.id_pelicula || !formData.id_sala || !formData.fecha || 
      !formData.hora_inicio || !formData.precio_base) {
    alert("Por favor complete todos los campos obligatorios");
    return;
  }

  try {
    const response = await fetch("http://localhost:3006/api/funciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      alert(`✅ ${result.message}\nInicio: ${result.hora_inicio}\nFin: ${result.hora_fin}`);
      document.getElementById("form-funcion").reset();
      document.getElementById("duracion-pelicula").textContent = "";
      document.getElementById("info-sala").textContent = "";
      document.getElementById("hora_fin").value = "";
    } else {
      alert(`❌ Error: ${result.error}`);
    }

  } catch (error) {
    console.error("Error al crear función:", error);
    alert("Error al crear la función");
  }
});