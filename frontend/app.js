const form = document.getElementById("auth-form");
const title = document.getElementById("form-title");
const toggleText = document.getElementById("toggle-text");
const responseMsg = document.getElementById("response-msg");
const submitBtn = document.getElementById("submit-btn");

let isLogin = true;

function updateForm() {
  if (isLogin) {
    title.textContent = "Inicia sesión";
    submitBtn.textContent = "Entrar";
    toggleText.innerHTML = `¿No tienes cuenta? <a href="#" id="toggle-link">Regístrate aquí</a>`;
  } else {
    title.textContent = "Regístrate";
    submitBtn.textContent = "Crear cuenta";
    toggleText.innerHTML = `¿Ya tienes cuenta? <a href="#" id="toggle-link">Inicia sesión</a>`;
  }

  //Volver a asignar el evento cada vez que se actualiza el HTML
  document.getElementById("toggle-link").addEventListener("click", (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    updateForm();
  });
}

// Inicializar formulario
updateForm();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const endpoint = isLogin
    ? "http://localhost:5000/api/auth/login"
    : "http://localhost:5000/api/auth/register";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    responseMsg.textContent = data.message || "Operación exitosa ✅";


  } catch (error) {
    responseMsg.textContent = "Error al conectar con el servidor ❌";
  }
});
