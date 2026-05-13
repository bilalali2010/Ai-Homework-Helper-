import { NextResponse } from "next/server";

const MODELS = [
  "arcee-ai/trinity-large-thinking:free",
  "nousresearch/hermes-3-llama-3.1-405b:free"
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        success: false,
        error: "Messages are required"
      });
    }

    let lastError: any = null;

    for (const model of MODELS) {
      try {
        const res = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!}`,
              "HTTP-Referer": "https://ai-homework-helper.vercel.app",
              "X-Title": "AI Homework Helper Chat"
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a professional AI tutor. Help students understand solutions clearly and simply."
                },
                ...messages
              ],
              temperature: 0.3
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

    return NextResponse.json({
      success: false,
      error: lastError || "All models failed"
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    });
  }
}
