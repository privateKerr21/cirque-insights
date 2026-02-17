import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateContent(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const tokens = response.usageMetadata?.totalTokenCount ?? 0;

  return { text, tokens, model: "gemini-2.0-flash" };
}
