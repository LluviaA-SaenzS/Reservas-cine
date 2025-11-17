document.querySelector("#form-peliculas")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = document.querySelector("#form-peliculas");
    const formData = new FormData(form);


    formData.delete("idioma[]");
    formData.delete("subtitulos[]");
    formData.delete("generos[]"); 

    // idiomas
    const idiomas = [...document.querySelectorAll("input[name='idioma[]']:checked")]
      .map(i => i.value);

    // subtitulos
    const subtitulos = [...document.querySelectorAll("input[name='subtitulos[]']:checked")]
      .map(i => i.value);

    // generos
    const generos = [...document.querySelectorAll("input[name='generos[]']:checked")]
      .map(g => g.value);
    
    console.log("Géneros seleccionados:", generos);
    console.log("Idiomas seleccionados:", idiomas);
    console.log("Subtítulos seleccionados:", subtitulos);

    // Enviar arrays correctamente al backend (sin duplicados)
    idiomas.forEach(id => formData.append("idioma[]", id));
    subtitulos.forEach(st => formData.append("subtitulos[]", st));
    generos.forEach(g => formData.append("generos[]", g));

    try {
      const response = await fetch("http://localhost:3006/api/peliculas", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      console.log(result);

      alert("Película insertada correctamente");
      form.reset(); 

    } catch (error) {
      console.error(error);
      alert("Error al insertar película");
    }
});
