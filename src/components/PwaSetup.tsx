"use client";

import { useEffect, useState } from "react";

// Registers the service worker and offers a notification permission prompt.
export function PwaSetup() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}

export function NotificationPrompt() {
  const [status, setStatus] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof Notification === "undefined") {
      setStatus("unsupported");
    } else {
      setStatus(Notification.permission);
    }
  }, []);

  async function enable() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setStatus(result);
    if (result === "granted") {
      new Notification("Trym reminders on 🎉", {
        body: "We'll remind you when it's time to plan, shop, or log.",
        icon: "/icon-192.png",
      });
    }
  }

  if (status === "granted" || status === "denied" || status === "unsupported") {
    return null;
  }

  return (
    <div
      className="card-saffron mb-4 flex items-center justify-between gap-4"
      style={{ padding: "14px 20px" }}
    >
      <p className="text-sm font-semibold leading-snug">
        🔔 Get reminders to plan, log, and weigh in.
      </p>
      <button
        type="button"
        onClick={enable}
        className="flex-none btn btn-secondary btn-sm"
        style={{ whiteSpace: "nowrap" }}
      >
        Enable
      </button>
    </div>
  );
}
