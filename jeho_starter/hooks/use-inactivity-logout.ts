"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  logOut,
  selectCurrentToken,
} from "@/lib/features/auth/authSlice";

// Time of inactivity (in milliseconds) before the user is automatically logged out.
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

export function useInactivityLogout(timeoutMs: number = INACTIVITY_TIMEOUT_MS) {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectCurrentToken);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoggedInRef = useRef(isLoggedIn);

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!isLoggedInRef.current) {
      return;
    }
    // logOut() clears localStorage + the __session cookie and hard-redirects to /auth/login
    timerRef.current = setTimeout(() => dispatch(logOut()), timeoutMs);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const onActivity = () => resetTimer();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true }),
    );

    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, onActivity),
      );
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoggedIn, timeoutMs]);
}
