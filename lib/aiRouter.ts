import axios from "axios";

const models = [
  "google/gemma-7b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "openchat/openchat-7b:free"
];

async function call(model: string, text: string) {
  return axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a teacher. Fix OCR errors and solve step-by-step clearly."
        },
        {
          role: "user",
          content: text
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    }
  );
}

export async function solveWithAI(text: string) {
  let error;

  for (const model of models) {
    try {
      const res = await call(model, text);
      return res.data.choices[0].message.content;
    } catch (e) {
      error = e;
    }
  }

  throw error;
}
