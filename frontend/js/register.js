const API_URL = "http://localhost:3006";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    nombre: document.querySelector("input[name='nombre']").value.trim(),
    apellidos: document.querySelector("input[name='apellidos']").value.trim(),
    correo: document.querySelector("input[name='correo']").value.trim(),
    password: document.querySelector("input[name='password']").value,
    telefono: document.querySelector("input[name='telefono']").value.trim(),
    fecha_nacimiento: document.querySelector("input[name='fecha_nacimiento']").value
  };

  // Validación básica
  if (!formData.nombre || !formData.apellidos || !formData.correo || 
      !formData.password || !formData.telefono || !formData.fecha_nacimiento) {
    alert("Por favor completa todos los campos");
    return;
  }

  // Validar email
  if (!formData.correo.includes("@")) {
    alert("Por favor ingresa un correo válido");
    return;
  }

  // Validar contraseña (mínimo 6 caracteres)
  if (formData.password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/clientes/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      alert("✅ Registro exitoso. Ahora puedes iniciar sesión");
      window.location.href = "/frontend/login.html";
    } else {
      alert(`❌ Error: ${result.error}`);
    }

  } catch (error) {
    console.error("Error al registrarse:", error);
    alert("Error al conectar con el servidor");
  }
});