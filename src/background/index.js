chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ANALYZE_WITH_GEMINI") {
    runTwoStepAnalysis(msg.payload).then(sendResponse);
    return true;
  }
});

const API_KEY = 'xxxx';
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function structureProfile(rawProfile) {
  const prompt = `
    You are a data extraction specialist expert in extracting JSON data from HTML raw content.

    Convert the given LinkedIn raw profile HTML sections into JSON format.

    You have to follow the below schema:
    schema: {
      headline: {
        name: full name of the person,
        title: current headline or professional title,
        location: city or region if available
      },
      about: {
        summary,
        keyPoints (2-4 only) do not include for low quality profiles.
      },
      experience: [
        {
          role: the role of profile in the company,
          company: company name,
          duration: duration of job in weeks,
          bullets: 3-4 points explaining user's work if given in raw content
        }
      ]
    }

    IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no extra text.

    RAW Profile DATA:
    ${JSON.stringify(rawProfile, null, 2)}
  `;

  const res = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleanedJSON = extractJSON(rawText);

  try {
    return JSON.parse(cleanedJSON);
  } catch (e) {
    console.error("Failed to parse structured profile:", e);
    return { about: { summary: "Could not parse profile data." }, experience: [] };
  }
}

async function analyzeStructuredProfile(structuredProfile) {
  const prompt = `
    You are a LinkedIn profile optimization expert and scoring system.

    Analyze the structured profile below and return a JSON response.

    IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no extra text.

    JSON Schema to follow exactly:
    {
      "overallScore": <number 0-100>,
      "categories": {
        "headline": {
          "score": <number 0-100>,
          "tips": ["<actionable tip 1>", "<actionable tip 2>"]
        },
        "about": {
          "score": <number 0-100>,
          "tips": ["<actionable tip 1>", "<actionable tip 2>"]
        },
        "experience": {
          "score": <number 0-100>,
          "tips": ["<actionable tip 1>", "<actionable tip 2>"]
        },
        "skills": {
          "score": <number 0-100>,
          "tips": ["<actionable tip 1>", "<actionable tip 2>"]
        }
      },
      "headlineSuggestions": ["<2-3 suggested headline rewrites>"],
      "aboutRewrite": "<a concise, improved rewrite of the about section>",
      "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
      "topImprovements": ["<priority improvement 1>", "<priority improvement 2>", "<priority improvement 3>"]
    }

    Scoring Guide:
    - 90-100: Outstanding profile, competitive for top roles
    - 70-89: Good profile with some areas to improve
    - 50-69: Average, needs meaningful improvements
    - Below 50: Significant work needed

    Be specific and actionable in all tips and suggestions.

    STRUCTURED PROFILE:
    ${JSON.stringify(structuredProfile, null, 2)}
  `;

  const res = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleanedJSON = extractJSON(rawText);

  try {
    return JSON.parse(cleanedJSON);
  } catch (e) {
    console.error("Failed to parse analysis JSON:", e);
    return {
      overallScore: 50,
      categories: {
        headline: { score: 50, tips: [] },
        about: { score: 50, tips: [] },
        experience: { score: 50, tips: [] },
        skills: { score: 50, tips: [] }
      },
      headlineSuggestions: [],
      topStrengths: ["Profile contains some content"],
      topImprovements: ["Could not fully analyze - please try again"]
    };
  }
}

async function runTwoStepAnalysis(rawProfile) {
  const structured = await structureProfile(rawProfile);
  const analysis = await analyzeStructuredProfile(structured);

  return {
    structuredProfile: structured,
    analysis
  };
}

function extractJSON(text) {
  if (!text) return "{}";

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return cleaned;
}
