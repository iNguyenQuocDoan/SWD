import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "./env";
import { SocketReviewPayload, SocketReviewEventType } from "@/types";

let io: Server | null = null;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    // Join product room to receive product-specific review events
    socket.on("join:product", (productId: string) => {
      socket.join(`product:${productId}`);
    });

    // Leave product room
    socket.on("leave:product", (productId: string) => {
      socket.leave(`product:${productId}`);
    });

    // Join shop room to receive shop-wide review events
    socket.on("join:shop", (shopId: string) => {
      socket.join(`shop:${shopId}`);
    });

    // Leave shop room
    socket.on("leave:shop", (shopId: string) => {
      socket.leave(`shop:${shopId}`);
    });

    socket.on("disconnect", () => {
      // Socket disconnected
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
};

// Emit review events to specific rooms
export const emitReviewEvent = (
  eventType: SocketReviewEventType,
  payload: SocketReviewPayload
): void => {
  if (!io) {
    return;
  }

  // Emit to product room
  io.to(`product:${payload.productId}`).emit(eventType, payload);

  // Emit to shop room
  io.to(`shop:${payload.shopId}`).emit(eventType, payload);
};
