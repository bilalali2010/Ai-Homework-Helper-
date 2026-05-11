import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemma-7b-it:free",
        messages: [
          {
            role: "system",
            content:
              "You are a teacher. Solve step-by-step clearly and simply."
          },
          {
            role: "user",
            content: text
          }
        ]
      },
      {
        timeout: 15000,
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      }
    );

    return NextResponse.json({
      solution: response.data.choices[0].message.content
    });
  } catch (err) {
    return NextResponse.json({
      error: "AI failed"
    });
  }
}
