import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import connectDB from "@/config/database";
import { env } from "@/config/env";
import apiRoutes from "@/routes";
import { errorHandler } from "@/middleware/errorHandler";

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        env.corsOrigin,
        process.env.CORS_ORIGIN || process.env.VERCEL_URL || 'http://localhost:3000'
      ];
      
      // Allow Vercel preview URLs
      if (origin.includes('.vercel.app') || origin.includes('localhost') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('🚫 CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
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

// API Routes
app.use("/api", apiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(errorHandler);

// Export for Vercel serverless
export default app;
