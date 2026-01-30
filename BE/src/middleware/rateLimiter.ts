import rateLimit from "express-rate-limit";
import { env } from "@/config/env";
import { MESSAGES } from "@/constants/messages";

export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  message: {
    success: false,
    message: MESSAGES.ERROR.GENERAL.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
   // 5 requests per window
  message: {
    success: false,
    message: MESSAGES.ERROR.GENERAL.TOO_MANY_AUTH_ATTEMPTS,
  },
});
