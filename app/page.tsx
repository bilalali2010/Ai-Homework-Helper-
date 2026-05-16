"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";
import styles from "./page.module.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSolve() {
    if (!file) {
      setResult("Please upload an image first.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      // OCR
      const formData = new FormData();
      formData.append("image", file);

      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!ocrRes.ok) {
        throw new Error("OCR request failed");
      }

      const ocrData = await ocrRes.json();

      if (
        ocrData.error ||
        !ocrData.text?.trim()
      ) {
        setResult(
          "No text extracted from image. Try a clearer image."
        );

        setLoading(false);
        return;
      }

      // AI Solve
      const aiRes = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: ocrData.text,
        }),
      });

      if (!aiRes.ok) {
        throw new Error("AI solving failed");
      }

      const aiData = await aiRes.json();

      if (aiData.error) {
        setResult(
          typeof aiData.error === "string"
            ? aiData.error
            : JSON.stringify(
                aiData.error,
                null,
                2
              )
        );
      } else {
        setResult(aiData.solution);

        setMessages([
          {
            role: "assistant",
            content: aiData.solution,
          },
        ]);
      }
    } catch (err: any) {
      setResult(
        err.message ||
          "Something went wrong"
      );
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!chatInput.trim()) return;

    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: chatInput,
      },
    ];

    setMessages(updatedMessages);

    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!res.ok) {
        throw new Error(
          "Failed to get AI response"
        );
      }

      const data = await res.json();

      if (data.reply) {
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);
      }
    } catch (err) {
      console.log(err);
    }

    setChatLoading(false);
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          AI Homework Helper 🚀
        </h1>

        <p className={styles.subtitle}>
          Upload homework images, get
          step-by-step solutions, and
          chat with AI for deeper
          explanations.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selected =
              e.target.files?.[0];

            if (selected) {
              setFile(selected);

              setPreview(
                URL.createObjectURL(
                  selected
                )
              );
            }
          }}
          className={styles.input}
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className={styles.preview}
          />
        )}

        <button
          onClick={handleSolve}
          disabled={loading}
          className={styles.button}
        >
          {loading
            ? "Processing..."
            : "Solve Homework"}
        </button>

        {result && (
          <div className={styles.resultBox}>
            <h2>Solution</h2>

            <div className={styles.result}>
              <ReactMarkdown>
                {result}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className={styles.chatContainer}>
            <h2 className={styles.chatTitle}>
              Continue Chatting
            </h2>

            <div
              className={
                styles.chatMessages
              }
            >
              {messages.map(
                (msg, index) => (
                  <div
                    key={index}
                    className={
                      msg.role ===
                      "user"
                        ? styles.userMessage
                        : styles.aiMessage
                    }
                  >
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )
              )}

              <div
                ref={messagesEndRef}
              />
            </div>

            <div
              className={
                styles.chatInputContainer
              }
            >
              <input
                value={chatInput}
                onChange={(e) =>
                  setChatInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                      "Enter" &&
                    !chatLoading
                  ) {
                    sendMessage();
                  }
                }}
                placeholder="Ask follow-up questions..."
                className={
                  styles.chatInput
                }
              />

              <button
                onClick={
                  sendMessage
                }
                disabled={
                  chatLoading
                }
                className={
                  styles.sendButton
                }
              >
                {chatLoading
                  ? "Thinking..."
                  : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
