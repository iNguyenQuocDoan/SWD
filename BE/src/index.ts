import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import connectDB from "@/config/database";
import { env } from "@/config/env";
import apiRoutes from "@/routes";
import { errorHandler } from "@/middleware/errorHandler";
import { MESSAGES } from "@/constants/messages";
import { schedulerService } from "@/services/scheduler/scheduler.service";

const app = express();

// Connect to database
connectDB();

// Start disbursement scheduler (auto-release escrow after 72h)
schedulerService.startDisbursementScheduler();

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(compression()); // Compress responses
app.use(morgan("dev")); // Logging
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// Swagger UI
const swaggerFilePath = path.join(__dirname, "..", "swagger.yml");
let swaggerDocument;
try {
  swaggerDocument = YAML.load(swaggerFilePath);
  console.log("Swagger document loaded successfully");

  const swaggerOptions = {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Marketplace API Documentation",
    persistAuthorization: true, // Giữ authorization khi refresh
    filter: true,
    validatorUrl: null,
    supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
    docExpansion: "list" as const,
  };

  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

  // Redirect /swagger/ to /swagger
  app.get("/swagger/", (_req, res) => {
    res.redirect("/swagger");
  });
} catch (err) {
  console.warn("Could not load swagger file:", err);
}

// Static files (uploads)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Routes
app.use("/api", apiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: MESSAGES.ERROR.GENERAL.ROUTE_NOT_FOUND,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = env.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${env.nodeEnv} mode`);
  console.log(`Swagger UI available at http://localhost:${PORT}/swagger`);
});

export default app;
