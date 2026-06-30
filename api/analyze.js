import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("OpenAI did not return valid JSON.");
    return JSON.parse(match[0]);
  }
}

function normalizeAnalysis(data) {
  return {
    matchScore: Number(data.matchScore) || 0,
    summaryOfFit: data.summaryOfFit || "No summary available.",
    atsAnalysis: {
      atsScore: Number(data.atsAnalysis?.atsScore) || 0,
      formattingFeedback: data.atsAnalysis?.formattingFeedback || "",
      keywordMatchStatus: data.atsAnalysis?.keywordMatchStatus || "",
      passProbability: data.atsAnalysis?.passProbability || "Medium",
    },
    skillsBreakdown: {
      requiredAndMatched: Array.isArray(data.skillsBreakdown?.requiredAndMatched)
        ? data.skillsBreakdown.requiredAndMatched
        : [],
      requiredButMissing: Array.isArray(data.skillsBreakdown?.requiredButMissing)
        ? data.skillsBreakdown.requiredButMissing
        : [],
      candidateExtraSkills: Array.isArray(data.skillsBreakdown?.candidateExtraSkills)
        ? data.skillsBreakdown.candidateExtraSkills
        : [],
    },
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    flowchart: Array.isArray(data.flowchart) ? data.flowchart : [],
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing." });
    }

    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: "Missing resume or job description text.",
      });
    }

    const systemPrompt = `
You are ResumeLens AI, an ATS resume analysis assistant.

Return ONLY valid JSON.
Do not use markdown.
Do not include explanations outside JSON.

Required JSON structure:
{
  "matchScore": number,
  "summaryOfFit": "string",
  "atsAnalysis": {
    "atsScore": number,
    "formattingFeedback": "string",
    "keywordMatchStatus": "string",
    "passProbability": "High" | "Medium" | "Low"
  },
  "skillsBreakdown": {
    "requiredAndMatched": ["string"],
    "requiredButMissing": ["string"],
    "candidateExtraSkills": ["string"]
  },
  "suggestions": [
    {
      "section": "string",
      "recommendation": "string"
    }
  ],
  "flowchart": [
    {
      "step": "ATS Match Rate",
      "status": "Pass" | "Warning" | "Fail",
      "note": "string"
    },
    {
      "step": "Technical Assessment",
      "status": "Pass" | "Warning" | "Fail",
      "note": "string"
    },
    {
      "step": "Recruiter Pitch",
      "status": "Pass" | "Warning" | "Fail",
      "note": "string"
    }
  ]
}
`;

    const userPrompt = `
CANDIDATE RESUME:
${resumeText.slice(0, 6000)}

TARGET JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Analyze the resume against the job description.
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    });

    const parsed = safeJsonParse(response.output_text);
    const normalized = normalizeAnalysis(parsed);

    return res.status(200).json(normalized);
  } catch (error) {
    console.error("OpenAI Analysis Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "OpenAI analysis failed.",
    });
  }
}