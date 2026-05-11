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

    try {
      // STEP 1: OCR
      const formData = new FormData();
      formData.append("image", file);

      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        body: formData
      });

      const ocrData = await ocrRes.json();

      // STEP 2: AI SOLVE
      const aiRes = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ocrData.text })
      });

      const aiData = await aiRes.json();

      setResult(aiData.solution);
    } catch (err) {
      setResult("Error processing image");
    }

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
