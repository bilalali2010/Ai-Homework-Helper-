"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: string; content: string }[]
  >([]);
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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();

      if (data.reply) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.reply }
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Error: No response from AI"
          }
        ]);
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: err.message || "Chat failed"
        }
      ]);
    }

    setLoading(false);
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
          width: 55,
          height: 55,
          borderRadius: "50%",
          background: "#111",
          color: "white",
          fontSize: 20,
          zIndex: 9999,
          cursor: "pointer"
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 360,
            height: 520,
            background: "#0f0f0f",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 12,
              background: "#1a1a1a",
              color: "white",
              fontWeight: "bold"
            }}
          >
            AI Homework Chat Assistant
          </div>

          {/* Info */}
          <div
            style={{
              padding: 8,
              fontSize: 12,
              color: "#aaa",
              background: "#151515"
            }}
          >
            Ask questions about your solution or concepts
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto",
              color: "white"
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign:
                    m.role === "user" ? "right" : "left",
                  marginBottom: 10
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
                AI is typing...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: "flex", padding: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
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
