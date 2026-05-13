"use client";

import { useState } from "react";
import styles from "./page.module.css";
import ChatWidget from "@/components/ChatWidget";

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

      // ✅ IMPORTANT FIX (your issue)
      if (!ocrData.text || !ocrData.text.trim()) {
        setLoading(false);
        setResult("❌ No text extracted from image. Try a clearer image.");
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

      console.log("AI DATA:", aiData);

      setResult(
        aiData.solution || "No solution returned from AI."
      );
    } catch (err: any) {
      console.log("FRONTEND ERROR:", err);

      setResult(
        err?.message || "Something went wrong."
      );
    }

    setLoading(false);
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <h1 className={styles.title}>
        AI Homework Helper 🚀
      </h1>

      <p style={{ color: "#666", marginBottom: 15 }}>
        Upload a clear image of your homework and get step-by-step AI solutions.
        You can also chat with AI using the floating assistant.
      </p>

      {/* FILE INPUT */}
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
