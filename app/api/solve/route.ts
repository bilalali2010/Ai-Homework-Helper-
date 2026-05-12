import { NextResponse } from "next/server";

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
        error: "No OCR text provided"
      });
    }

    console.log("OCR TEXT:", body.text);

    let lastError: any = null;

    // =========================
    // TRY MODELS ONE BY ONE
    // =========================
    for (const model of MODELS) {
      try {
        console.log("TRYING MODEL:", model);

        const response = await fetch(
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
You are an expert AI homework tutor.

The OCR text may contain:
- spelling mistakes
- blurry characters
- formatting issues
- screenshot artifacts
- handwritten errors

Your job:
1. Reconstruct the original question intelligently
2. Automatically fix OCR mistakes
3. Solve the problem step-by-step
4. Keep explanations simple for students
5. Never refuse unless text is completely unreadable
6. If math equations are unclear, make the best possible correction
7. Format answers cleanly
`
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

        console.log("MODEL RESPONSE:", model, data);

        // =========================
        // SUCCESS
        // =========================
        if (
          response.ok &&
          data?.choices?.[0]?.message?.content
        ) {
          return NextResponse.json({
            success: true,
            model,
            solution:
              data.choices[0].message.content
          });
        }

        lastError = data;
      } catch (err: any) {
        console.log("MODEL FAILED:", model, err);
        lastError = err.message;
      }
    }

    // =========================
    // ALL MODELS FAILED
    // =========================
    return NextResponse.json({
      success: false,
      error: lastError || "All AI models failed"
    });
  } catch (err: any) {
    console.log("SERVER ERROR:", err);

    return NextResponse.json({
      success: false,
      error:
        err?.message || "Internal server error"
    });
  }
}
