"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSolve() {
    if (!file) {
      setResult("Please upload an image first.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      // =========================
      // STEP 1: OCR
      // =========================
      const formData = new FormData();
      formData.append("image", file);

      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        body: formData
      });

      if (!ocrRes.ok) {
        setLoading(false);
        setResult("OCR request failed.");
        return;
      }

      const ocrData = await ocrRes.json();

      console.log("OCR DATA:", ocrData);

      if (ocrData.error) {
        setLoading(false);
        setResult(`OCR Error: ${ocrData.error}`);
        return;
      }

      // =========================
      // STEP 2: AI SOLVE
      // =========================
      const aiRes = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: ocrData.text
        })
      });

      if (!aiRes.ok) {
        setLoading(false);
        setResult("AI request failed.");
        return;
      }

      const aiData = await aiRes.json();

      console.log("AI DATA:", aiData);

      // =========================
      // ERROR HANDLING
      // =========================
      if (aiData.error) {
        setResult(
          typeof aiData.error === "string"
            ? aiData.error
            : JSON.stringify(aiData.error, null, 2)
        );
      } else {
        setResult(aiData.solution || "No solution returned.");
      }
    } catch (err: any) {
      console.log("FRONTEND ERROR:", err);

      setResult(
        err?.message || "Something went wrong while processing."
      );
    }

    setLoading(false);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        AI Homework Helper 🚀
      </h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <button
        className={styles.button}
        onClick={handleSolve}
        disabled={loading}
      >
        {loading ? "Processing..." : "Solve Homework"}
      </button>

      <pre className={styles.result}>
        {result}
      </pre>
    </div>
  );
}
