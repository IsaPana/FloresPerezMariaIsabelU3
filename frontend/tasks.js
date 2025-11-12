const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const responseMsg = document.getElementById("response-msg");
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Detecta en qué vista estás
  const path = window.location.pathname;

  if (path.includes("add-task")) setupAddTask();
  if (path.includes("tasks-pending") || path.includes("tasks-done")) getTasks();
});

// --- AGREGAR TAREA ---
function setupAddTask() {
  const form = document.getElementById("task-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("dueDate").value;

    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, dueDate }),
      });

      const data = await res.json();
      responseMsg.textContent = data.message || " Tarea creada exitosamente";

      form.reset();
    } catch (error) {
      responseMsg.textContent = " Error al crear tarea.";
    }
  });
}

//  --- OBTENER TAREAS ---
async function getTasks() {
  try {
    const res = await fetch("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const tasks = await res.json();

    const container = document.getElementById("tasks-container");
    const path = window.location.pathname;
    const showCompleted = path.includes("done");

    const filtered = tasks.filter((t) => t.completed === showCompleted);

    container.innerHTML = "";

    if (filtered.length === 0) {
      container.innerHTML = "<p>No hay tareas en esta categoría.</p>";
      return;
    }

    filtered.forEach((task) => {
      const card = document.createElement("div");
      card.classList.add("task-card");
      if (task.completed) card.classList.add("completed");

      card.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description || "Sin descripción"}</p>
        <p><strong>Fecha límite:</strong> ${
          task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : "Sin fecha"
        }</p>
        <p><strong>Estado:</strong> ${
          task.completed ? " Completada" : " Pendiente"
        }</p>
        ${
          !task.completed
            ? `<button onclick="markAsDone('${task._id}')">Marcar como hecha</button>`
            : ""
        }
        <button onclick="deleteTask('${task._id}')">Eliminar</button>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error(error);
  }
}

//  --- MARCAR COMO COMPLETADA ---
async function markAsDone(id) {
  try {
    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    getTasks();
  } catch {
    responseMsg.textContent = "Error al actualizar tarea.";
  }
}

// 📌 --- ELIMINAR ---
async function deleteTask(id) {
  try {
    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    getTasks();
  } catch {
    responseMsg.textContent = " Error al eliminar tarea.";
  }
}
