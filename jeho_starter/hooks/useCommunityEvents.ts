"use client";

import { useEffect, useRef } from "react";

export interface CommunityEventMap {
  community_created: { community: any };
  community_deleted: { community_id: string };
  community_updated: { community: any };
  new_conversation: { conversation: any };
  community_message: {
    id: string;
    community_id: string;
    community_name: string;
    sender_username: string;
    sender_avatar: string | null;
    content: string;
    attachment_name: string;
    created_at: string;
  };
}

type CommunityEventCallback<T extends keyof CommunityEventMap> = (data: CommunityEventMap[T]) => void;

interface UseCommunityEventsOptions {
  onCommunityCreated?: CommunityEventCallback<"community_created">;
  onCommunityDeleted?: CommunityEventCallback<"community_deleted">;
  onCommunityUpdated?: CommunityEventCallback<"community_updated">;
  onNewConversation?: CommunityEventCallback<"new_conversation">;
  onCommunityMessage?: CommunityEventCallback<"community_message">;
}

export function useCommunityEvents(options: UseCommunityEventsOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let closed = false;

    function connect() {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) return;

      const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000";
      const ws = new WebSocket(`${wsBase}/ws/community/events/?token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const opts = optionsRef.current;
          switch (data.type) {
            case "community_created":
              opts.onCommunityCreated?.(data);
              break;
            case "community_deleted":
              opts.onCommunityDeleted?.(data);
              break;
            case "community_updated":
              opts.onCommunityUpdated?.(data);
              break;
            case "new_conversation":
              opts.onNewConversation?.(data);
              break;
            case "community_message":
              opts.onCommunityMessage?.(data);
              break;
          }
        } catch {}
      };

      ws.onclose = () => {
        if (closed) return;
        retryRef.current++;
        if (retryRef.current > 10) return;
        setTimeout(connect, 3000 * Math.min(retryRef.current, 5));
      };

      ws.onopen = () => {
        retryRef.current = 0;
      };
    }

    connect();

    return () => {
      closed = true;
      wsRef.current?.close();
    };
  }, []);
}
