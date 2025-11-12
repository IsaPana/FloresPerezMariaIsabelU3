import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js"; 
import { verifyToken } from "./middlewares/auth.middleware.js";

// Cargar variables de entorno
dotenv.config();

//Inicializar la app
const app = express();
const PORT = process.env.PORT || 5000;

//Middlewares globales
app.use(cors());
app.use(express.json());

//RUTAS DE LA API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes); 

// Ejemplo de ruta protegida
app.get("/api/secure", verifyToken, (req, res) => {
  res.json({ message: `Hola ${req.user.username}, esta es una ruta protegida ✅` });
});

//CONFIGURACIÓN PARA SERVIR EL FRONTEND
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta del frontend dentro del contenedor (copiada por Dockerfile)
const FRONTEND_PATH = path.join(__dirname, "../frontend");

// Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(FRONTEND_PATH));

// Cuando el usuario entra a "/", servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// Conectar a MongoDB
connectDB();

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`✅ SecureTask backend running on port ${PORT}`);
});
