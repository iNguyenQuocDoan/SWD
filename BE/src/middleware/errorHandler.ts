import { Request, Response, NextFunction } from "express";
import { env } from "@/config/env";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Always log errors for debugging
  console.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    name: err.name,
    url: _req.url,
    method: _req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Log full error details
  console.error("Full error details:", err);

  res.status(500).json({
    success: false,
    message: env.nodeEnv === "production" ? "Internal server error" : err.message,
  });
};
