import axios from "axios";

const models = [
 "nousresearch/hermes-3-llama-3.1-405b:free",
"tencent/hunyuan-a13b-instruct:free",
"google/gemma-3-27b-it:free"
];

async function callAI(model: string, prompt: string) {
  return axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert tutor. Fix OCR errors, reconstruct questions, and solve step-by-step clearly."
        },
        { role: "user", content: prompt }
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
      const res = await callAI(model, text);
      return res.data.choices[0].message.content;
    } catch (e) {
      error = e;
    }
  }

  throw error;
}
