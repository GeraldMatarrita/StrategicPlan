require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Conexión a la base de datos (asumiendo que tienes un archivo `db.js` para la conexión)
const connection = require("./db");
connection();

// Configuración del puerto
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));

const StrategicPlanRoute = require("./Routes/strategicPlanRoute");
app.use("/strategicPlan", StrategicPlanRoute);

const AuthRoute = require("./Routes/UserRoute");
app.use("/auth", AuthRoute);

// ---------------------------------------------------------------------
// borrar
// ---------------------------------------------------------------------
// Ejemplo de rutas
const basicaRoutes = require("./Routes/basicaRoute");
// Ruta basica
app.use("/basica", basicaRoutes);
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
