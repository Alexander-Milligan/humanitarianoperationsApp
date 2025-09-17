"use client";

import { useState } from "react";

export default function CheckHashTestPage() {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [result, setResult] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult("Checking...");

    try {
      const res = await fetch("/api/debug/check-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, hash }),
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult("Error: " + (err as Error).message);
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Check Hash Debug</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "400px", marginBottom: "1rem" }}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Hash"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            style={{ width: "400px", marginBottom: "1rem" }}
          />
        </div>
        <button type="submit">Check</button>
      </form>

      <pre
        style={{
          marginTop: "1rem",
          background: "#111",
          color: "#0f0",
          padding: "1rem",
        }}
      >
        {result}
      </pre>
    </div>
  );
}
