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
  vnpayTmnCode: string;
  vnpaySecretKey: string;
  vnpayUrl: string;
  vnpayReturnUrl: string;
  vnpayIpnUrl: string;
  backendUrl: string;
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
    vnpayTmnCode: process.env.VNPAY_TMN_CODE || "FEO4I1LY",
    vnpaySecretKey: process.env.VNPAY_SECRET_KEY || "OFB6MUKNV0DJQQO0J53GVSIDUSMY25IF",
    vnpayUrl: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    // VNPay should return to backend so we can validate/lookup and then redirect to frontend with ref/status
    vnpayReturnUrl:
      process.env.VNPAY_RETURN_URL || `${process.env.BACKEND_URL || "http://localhost:3001"}/api/payments/vnpay/return`,
    vnpayIpnUrl: process.env.VNPAY_IPN_URL || "",
    backendUrl: process.env.BACKEND_URL || "http://localhost:3001",
  };
};

export const env = getEnvConfig();
