// Espera a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-contacto");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault(); // Evita que la página se recargue

      // Obtener valores
      const nombre = document.querySelector("#nombre").value.trim();
      const email = document.querySelector("#email").value.trim();
      const mensaje = document.querySelector("#mensaje").value.trim();

      // Validación simple
      if (nombre === "" || email === "" || mensaje === "") {
        alert("Por favor completa todos los campos.");
        return;
      }

      // Validación de email básica
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Por favor ingresa un correo electrónico válido.");
        return;
      }

      // Aquí podrías enviar la información a un servidor con fetch/AJAX
      // Ejemplo: enviar a un backend con Node.js y MySQL

      alert(`¡Gracias por contactarnos, ${nombre}! Te responderemos pronto.`);

      // Limpiar formulario
      form.reset();
    });
  }
});
