import { NextResponse } from "next/server";

const MODELS = [
  "arcee-ai/trinity-large-thinking:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    for (const model of MODELS) {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
              model,

              messages: [
                {
                  role: "system",
                  content: `
You are a concise AI homework tutor.

Rules:
- Keep answers short and clear.
- Use simple explanations.
- Avoid very long paragraphs.
- Maximum 6-8 lines unless user asks for details.
- Give step-by-step answers only when needed.
- Be direct and easy to understand.
                  `,
                },

                ...body.messages,
              ],

              temperature: 0.7,
              max_tokens: 300,
            }),
          }
        );

        const data = await response.json();

        if (
          response.ok &&
          data?.choices?.[0]?.message?.content
        ) {
          return NextResponse.json({
            reply:
              data.choices[0].message.content,
          });
        }
      } catch (err) {
        console.log(err);
      }
    }

    return NextResponse.json({
      error: "All models failed",
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
    });
  }
}
