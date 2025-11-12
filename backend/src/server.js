import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import { verifyToken } from "./middlewares/auth.middleware.js";

// Cargar variables de entorno
dotenv.config();

//  Inicializar la app
const app = express();
const PORT = process.env.PORT || 5000;

//  Seguridad avanzada: Helmet + Rate Limit
app.use(helmet()); // Protege cabeceras HTTP contra ataques comunes
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo de peticiones por IP
    message: "Demasiadas solicitudes desde esta IP. Inténtalo más tarde.",
  })
);

// Middlewares globales
app.use(cors());
app.use(express.json());

// RUTAS DE LA API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

//  Ruta protegida de ejemplo (verifica token)
app.get("/api/secure", verifyToken, (req, res) => {
  res.json({
    message: `Hola ${req.user.username}, esta es una ruta protegida `,
  });
});

//  CONFIGURACIÓN PARA SERVIR EL FRONTEND (Docker + Local)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_PATH = path.resolve("./frontend");

// Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(FRONTEND_PATH));

// Página principal (login)
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// Servir cualquier otro HTML (para evitar errores de ruta)
app.get("/:page", (req, res, next) => {
  const page = req.params.page;
  if (page.endsWith(".html")) {
    const filePath = path.join(FRONTEND_PATH, page);
    return res.sendFile(filePath, (err) => {
      if (err) next(); // Si no existe, pasa al manejador de error
    });
  }
  next();
});

// ❗ Si no encuentra nada, redirige al index
app.use((req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// Conectar a MongoDB
connectDB();

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`✅ SecureTask backend running on port ${PORT}`);
  console.log(`📂 Frontend servido desde: ${FRONTEND_PATH}`);
});
