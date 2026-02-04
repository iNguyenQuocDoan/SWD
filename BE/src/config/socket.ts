import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "./env";
import {
  SocketReviewPayload,
  SocketReviewEventType,
  SocketChatEventType,
  SocketTicketEventType,
  SocketMessagePayload,
  SocketConversationPayload,
  SocketTicketPayload,
} from "@/types";

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

    // ===== Chat Socket Events =====

    // Join conversation room to receive real-time messages
    socket.on("join:conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave conversation room
    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Join user room for personal notifications
    socket.on("join:user", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    // Leave user room
    socket.on("leave:user", (userId: string) => {
      socket.leave(`user:${userId}`);
    });

    // Join staff tickets room for ticket notifications
    socket.on("join:staff:tickets", () => {
      socket.join("staff:tickets");
    });

    // Leave staff tickets room
    socket.on("leave:staff:tickets", () => {
      socket.leave("staff:tickets");
    });

    // Typing indicator events
    socket.on("typing:start", (data: { conversationId: string; userId: string; userName: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("typing:start", {
        conversationId: data.conversationId,
        userId: data.userId,
        userName: data.userName,
      });
    });

    socket.on("typing:stop", (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("typing:stop", {
        conversationId: data.conversationId,
        userId: data.userId,
      });
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

// ===== Chat Event Emitters =====

/**
 * Emit chat events to conversation room and participants
 */
export const emitChatEvent = (
  eventType: SocketChatEventType,
  payload: SocketMessagePayload
): void => {
  if (!io) {
    return;
  }

  // Emit to conversation room
  io.to(`conversation:${payload.conversationId}`).emit(eventType, payload);

  // Also emit to sender's user room for multi-device sync
  io.to(`user:${payload.senderUserId}`).emit(eventType, payload);
};

/**
 * Emit conversation update events
 */
export const emitConversationEvent = (
  eventType: "conversation:updated" | "conversation:closed",
  payload: SocketConversationPayload,
  participantUserIds: string[]
): void => {
  if (!io) {
    return;
  }

  // Emit to conversation room
  io.to(`conversation:${payload.conversationId}`).emit(eventType, payload);

  // Also emit to all participants' user rooms
  for (const userId of participantUserIds) {
    io.to(`user:${userId}`).emit(eventType, payload);
  }
};

/**
 * Emit ticket events to customer and staff
 */
export const emitTicketEvent = (
  eventType: SocketTicketEventType,
  payload: SocketTicketPayload
): void => {
  if (!io) {
    return;
  }

  // Emit to customer's user room
  if (payload.customerUserId) {
    io.to(`user:${payload.customerUserId}`).emit(eventType, payload);
  }

  // Emit to assigned staff's user room
  if (payload.assignedToUserId) {
    io.to(`user:${payload.assignedToUserId}`).emit(eventType, payload);
  }

  // Emit to staff tickets room for new/escalated tickets
  if (eventType === "ticket:created" || eventType === "ticket:escalated") {
    io.to("staff:tickets").emit(eventType, payload);
  }
};

/**
 * Emit notification to specific user
 */
export const emitUserNotification = (
  userId: string,
  eventType: string,
  payload: Record<string, unknown>
): void => {
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit(eventType, payload);
};
