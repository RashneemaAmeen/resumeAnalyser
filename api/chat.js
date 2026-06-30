import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing." });
    }

    const { resumeText, jobDescription, analysis, chatHistory, userMsg } = req.body;

    if (!userMsg) {
      return res.status(400).json({ error: "Missing user message." });
    }

    const context = `
You are ResumeLens AI Co-Pilot, a professional resume and career assistant.

Use this context:

RESUME:
${resumeText?.slice(0, 4000) || ""}

JOB DESCRIPTION:
${jobDescription?.slice(0, 2000) || ""}

ANALYSIS:
${JSON.stringify(analysis || {}).slice(0, 2000)}
`;

    const conversation = (chatHistory || [])
      .slice(-8)
      .map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.text,
      }));

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: context },
        ...conversation,
        { role: "user", content: userMsg },
      ],
      temperature: 0.7,
    });

    return res.status(200).json({
      reply: response.output_text || "I could not generate a response.",
    });
  } catch (error) {
    console.error("OpenAI Chat Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "OpenAI chat failed.",
    });
  }
}