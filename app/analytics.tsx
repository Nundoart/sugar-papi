"use client";

import { useEffect } from "react";

export default function AnalyticsTracker() {
  useEffect(() => {
    const key = "sugar_papi_session";
    let session = localStorage.getItem(key);
    if (!session) {
      session = crypto.randomUUID();
      localStorage.setItem(key, session);
    }

    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "landing_view",
        session,
        path: window.location.pathname,
      }),
    }).catch(() => {});
  }, []);

  return null;
}
