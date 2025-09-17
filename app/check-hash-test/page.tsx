"use client";

import { useState } from "react";

export default function CheckHashTest() {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [result, setResult] = useState("");

  async function handleCheck() {
    setResult("Checking...");

    try {
      const res = await fetch("/api/debug/check-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, hash }),
      });

      const text = await res.text(); // read raw text
      try {
        const data = JSON.parse(text); // parse if valid JSON
        setResult(JSON.stringify(data, null, 2));
      } catch {
        setResult("❌ Not valid JSON: " + text);
      }
    } catch (err) {
      setResult("❌ Error calling API: " + (err as Error).message);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Check Hash Debug</h2>
      <input
        type="text"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "400px" }}
      />
      <input
        type="text"
        placeholder="Hash"
        value={hash}
        onChange={(e) => setHash(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "400px" }}
      />
      <button onClick={handleCheck}>Check</button>

      {result && (
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
      )}
    </div>
  );
}
