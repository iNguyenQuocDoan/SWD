"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

// Socket event types
export interface SocketReviewPayload {
  reviewId: string;
  productId: string;
  shopId: string;
  userId?: string;
  rating?: number;
  comment?: string;
  images?: string[];
  productRatingAvg?: number;
  productReviewCount?: number;
  shopRatingAvg?: number;
}

type ReviewEventType = "review:created" | "review:updated" | "review:deleted";
type ReviewEventHandler = (payload: SocketReviewPayload) => void;

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

/**
 * Hook to manage WebSocket connection for real-time review updates
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Join a product room to receive product-specific events
  const joinProductRoom = useCallback((productId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join:product", productId);
    }
  }, []);

  // Leave a product room
  const leaveProductRoom = useCallback((productId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave:product", productId);
    }
  }, []);

  // Join a shop room to receive shop-wide events
  const joinShopRoom = useCallback((shopId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join:shop", shopId);
    }
  }, []);

  // Leave a shop room
  const leaveShopRoom = useCallback((shopId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave:shop", shopId);
    }
  }, []);

  // Subscribe to review events
  const onReviewEvent = useCallback(
    (eventType: ReviewEventType, handler: ReviewEventHandler) => {
      if (socketRef.current) {
        socketRef.current.on(eventType, handler);
      }
      return () => {
        if (socketRef.current) {
          socketRef.current.off(eventType, handler);
        }
      };
    },
    []
  );

  // Subscribe to all review events with a single handler
  const onAnyReviewEvent = useCallback((handler: (eventType: ReviewEventType, payload: SocketReviewPayload) => void) => {
    const events: ReviewEventType[] = ["review:created", "review:updated", "review:deleted"];

    events.forEach((eventType) => {
      socketRef.current?.on(eventType, (payload: SocketReviewPayload) => {
        handler(eventType, payload);
      });
    });

    return () => {
      events.forEach((eventType) => {
        socketRef.current?.off(eventType);
      });
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinProductRoom,
    leaveProductRoom,
    joinShopRoom,
    leaveShopRoom,
    onReviewEvent,
    onAnyReviewEvent,
  };
}

/**
 * Hook to subscribe to real-time review updates for a specific product
 */
export function useProductReviews(
  productId: string | null,
  onReviewCreated?: ReviewEventHandler,
  onReviewUpdated?: ReviewEventHandler,
  onReviewDeleted?: ReviewEventHandler
) {
  const {
    isConnected,
    joinProductRoom,
    leaveProductRoom,
    onReviewEvent,
  } = useSocket();

  useEffect(() => {
    if (!productId || !isConnected) return;

    // Join the product room
    joinProductRoom(productId);

    // Subscribe to events
    const unsubCreated = onReviewCreated
      ? onReviewEvent("review:created", onReviewCreated)
      : () => {};
    const unsubUpdated = onReviewUpdated
      ? onReviewEvent("review:updated", onReviewUpdated)
      : () => {};
    const unsubDeleted = onReviewDeleted
      ? onReviewEvent("review:deleted", onReviewDeleted)
      : () => {};

    return () => {
      leaveProductRoom(productId);
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [
    productId,
    isConnected,
    joinProductRoom,
    leaveProductRoom,
    onReviewEvent,
    onReviewCreated,
    onReviewUpdated,
    onReviewDeleted,
  ]);

  return { isConnected };
}

/**
 * Hook to subscribe to real-time review updates for a specific shop
 */
export function useShopReviews(
  shopId: string | null,
  onReviewCreated?: ReviewEventHandler,
  onReviewUpdated?: ReviewEventHandler,
  onReviewDeleted?: ReviewEventHandler
) {
  const {
    isConnected,
    joinShopRoom,
    leaveShopRoom,
    onReviewEvent,
  } = useSocket();

  useEffect(() => {
    if (!shopId || !isConnected) return;

    // Join the shop room
    joinShopRoom(shopId);

    // Subscribe to events
    const unsubCreated = onReviewCreated
      ? onReviewEvent("review:created", onReviewCreated)
      : () => {};
    const unsubUpdated = onReviewUpdated
      ? onReviewEvent("review:updated", onReviewUpdated)
      : () => {};
    const unsubDeleted = onReviewDeleted
      ? onReviewEvent("review:deleted", onReviewDeleted)
      : () => {};

    return () => {
      leaveShopRoom(shopId);
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [
    shopId,
    isConnected,
    joinShopRoom,
    leaveShopRoom,
    onReviewEvent,
    onReviewCreated,
    onReviewUpdated,
    onReviewDeleted,
  ]);

  return { isConnected };
}
