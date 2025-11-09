const btn = document.getElementById('btnCines');
  const menu = document.getElementById('menuCines');

  btn.addEventListener('click', () => {
    menu.classList.toggle('oculto');
  });

  // ------------------------- cargar cines base de datos ---------------------------------------
  