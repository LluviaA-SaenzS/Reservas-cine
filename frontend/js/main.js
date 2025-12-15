// ============================================
// VERIFICAR SESIÓN
// ============================================

function verificarSesion() {
  const clienteStr = localStorage.getItem("cliente");
  
  if (clienteStr) {
    const cliente = JSON.parse(clienteStr);
    
    // Mostrar nombre del usuario en el nav
    // Asumiendo que tienes un elemento para esto
    const userMenu = document.getElementById("user-menu");
    if (userMenu) {
      userMenu.innerHTML = `
        <span>Hola, ${cliente.nombre}</span>
        <button onclick="cerrarSesion()">Cerrar sesión</button>
      `;
    }
    
    return cliente;
  }
  
  return null;
}

function cerrarSesion() {
  localStorage.removeItem("cliente");
  alert("Sesión cerrada");
  window.location.reload();
}

  

// ============================================
// VARIABLES GLOBALES
// ============================================

let cineSeleccionado = null; // Guardar el cine seleccionado

// ============================================
// INICIALIZAR
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  await cargarMenuCines();
  verificarSesion();
  configurarEventosMenu();
});

document.getElementById("btnVerTodos").addEventListener("click", () => {
  resetearSeleccionCine();
  cargarFunciones(); 
  document.getElementById("menuCines").classList.add("oculto");
});

// ============================================
// CARGAR CINES AGRUPADOS POR MUNICIPIO
// ============================================

async function cargarMenuCines() {
  try {
    // Obtener todos los cines
    const response = await fetch("http://localhost:3006/api/cines");
    const cines = await response.json();

    // Agrupar por municipio
    const cinesPorMunicipio = agruparPorMunicipio(cines);

    // Renderizar en el menú
    renderizarMenuMunicipios(cinesPorMunicipio);

  } catch (error) {
    console.error("Error al cargar cines:", error);
    document.getElementById("listaMunicipios").innerHTML = 
      '<p style="padding: 15px; color: #999;">Error al cargar los cines</p>';
  }
}

//----------------------------------------------------------------------------------------------------------------- Agrupar cines por municipio
function agruparPorMunicipio(cines) {
  const agrupados = {};

  cines.forEach(cine => {
    const municipio = cine.municipio || "Sin municipio";
    
    if (!agrupados[municipio]) {
      agrupados[municipio] = [];
    }
    
    agrupados[municipio].push(cine);
  });

  return agrupados;
}

//----------------------------------------------------------------------------------------------------------------- Renderizar el menú de municipios
function renderizarMenuMunicipios(cinesPorMunicipio) {
  const container = document.getElementById("listaMunicipios");
  container.innerHTML = "";

  //----------------------------------------------------------------------------------------------------------------- Ordenar municipios alfabéticamente
  const municipiosOrdenados = Object.keys(cinesPorMunicipio).sort();

  municipiosOrdenados.forEach(municipio => {
    const cines = cinesPorMunicipio[municipio];
    
    const municipioDiv = document.createElement("div");
    municipioDiv.className = "municipio-item";
    municipioDiv.innerHTML = `
      <div class="municipio-header" data-municipio="${municipio}">
        <div>
          <span class="municipio-nombre">${municipio}</span>
          <span class="badge-cines">${cines.length}</span>
        </div>
        <span class="municipio-icono">▼</span>
      </div>
      <div class="cines-lista">
        ${cines.map(cine => `
          <div class="cine-item" data-id-cine="${cine.id_cine}">
            <div class="cine-nombre">${cine.nombre}</div>
            <div class="cine-direccion">${cine.direccion}</div>
          </div>
        `).join('')}
      </div>
    `;

    container.appendChild(municipioDiv);
  });

  //----------------------------------------------------------------------------------------------------------------- Agregar eventos a los acordeones y cines
  agregarEventosAcordeon();
  agregarEventosSeleccionCine();
}

// ============================================
// EVENTOS DEL MENÚ
// ============================================

function configurarEventosMenu() {
  const btnCines = document.getElementById("btnCines");
  const menuCines = document.getElementById("menuCines");
  const btnCerrar = document.getElementById("btnCerrarMenu");

  // Abrir/cerrar menú
  btnCines.addEventListener("click", (e) => {
    e.stopPropagation();
    menuCines.classList.toggle("oculto");
  });

  // Cerrar con botón X
  btnCerrar.addEventListener("click", () => {
    menuCines.classList.add("oculto");
  });

  // Cerrar al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!menuCines.contains(e.target) && !btnCines.contains(e.target)) {
      menuCines.classList.add("oculto");
    }
  });
}

//----------------------------------------------------------------------------------------------------------------- Eventos del acordeón de municipios
function agregarEventosAcordeon() {
  const headers = document.querySelectorAll(".municipio-header");

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const cinesLista = header.nextElementSibling;
      const estaExpandido = cinesLista.classList.contains("expandido");

      // Cerrar todos los demás
      document.querySelectorAll(".cines-lista").forEach(lista => {
        lista.classList.remove("expandido");
      });
      document.querySelectorAll(".municipio-header").forEach(h => {
        h.classList.remove("activo");
      });

      // Expandir/contraer el clickeado
      if (!estaExpandido) {
        cinesLista.classList.add("expandido");
        header.classList.add("activo");
      }
    });
  });
}

//----------------------------------------------------------------------------------------------------------------- Eventos de selección de cine
function agregarEventosSeleccionCine() {
  const cinesItems = document.querySelectorAll(".cine-item");

  cinesItems.forEach(item => {
    item.addEventListener("click", () => {
      const idCine = item.dataset.idCine;
      const nombreCine = item.querySelector(".cine-nombre").textContent;

      // Remover selección previa
      document.querySelectorAll(".cine-item").forEach(i => {
        i.classList.remove("seleccionado");
      });

      // Marcar como seleccionado
      item.classList.add("seleccionado");

      // Guardar cine seleccionado
      cineSeleccionado = {
        id: idCine,
        nombre: nombreCine
      };

      console.log("✅ Cine seleccionado:", cineSeleccionado);

      // Actualizar el botón
      document.getElementById("btnCines").textContent = `📍 ${nombreCine}`;

      // Cerrar menú
      document.getElementById("menuCines").classList.add("oculto");

      // RECARGAR FUNCIONES CON EL FILTRO
      cargarFunciones();
    });
  });
}

// ============================================
// FUNCIÓN PARA OBTENER EL CINE SELECCIONADO
// ============================================

function getCineSeleccionado() {
  return cineSeleccionado;
}

// ============================================
// RESETEAR SELECCIÓN
// ============================================

function resetearSeleccionCine() {
  cineSeleccionado = null;
  document.getElementById("btnCines").textContent = "Ubica tu cine";
  document.querySelectorAll(".cine-item").forEach(i => {
    i.classList.remove("seleccionado");
  });
}


