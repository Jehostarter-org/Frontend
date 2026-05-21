// lib/graphql/client.ts
//
// Three communication channels to the Django backend:
//
//   gqlFetch              — HTTP POST /graphql/  for queries + mutations
//   createGqlSubscription — WebSocket /ws/graphql/ for GraphQL subscriptions
//   createNotificationSocket — WebSocket /ws/notifications/ for the bell
//                             (lighter than full GraphQL, just JSON events)

const API_URL  = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
const HTTP_URL = `${API_URL}/graphql/`;
const WS_BASE  = API_URL.replace(/^http/, 'ws');

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

// ── 1. HTTP GraphQL (queries + mutations) ─────────────────────────────────────

export async function gqlFetch<T = any>(
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const token = getToken();
  const res = await fetch(HTTP_URL, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ── 2. GraphQL WebSocket subscription (graphql-transport-ws protocol) ─────────
// Used for: community feed, service status updates, full notification objects
// Endpoint: ws://127.0.0.1:8000/ws/graphql/

type SubscriptionHandler<T> = (data: T) => void;
export type UnsubscribeFn = () => void;

export function createGqlSubscription<T = any>(
  query: string,
  variables: Record<string, any> | undefined,
  onData: SubscriptionHandler<T>,
  onError?: (err: any) => void,
): UnsubscribeFn {
  const token = getToken();
  const url   = `${WS_BASE}/ws/graphql/`;
  let ws: WebSocket;
  let subscriptionId: string | null = null;
  let closed = false;

  function connect() {
    ws = new WebSocket(url, 'graphql-transport-ws');

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type:    'connection_init',
        payload: token ? { Authorization: `Bearer ${token}` } : {},
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'connection_ack': {
          subscriptionId = Math.random().toString(36).slice(2);
          ws.send(JSON.stringify({
            id:      subscriptionId,
            type:    'subscribe',
            payload: { query, variables },
          }));
          break;
        }
        case 'next': {
          if (msg.id === subscriptionId && msg.payload?.data) {
            const key = Object.keys(msg.payload.data)[0];
            onData(msg.payload.data[key] as T);
          }
          break;
        }
        case 'error':    { onError?.(msg.payload);  break; }
        case 'complete': { ws.close();               break; }
      }
    };

    ws.onerror  = (e) => { onError?.(e); };
    ws.onclose  = ()  => { if (!closed) setTimeout(connect, 3000); };
  }

  connect();

  return () => {
    closed = true;
    try {
      if (ws && subscriptionId) {
        ws.send(JSON.stringify({ id: subscriptionId, type: 'complete' }));
      }
    } catch {}
    ws?.close();
  };
}

// ── 3. Lightweight notification WebSocket (raw JSON) ─────────────────────────
// Used by notification-context.tsx for the bell icon count.
// Endpoint: ws://127.0.0.1:8000/ws/notifications/?token=<jwt>
// No GraphQL overhead — just JSON events: new_notification, pong

export interface RawNotificationEvent {
  type:           string;           // 'connection_established' | 'new_notification' | 'pong'
  unread_count?:  number;           // sent on connection_established
  payload?: {
    notification_id: string;
    type:            string;
    title:           string;
    message:         string;
    created_at:      string;
  };
}

export function createNotificationSocket(
  onEvent:  (event: RawNotificationEvent) => void,
  onError?: (err: any) => void,
): UnsubscribeFn {
  const token = getToken();
  if (!token) return () => {};          // not logged in — no-op

  const url = `${WS_BASE}/ws/notifications/?token=${encodeURIComponent(token)}`;
  let ws: WebSocket;
  let closed  = false;
  let pingInterval: ReturnType<typeof setInterval>;

  function connect() {
    ws = new WebSocket(url);

    ws.onopen = () => {
      // Keep-alive ping every 30 s
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30_000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RawNotificationEvent;
        onEvent(data);
      } catch {}
    };

    ws.onerror  = (e) => { onError?.(e); };
    ws.onclose  = ()  => {
      clearInterval(pingInterval);
      if (!closed) setTimeout(connect, 3000);   // auto-reconnect
    };
  }

  connect();

  return () => {
    closed = true;
    clearInterval(pingInterval);
    ws?.close();
  };
}