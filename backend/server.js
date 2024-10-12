// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");

// const app = express();

// // Middlewares
// app.use(express.json());

// // Configuración de CORS y manejo de rutas según el entorno
// if (process.env.TARGET === "DEV") {
//   console.log("Target is DEV");

//   // Configuración de CORS - Permite solicitudes desde un origen específico
//   const corsOptions = {
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);

//       const allowedOrigins = [
//         "http://localhost:3000",
//         "http://localhost:4200",
//         "http://140.84.171.60",
//       ];
//       if (allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     optionsSuccessStatus: 204, // Devolver un código de éxito 204
//     methods: "GET, POST, PUT, DELETE", // Permitir estos métodos HTTP
//     credentials: true, // Permite enviar cookies de forma segura
//   };

//   app.use(cors(corsOptions)); // Usar el middleware CORS
// } else if (process.env.TARGET === "PROD") {
//   console.log("Target is PROD");

//   // Definir el archivo raíz para servir los archivos del frontend
//   const root = path.join(__dirname, "/dist/frontend/browser");

//   // Servir los archivos estáticos del frontend
//   app.use(express.static(root));
// }

// // ---------------------------------------------------------------------
// // Rutas de la API (Declarar rutas del backend antes de servir archivos estáticos)
// // ---------------------------------------------------------------------
// const StrategicPlanRoute = require("./Routes/strategicPlanRoute");
// app.use("/api/strategicPlan", StrategicPlanRoute);

// const AuthRoute = require("./Routes/UserRoute");
// app.use("/api/auth", AuthRoute);

// const Invitations = require("./Routes/invitationRoute");
// app.use("/api/invitations", Invitations);

// // ---------------------------------------------------------------------
// // Servir archivos estáticos del frontend solo después de las rutas del backend
// // Esto asegura que las rutas del backend tengan prioridad
// // ---------------------------------------------------------------------
// if (process.env.TARGET === "PROD") {
//   const root = path.join(__dirname, "/dist/frontend/browser");

//   // Manejar todas las rutas que no coincidan con las rutas del backend
//   app.get("*", function (req, res) {
//     fs.stat(path.join(root, req.path), function (err) {
//       if (err) {
//         // Si no encuentra el archivo, servir 'index.html'
//         res.sendFile("index.html", { root });
//       } else {
//         // Si el archivo existe, enviarlo
//         res.sendFile(req.path, { root });
//       }
//     });
//   });
// }

// // Conexión a la base de datos
// const connection = require("./db");
// connection();

// // Configuración del puerto
// const port = process.env.PORT || 8080;
// app.listen(port, () => console.log(`Listening on port ${port}...`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Conexión a la base de datos (asumiendo un archivo `db.js` para la conexión)
const connection = require("./db");
connection();

// Configuración del puerto
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));

// ---------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------
const StrategicPlanRoute = require("./Routes/strategicPlanRoute");
app.use("/api/strategicPlan", StrategicPlanRoute);

const AuthRoute = require("./Routes/UserRoute");
app.use("/api/auth", AuthRoute);

const Invitations = require("./Routes/invitationRoute");
app.use("/api/invitations", Invitations);

const Objective = require("./Routes/objectiveRoute");
app.use("/api/objective", Objective);

const Goals = require("./Routes/goalRoute");
app.use("/api/goals", Goals);

const Objective = require("./Routes/objectiveRoute");
app.use("/api/objective", Objective);

const Goals = require("./Routes/goalRoute");
app.use("/api/goals", Goals);

const CameAnalysis = require("./Routes/cameAnalysisRoute")
app.use("/api/cameAnalysis",CameAnalysis)

const SwotAnalysis = require("./Routes/swotAnalysisRoute")
app.use("/api/swotAnalysis",SwotAnalysis)

const CardAnalysis = require("./Routes/cardAnalysisRoute")
app.use("/api/cardAnalysis",CardAnalysis)
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// al finalizar borrar esta ya que es solo de pruebas
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// Ejemplo de rutas
const basicaRoutes = require("./Routes/basicaRoute");
// Ruta basica
app.use("/api/basica", basicaRoutes);
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
