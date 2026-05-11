import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("TEXT:", body.text);

    const response = await fetch(
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
              content:
                "You are a helpful teacher. Solve clearly step-by-step."
            },
            {
              role: "user",
              content: body.text
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("OPENROUTER:", data);

    // 🚨 IMPORTANT ERROR CHECK
    if (!response.ok) {
      return NextResponse.json({
        error: data
      });
    }

    return NextResponse.json({
      solution: data.choices?.[0]?.message?.content || "No response"
    });
  } catch (err: any) {
    console.log("SERVER ERROR:", err);

    return NextResponse.json({
      error: err.message
    });
  }
}
