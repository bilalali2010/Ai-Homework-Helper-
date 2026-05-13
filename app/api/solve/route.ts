import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODELS = [
  "arcee-ai/trinity-large-thinking:free",
  "google/gemma-7b-it:free",
  "mistralai/mistral-7b-instruct:free"
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.text) {
      return NextResponse.json({
        success: false,
        error: "No text provided"
      });
    }

    let lastError: any = null;

    for (const model of MODELS) {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://your-domain.vercel.app",
              "X-Title": "AI Homework Helper"
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful teacher. Solve step-by-step clearly."
                },
                {
                  role: "user",
                  content: body.text
                }
              ],
              temperature: 0.2,
              max_tokens: 1200
            }),
            signal: AbortSignal.timeout(25000)
          }
        );

        const data = await response.json();

        if (response.ok && data?.choices?.[0]?.message?.content) {
          return NextResponse.json({
            success: true,
            model,
            solution: data.choices[0].message.content
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
