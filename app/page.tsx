"use client";

import { useState } from "react";
import styles from "./page.module.css";

// ✅ FIXED IMPORT (NO @/ alias issue)
import ChatWidget from "../components/ChatWidget";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSolve() {
    if (!file) {
      setResult("⚠️ Please upload an image first.");
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

      const ocrData = await ocrRes.json();

      if (!ocrRes.ok || ocrData.error) {
        setLoading(false);
        setResult(
          typeof ocrData.error === "string"
            ? ocrData.error
            : "OCR failed. Try a clearer image."
        );
        return;
      }

      // ✅ FIX: empty text check
      if (!ocrData.text || !ocrData.text.trim()) {
        setLoading(false);
        setResult("❌ No text extracted. Try a clearer image.");
        return;
      }

      console.log("OCR DATA:", ocrData);

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

      const aiData = await aiRes.json();

      if (!aiRes.ok || aiData.error) {
        setLoading(false);
        setResult(
          typeof aiData.error === "string"
            ? aiData.error
            : "AI failed to solve the problem."
        );
        return;
      }

      setResult(aiData.solution || "No solution returned.");
    } catch (err: any) {
      console.log("FRONTEND ERROR:", err);
      setResult(err?.message || "Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <div className={styles.container}>
      {/* TITLE */}
      <h1 className={styles.title}>
        AI Homework Helper 🚀
      </h1>

      {/* DESCRIPTION */}
      <p style={{ textAlign: "center", color: "#666" }}>
        This tool solves homework step-by-step using AI and also lets you chat about solutions.
      </p>

      {/* UPLOAD */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      {/* BUTTON */}
      <button
        className={styles.button}
        onClick={handleSolve}
        disabled={loading}
      >
        {loading ? "Processing..." : "Solve Homework"}
      </button>

      {/* RESULT */}
      <pre className={styles.result}>
        {result}
      </pre>

      {/* FLOATING CHATBOT */}
      <ChatWidget />
    </div>
  );
}
