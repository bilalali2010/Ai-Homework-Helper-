"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input }
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages })
    });

    const data = await res.json();

    setLoading(false);

    if (data.reply) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply }
      ]);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          padding: 16,
          borderRadius: "50%",
          background: "#111",
          color: "#fff",
          fontSize: 20,
          zIndex: 9999
        }}
      >
        💬
      </button>

      {/* Chat Box */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: 350,
            height: 500,
            background: "#0f0f0f",
            color: "white",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 12,
              background: "#1a1a1a",
              fontWeight: "bold"
            }}
          >
            AI Homework Chat Assistant
          </div>

          {/* Info bar */}
          <div
            style={{
              fontSize: 12,
              padding: 8,
              color: "#aaa",
              background: "#151515"
            }}
          >
            Ask follow-up questions about your solution
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto"
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  textAlign:
                    m.role === "user" ? "right" : "left"
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: 10,
                    borderRadius: 10,
                    background:
                      m.role === "user"
                        ? "#2563eb"
                        : "#333",
                    maxWidth: "80%"
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ color: "#888" }}>
                AI is thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: "flex", padding: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask follow-up question..."
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "none"
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: 8,
                padding: "10px 14px",
                background: "#2563eb",
                color: "white",
                borderRadius: 8
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
