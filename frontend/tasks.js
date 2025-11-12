// Verificación de sesión
async function verifyToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return null;
  }

  try {
    const res = await fetch("http://localhost:5000/api/secure", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      localStorage.removeItem("token");
      window.location.href = "index.html";
      return null;
    }
    return token;
  } catch {
    localStorage.removeItem("token");
    window.location.href = "index.html";
    return null;
  }
}

let token;
document.addEventListener("DOMContentLoaded", async () => {
  token = await verifyToken();
  if (!token) return;

  const logoutBtn = document.getElementById("logout-btn");
  const responseMsg = document.getElementById("response-msg");
  const path = window.location.pathname;

  if (path.includes("add-task")) {
    const form = document.getElementById("task-form");
    form.addEventListener("submit", addTask);
  } else {
    getTasks();
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
});

// Agregar nueva tarea
async function addTask(e) {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const responseMsg = document.getElementById("response-msg");

  if (!title) {
    responseMsg.textContent = " Ingresa un título para la tarea.";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, dueDate }),
    });

    if (res.ok) {
      responseMsg.textContent = " Tarea añadida correctamente";
      e.target.reset();
      setTimeout(() => (window.location.href = "tasks-pending.html"), 900);
    } else {
      responseMsg.textContent = " Error al agregar tarea";
    }
  } catch {
    responseMsg.textContent = " Error al conectar con el servidor";
  }
}

// Obtener y mostrar tareas
async function getTasks() {
  const responseMsg = document.getElementById("response-msg");
  try {
    const res = await fetch("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const tasks = await res.json();

    const path = window.location.pathname;
    const filtered = path.includes("pending")
      ? tasks.filter((t) => !t.completed)
      : tasks.filter((t) => t.completed);

    renderTasks(filtered);
  } catch {
    responseMsg.textContent = "Error al obtener tareas";
  }
}

// Renderizar cards
function renderTasks(tasks) {
  const container = document.getElementById("tasks-container");
  container.innerHTML = "";
  container.style.marginTop = "140px";

  if (!tasks.length) {
    container.innerHTML = `<p>No hay tareas ${
      window.location.pathname.includes("pending")
        ? "pendientes"
        : "finalizadas"
    }.</p>`;
    return;
  }

  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.gap = "20px";
  container.style.justifyContent = "center";

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.classList.add("task-card");

    card.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description || "Sin descripción"}</p>
      <p><strong>Fecha límite:</strong> ${
        task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Sin fecha"
      }</p>
      <p><strong>Estado:</strong> ${
        task.completed ? "Completada " : "Pendiente "
      }</p>
      ${
        !task.completed
          ? `<button class="done-btn" onclick="markAsDone('${task._id}')">Marcar como hecha</button>`
          : ""
      }
      <button class="delete-btn" onclick="deleteTask('${task._id}')">Eliminar</button>
    `;
    container.appendChild(card);
  });
}

// Marcar como completada (corregido)
async function markAsDone(id) {
  const responseMsg = document.getElementById("response-msg");
  try {
    const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed: true }),
    });

    const data = await res.json();

    if (res.ok && data) {
      responseMsg.textContent = " Tarea marcada como completada";
      // Esperar confirmación del backend y redirigir
      setTimeout(() => {
        window.location.href = "tasks-done.html";
      }, 1000);
    } else {
      responseMsg.textContent = " No se pudo completar la tarea correctamente.";
    }
  } catch (err) {
    console.error(err);
    responseMsg.textContent = "Error al actualizar tarea.";
  }
}

//  Eliminar tarea
async function deleteTask(id) {
  const responseMsg = document.getElementById("response-msg");
  try {
    const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      responseMsg.textContent = " Tarea eliminada correctamente";
      setTimeout(getTasks, 600);
    } else {
      responseMsg.textContent = " No se pudo eliminar la tarea";
    }
  } catch {
    responseMsg.textContent = " Error al eliminar tarea";
  }
}
// API externa: Consejo motivacionad
async function getMotivation() {
  const msg = document.getElementById("motivation");
  if (!msg) return; // Si no hay contenedor, no hacer nada

  msg.textContent = "💡 Cargando consejo motivacional...";

  try {
    // Primer API: obtener consejo en inglés
    const res = await fetch("https://api.adviceslip.com/advice");
    const data = await res.json();
    const original = data.slip.advice;

    // Segundo API: traducir al español (API gratuita)
    const translateRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(original)}&langpair=en|es`
    );
    const translateData = await translateRes.json();
    const translated = translateData.responseData.translatedText;

    msg.textContent = `💡 Consejo: "${translated}"`;
  } catch (error) {
    console.error("Error al obtener consejo:", error);
    msg.textContent = "💡 Consejo: “Sigue adelante, ¡vas muy bien!”";
  }
}


document.addEventListener("DOMContentLoaded", () => {
  getMotivation();
});
