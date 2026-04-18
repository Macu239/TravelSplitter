"use client";
// components/ShareButton.jsx

import { useState } from "react";
import styles from "./ShareButton.module.css";

export default function ShareButton({ tripId }) {
  const [state, setState] = useState("idle"); // 'idle' | 'copied' | 'error'

  async function handleShare() {
    const url = `${window.location.origin}/tripPage/${tripId}`;
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("error");
    }

    setTimeout(() => setState("idle"), 2500);
  }

  const label =
    state === "copied"
      ? "✓ Link copied!"
      : state === "error"
        ? "Copy failed — try again"
        : "Share trip link";

  return (
    <button
      onClick={handleShare}
      className={[styles.shareBtn, styles[state]].join(" ")}
    >
      {state === "idle" && (
        <img src="/share.svg" alt="Share icon" className={styles.icon} />
        
      )}
      {label}
    </button>
  );
}
