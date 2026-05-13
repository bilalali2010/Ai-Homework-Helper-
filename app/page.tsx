"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");

  async function handleSolve() {
    if (!file) {
      setResult("Please upload an image first.");
      return;
    }

    setLoading(true);
    setResult("");
    setChat([]);

    try {
      // OCR
      const formData = new FormData();
      formData.append("image", file);

      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        body: formData
      });

      const ocrData = await ocrRes.json();

      if (!ocrData.text?.trim()) {
        setResult("No text extracted from image.");
        return;
      }

      setContext(ocrData.text);

      // Solve
      const aiRes = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ocrData.text })
      });

      const aiData = await aiRes.json();

      setResult(aiData.solution || "No solution found.");

      // initialize chat history
      setChat([
        {
          role: "assistant",
          content: aiData.solution
        }
      ]);
    } catch (err: any) {
      setResult(err.message);
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!question.trim()) return;

    const newChat = [
      ...chat,
      { role: "user", content: question }
    ];

    setChat(newChat);
    setQuestion("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context,
        messages: newChat
      })
    });

    const data = await res.json();

    setChat([
      ...newChat,
      { role: "assistant", content: data.reply }
    ]);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI Homework Helper 🚀</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleSolve} disabled={loading}>
        {loading ? "Processing..." : "Solve Homework"}
      </button>

      <pre className={styles.result}>{result}</pre>

      {/* ================= CHATBOX ================= */}
      {chat.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Ask follow-up questions</h3>

          <div
            style={{
              border: "1px solid #ccc",
              padding: 10,
              height: 250,
              overflowY: "auto"
            }}
          >
            {chat.map((m, i) => (
              <div key={i}>
                <b>{m.role}:</b> {m.content}
                <hr />
              </div>
            ))}
          </div>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about solution..."
            style={{ width: "80%" }}
          />

          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}
