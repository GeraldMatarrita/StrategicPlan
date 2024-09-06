// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const path = require('path');
// const fs = require("fs");

// const app = express();

// // Middlewares
// app.use(express.json());
// // Configuración de CORS y archivos estáticos basados en el entorno
// if (process.env.TARGET === "DEV") {
//     console.log("Target is DEV");

//     // Configuración de CORS - Permite solicitudes desde un origen específico
//     const corsOptions = {
//         origin: function (origin, callback) {
//             if (!origin) return callback(null, true);

//             const allowedOrigins = [
//                 'http://localhost:3000',
//                 'http://localhost:4200',
//                 'http://140.84.171.60'
//             ];
//             if (allowedOrigins.indexOf(origin) !== -1) {
//                 callback(null, true);
//             } else {
//                 callback(new Error('Not allowed by CORS'));
//             }
//         },
//         optionsSuccessStatus: 204, // Devolver un código de éxito 204
//         methods: "GET, POST, PUT, DELETE", // Permitir estos métodos HTTP
//         credentials: true, // Permite enviar cookies de forma segura
//     };

//     app.use(cors(corsOptions)); // Usar el middleware CORS

// } else if (process.env.TARGET === "PROD") {
//     console.log("Target is PROD");

//     // Definir el archivo raíz para servir los archivos
//     const root = path.join(__dirname, '/dist/frontend/browser');

//     // Servir los archivos estáticos
//     app.use(express.static(root));

//     // Manejar todas las rutas
//     app.get('*', function (req, res) {
//         fs.stat(path.join(root, req.path), function (err) {
//             if (err) {
//                 res.sendFile('index.html', { root });
//             } else {
//                 res.sendFile(req.path, { root });
//             }
//         });
//     });
// }

// // Conexión a la base de datos
// const connection = require("./db");
// connection();

// // Configuración del puerto
// const port = process.env.PORT || 8080;
// app.listen(port, () => console.log(`Listening on port ${port}...`));

// // ---------------------------------------------------------------------
// // Rutas
// // ---------------------------------------------------------------------
// const StrategicPlanRoute = require("./Routes/strategicPlanRoute");
// app.use("/strategicPlan", StrategicPlanRoute);

// const AuthRoute = require("./Routes/UserRoute");
// app.use("/auth", AuthRoute);

// const Invitations = require("./Routes/invitationRoute");
// app.use("/invitations", Invitations);

// // ---------------------------------------------------------------------
// // borrar de aqui para abajo al terminar el proyecto
// // ---------------------------------------------------------------------
// // Ejemplo de rutas
// const basicaRoutes = require("./Routes/basicaRoute");
// // Ruta basica
// app.use("/basica", basicaRoutes);
// // ---------------------------------------------------------------------
// // ---------------------------------------------------------------------
// // ---------------------------------------------------------------------

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path'); // Asegúrate de tener el módulo path
const fs = require('fs'); // Asegúrate de tener el módulo fs

const app = express();

// Middlewares
app.use(express.json());

// Configuración de CORS y archivos estáticos basados en el entorno
if (process.env.TARGET === "DEV") {
    console.log("Target is DEV");

    // Configuración de CORS para desarrollo
    const corsOptions = {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:4200',
                'http://140.84.171.60:8080' // Permitir también este origen en desarrollo
            ];
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        optionsSuccessStatus: 204,
        methods: "GET, POST, PUT, DELETE",
        credentials: true,
    };

    app.use(cors(corsOptions));

} else if (process.env.TARGET === "PROD") {
    console.log("Target is PROD");

    // Configuración de CORS para producción
    const corsOptions = {
        origin: 'http://140.84.171.60', // Permitir el origen del frontend
        optionsSuccessStatus: 204,
        methods: "GET, POST, PUT, DELETE",
        credentials: true,
    };

    app.use(cors(corsOptions)); // Usar el middleware CORS en producción

    // Definir el archivo raíz para servir los archivos
    const root = path.join(__dirname, '/dist/frontend/browser');

    // Servir los archivos estáticos
    app.use(express.static(root));

    // Manejar todas las rutas
    app.get('*', function (req, res) {
        fs.stat(path.join(root, req.path), function (err) {
            if (err) {
                res.sendFile('index.html', { root });
            } else {
                res.sendFile(req.path, { root });
            }
        });
    });
}

// Conexión a la base de datos
const connection = require("./db");
connection();

// Configuración del puerto
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));

// ---------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------
const StrategicPlanRoute = require("./Routes/strategicPlanRoute");
app.use("/strategicPlan", StrategicPlanRoute);

const AuthRoute = require("./Routes/UserRoute");
app.use("/auth", AuthRoute);

const Invitations = require("./Routes/invitationRoute");
app.use("/invitations", Invitations);

// ---------------------------------------------------------------------
// Rutas de ejemplo, eliminar luego
// ---------------------------------------------------------------------
const basicaRoutes = require("./Routes/basicaRoute");
app.use("/basica", basicaRoutes);
