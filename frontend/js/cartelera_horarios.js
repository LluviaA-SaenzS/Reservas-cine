 const btnCartelera = document.getElementById('btnCartelera');
  const btnHorarios = document.getElementById('btnHorarios');
  const contenedor = document.getElementById('contenidoSeccion');

  btnCartelera.addEventListener('click', () => {
    btnCartelera.classList.add('activo');
    btnHorarios.classList.remove('activo');
    contenedor.innerHTML = `
      <div class="pelicula">
        <img src="img/pelicula1.jpg" alt="Pelicula 1">
        <h4>Título de la película</h4>
        <p>Género | Clasificación</p>
      </div>
    `;
  });

  btnHorarios.addEventListener('click', () => {
    btnHorarios.classList.add('activo');
    btnCartelera.classList.remove('activo');
    contenedor.innerHTML = `
      <ul>
        <li>10:30 AM - Sala 1</li>
        <li>1:00 PM - Sala 2</li>
        <li>5:00 PM - Sala 3</li>
      </ul>
    `;
  });