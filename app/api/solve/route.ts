import { NextResponse } from "next/server";

const MODELS = [
  "arcee-ai/trinity-large-thinking:free",
  "google/gemma-7b-it:free",
  "nousresearch/hermes-3-llama-3.1-405b:free"
];

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({
        success: false,
        error: "No text provided"
      });
    }

    for (const model of MODELS) {
      try {
        const res = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a strict but helpful homework solver. Solve step-by-step clearly."
                },
                {
                  role: "user",
                  content: text
                }
              ]
            })
          }
        );

        const data = await res.json();

        if (res.ok && data?.choices?.[0]?.message?.content) {
          return NextResponse.json({
            success: true,
            model,
            solution: data.choices[0].message.content
          });
        }
      } catch (e) {
        continue;
      }
    }

    return NextResponse.json({
      success: false,
      error: "All models failed"
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    });
  }
}
