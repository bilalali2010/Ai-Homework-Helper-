import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { context, messages } = await req.json();

    const res = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-thinking:free",
          messages: [
            {
              role: "system",
              content: `
You are a helpful tutor.

You already solved a homework question.

Original question:
${context}

Now answer follow-up questions clearly and simply.
`
            },
            ...messages
          ]
        })
      }
    );

    const data = await res.json();

    return NextResponse.json({
      reply: data?.choices?.[0]?.message?.content || "No response"
    });
  } catch (err: any) {
    return NextResponse.json({
      reply: "Error: " + err.message
    });
  }
}
