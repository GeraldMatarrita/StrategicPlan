require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// Middlewares
app.use(express.json());

// CORS configuration and route handling based on environment
if (process.env.TARGET === "DEV") {
  console.log("Target is DEV");

  // CORS configuration - Allows requests from a specific origin
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:4200",
        "http://140.84.171.60",
      ];
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 204, // Return a 204 success code
    methods: "GET, POST, PUT, DELETE, PATCH", // Allow these HTTP methods
    credentials: true, // Allow cookies to be sent securely
  };

  app.use(cors(corsOptions)); // Use the CORS middleware
} else if (process.env.TARGET === "PROD") {
  console.log("Target is PROD");

  // Define the root directory for serving frontend files
  const root = path.join(__dirname, "/dist/frontend/browser");

  // Serve static files from the frontend
  app.use(express.static(root));
}

// ---------------------------------------------------------------------
// API Routes (Declare backend routes before serving static files)
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

const CameAnalysis = require("./Routes/cameAnalysisRoute");
app.use("/api/cameAnalysis", CameAnalysis);

const SwotAnalysis = require("./Routes/swotAnalysisRoute");
app.use("/api/swotAnalysis", SwotAnalysis);

const CardAnalysis = require("./Routes/cardAnalysisRoute");
app.use("/api/cardAnalysis", CardAnalysis);

const Activities = require("./Routes/activityRoute");
app.use("/api/activity", Activities);

const Indicator = require("./Routes/indicatorRoute");
app.use("/api/indicator", Indicator);

const OperationalPlan = require("./Routes/operationalRoute");
app.use("/api/operationalPlan", OperationalPlan);

// ---------------------------------------------------------------------
// Serve frontend static files only after backend routes
// This ensures backend routes take priority
// ---------------------------------------------------------------------
if (process.env.TARGET === "PROD") {
  const root = path.join(__dirname, "/dist/frontend/browser");

  // Handle all routes that do not match backend routes
  app.get("*", function (req, res) {
    fs.stat(path.join(root, req.path), function (err) {
      if (err) {
        // If file is not found, serve 'index.html'
        res.sendFile("index.html", { root });
      } else {
        // If the file exists, send it
        res.sendFile(req.path, { root });
      }
    });
  });
}

// Database connection
const connection = require("./db");
connection();

// Port configuration
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));
