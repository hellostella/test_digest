import OpenAI from "openai";
import { env } from "@/lib/env";

let client: OpenAI | null = null;

function getClient() {
  if (!env.OPENAI_API_KEY) return null;
  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

export async function generateSummary(text: string, subreddit?: string) {
  const ai = getClient();
  if (!ai) return null;
  const prompt = `Summarize the following Reddit ${subreddit ? `item from r/${subreddit}` : "item"} in 2-3 sentences with an informative but friendly tone.\n\n${text}`;
  const response = await ai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You summarize Reddit content for a daily digest." },
      { role: "user", content: prompt }
    ],
    max_tokens: 220,
    temperature: 0.7
  });
  return response.choices[0]?.message?.content?.trim() ?? null;
}
