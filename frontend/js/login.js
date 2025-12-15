const API_URL = "http://localhost:3006";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.querySelector("input[name='usuario']").value.trim();
  const password = document.querySelector("input[name='password']").value;

  if (!usuario || !password) {
    alert("Por favor completa todos los campos");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/clientes/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ usuario, password })
    });

    const result = await response.json();

    if (response.ok) {

      localStorage.setItem("cliente", JSON.stringify(result.cliente));
      
      alert(`✅ Bienvenido ${result.cliente.nombre}`);
      
      window.location.href = "/frontend/index.html";
    } else {
      alert(`❌ Error: ${result.error}`);
    }

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error al conectar con el servidor");
  }
});