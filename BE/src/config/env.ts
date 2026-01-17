import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  mongoURI: string;
  jwtSecret: string;
  jwtExpire: string;
  jwtRefreshSecret: string;
  jwtRefreshExpire: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

const getEnvConfig = (): EnvConfig => {
  const requiredEnvVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    port: Number.parseInt(process.env.PORT || "3001", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    mongoURI: process.env.MONGODB_URI!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpire: process.env.JWT_EXPIRE || "7d",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || "30d",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
    rateLimitWindowMs: Number.parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || "900000",
      10
    ),
    rateLimitMaxRequests: Number.parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || "100",
      10
    ),
  };
};

export const env = getEnvConfig();
