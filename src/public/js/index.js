// Verificar el estado de autenticación al cargar la página
//este script está en main.handlebars
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/sessions/current");
    const authNav = document.querySelector(".auth-status");

    if (response.status === 200) {
      const result = await response.json();
      if (result.status === "success") {
        authNav.innerHTML = `
          <div class="d-flex">
            <a class="nav-link" href="/profile">Perfil</a>
            <span class="nav-link">|</span>
            <a class="nav-link logout-link" href="#">Cerrar sesión</a>
          </div>
        `;

        // Añadir evento de logout
        document
          .querySelector(".logout-link")
          .addEventListener("click", async (e) => {
            e.preventDefault();
            await fetch("/api/sessions/logout");
            window.location.href = "/login";
          });
      }
    } else {
      authNav.innerHTML = `
        <div class="d-flex">
          <a class="nav-link" href="/login">Iniciar sesión</a>
          <span class="nav-link">|</span>
          <a class="nav-link" href="/register">Registrarse</a>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
  }
});
