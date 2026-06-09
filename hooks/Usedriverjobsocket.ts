"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseDriverJobSocketOptions {
    token: string | null;
    enabled?: boolean;
    onNewJob?: (job: any) => void;
    onJobClaimed?: (jobId: string) => void;
}

export function useDriverJobSocket({
    token,
    enabled = true,
    onNewJob,
    onJobClaimed,
}: UseDriverJobSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryCountRef = useRef(0);
    const isUnmountedRef = useRef(false);
    const MAX_RETRIES = 3;

    useEffect(() => {
        if (!enabled || !token) return;
        isUnmountedRef.current = false;
        retryCountRef.current = 0;

        function connect() {
            if (isUnmountedRef.current) return;

            const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000";
            const url = `${wsBase}/ws/services/available/?token=${token}`;

            let ws: WebSocket;
            try {
                ws = new WebSocket(url);
            } catch {
                console.warn("[DriverJobSocket] WebSocket unavailable — using polling fallback.");
                return;
            }
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("[DriverJobSocket] connected");
                retryCountRef.current = 0;
            };

            ws.onmessage = (event: MessageEvent) => {
                try {
                    const msg = JSON.parse(event.data);

                    if (msg.type === "new_service_request") {
                        toast.success("New pickup request!", {
                            description: `${msg.payload.description || "A new passenger needs a pickup"}`,
                            duration: 10000,
                            action: {
                                label: "View",
                                onClick: () => {
                                    window.location.href = `/dashboard/driver/notifications`;
                                },
                            },
                        });
                        onNewJob?.(msg.payload);
                    }

                    if (msg.type === "service_claimed") {
                        console.log("[DriverJobSocket] job claimed:", msg.payload.service_id);
                        onJobClaimed?.(msg.payload.service_id);
                    }
                } catch (err) {
                    console.error("[DriverJobSocket] parse error", err);
                }
            };

            ws.onerror = () => {
                // Silently handled by onclose — WebSocket errors are followed by close events
            };

            ws.onclose = (event) => {
                console.log("[DriverJobSocket] closed", event.code);
                // Don't retry on auth failures or if unmounted
                if (isUnmountedRef.current || event.code === 4001 || event.code === 4003) return;
                // Exponential backoff with max retries
                if (retryCountRef.current < MAX_RETRIES) {
                    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 15000);
                    retryCountRef.current++;
                    console.log(`[DriverJobSocket] retrying in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
                    reconnectTimeoutRef.current = setTimeout(connect, delay);
                } else {
                    console.warn("[DriverJobSocket] max retries reached — using polling fallback.");
                }
            };
        }

        connect();

        return () => {
            isUnmountedRef.current = true;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [token, enabled, onNewJob, onJobClaimed]);
}