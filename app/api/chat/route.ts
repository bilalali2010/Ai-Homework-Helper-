import { NextResponse } from "next/server";

const MODELS = [
  "arcee-ai/trinity-large-thinking:free",
  "nousresearch/hermes-3-llama-3.1-405b:free"
];

export async function POST(req: Request) {
  try {
    const { context, messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        reply: "Invalid chat messages"
      });
    }

    let lastError: any = null;

    // =========================
    // TRY MODELS ONE BY ONE
    // =========================
    for (const model of MODELS) {
      try {
        const res = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://ai-homework-helper.vercel.app",
              "X-Title": "AI Homework Helper"
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: `
You are an expert AI tutor.

You are helping a student understand a homework solution.

Original problem context:
${context}

Rules:
- Explain clearly and simply
- Break steps if needed
- Be friendly and educational
- If user is confused, re-explain in simpler way
`
                },
                ...messages
              ],
              temperature: 0.3,
              max_tokens: 1200
            })
          }
        );

        const data = await res.json();

        if (res.ok && data?.choices?.[0]?.message?.content) {
          return NextResponse.json({
            success: true,
            model,
            reply: data.choices[0].message.content
          });
        }

        lastError = data;
      } catch (err: any) {
        lastError = err.message;
      }
    }

    // =========================
    // ALL MODELS FAILED
    // =========================
    return NextResponse.json({
      success: false,
      reply:
        typeof lastError === "string"
          ? lastError
          : "All chat models failed"
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      reply: err.message || "Server error"
    });
  }
}
