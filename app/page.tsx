"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSolve() {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/solve", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    setResult(data.solution);
    setLoading(false);
  }

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1>🚀 AI Homework Helper</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleSolve} style={{ marginLeft: 10 }}>
        Solve
      </button>

      {loading && <p>Processing...</p>}

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        {result}
      </pre>
    </div>
  );
}
