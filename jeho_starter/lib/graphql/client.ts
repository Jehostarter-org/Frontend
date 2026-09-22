// lib/graphql/client.ts

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

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `GraphQL endpoint returned non-JSON response (${res.status}). Is the backend running?`
    );
  }

  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ── 2. GraphQL WebSocket subscription ────────────────────────────────────────

type SubscriptionHandler<T> = (data: T) => void;
export type UnsubscribeFn = () => void;

const MAX_RETRIES = 3;

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
  let closed  = false;
  let retries = 0;

  function connect() {
    if (closed || retries >= MAX_RETRIES) return;

    ws = new WebSocket(url, 'graphql-transport-ws');

    ws.onopen = () => {
      retries = 0; // reset on successful connection
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

    ws.onerror = (e) => { onError?.(e); };

    ws.onclose = (e) => {
      // 4400–4499 and 1008 are policy/auth errors — don't retry
      // Code 1006 = abnormal closure (usually 404/connection refused)
      if (closed) return;
      if (e.code === 1008 || retries >= MAX_RETRIES) {
        console.warn('[GQL WS] Max retries reached or policy error. Stopping reconnect.');
        return;
      }
      retries++;
      const delay = Math.min(1000 * 2 ** retries, 30_000); // exponential backoff
      setTimeout(connect, delay);
    };
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

// ── 3. Lightweight notification WebSocket ─────────────────────────────────────

export interface RawNotificationEvent {
  type:           string;
  unread_count?:  number;
  user_id?:       string | number;
  is_online?:     boolean;
  payload?: {
    notification_id: string;
    type:            string;
    title:           string;
    message:         string;
    link?:           string;
    created_at:      string;
  };
}

export function createNotificationSocket(
  onEvent:  (event: RawNotificationEvent) => void,
  onClose?: (err: any) => void,
): UnsubscribeFn {
  const token = getToken();
  if (!token) return () => {};

  const url = `${WS_BASE}/ws/notifications/?token=${encodeURIComponent(token)}`;
  let ws: WebSocket;
  let closed  = false;
  let retries = 0;
  let pingInterval: ReturnType<typeof setInterval>;

  function connect() {
    if (closed || retries >= MAX_RETRIES) return;

    ws = new WebSocket(url);

    ws.onopen = () => {
      retries = 0; // reset on successful connection
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

    ws.onerror = (e) => { onClose?.(e); };

    ws.onclose = (e) => {
      clearInterval(pingInterval);
      if (closed) return;
      if (retries >= MAX_RETRIES) {
        console.warn('[Notification WS] Max retries reached. WebSocket offline — will use HTTP polling only.');
        return;
      }
      retries++;
      const delay = Math.min(1000 * 2 ** retries, 30_000);
      setTimeout(connect, delay);
    };
  }

  connect();

  return () => {
    closed = true;
    clearInterval(pingInterval);
    ws?.close();
  };
}
