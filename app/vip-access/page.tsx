"use client";
import { useState, useEffect } from "react";

export default function VipAccessPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setNextUrl(p.get("next"));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const r = await fetch("/api/vip/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
    setLoading(false);
    if (r.ok) {
      window.location.href = nextUrl || "/vip";
    } else {
      const { message } = await r.json().catch(() => ({ message: "Invalid code" }));
      setError(message || "Invalid code");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>TD Studios VIP</h1>
        <p className="muted" style={{ marginBottom: 20 }}>Enter your access code.</p>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter VIP code" autoFocus />
          <button className="btn" disabled={loading}>{loading ? "Checking…" : "Enter"}</button>
        </form>
        {error && <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
