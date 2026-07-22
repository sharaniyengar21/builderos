"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DisconnectPluginButton({ disconnectUrl, name }: { disconnectUrl: string; name: string }) {
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  async function handleDisconnect() {
    if (!confirm(`Disconnect ${name}? Its stored credential and history will be removed.`)) return;
    setIsDisconnecting(true);
    try {
      await fetch(disconnectUrl, { method: "POST" });
      router.refresh();
    } finally {
      setIsDisconnecting(false);
    }
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={isDisconnecting}
      className="text-xs text-ink-muted underline hover:text-red-300 disabled:opacity-50"
    >
      {isDisconnecting ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
