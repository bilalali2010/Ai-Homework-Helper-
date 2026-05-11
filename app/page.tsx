"use client";

import { useState } from "react";
import styles from "./page.module.css";

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
    <div className={styles.container}>
      <h1 className={styles.title}>AI Homework Helper 🚀</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button className={styles.button} onClick={handleSolve}>
        Solve Homework
      </button>

      {loading && <p>Processing...</p>}

      <pre className={styles.result}>{result}</pre>
    </div>
  );
}
