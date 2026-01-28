chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ANALYZE_WITH_GEMINI") {
    runTwoStepAnalysis(msg.payload).then(sendResponse)
    return true;
  }
});
const API_KEY = 'xxx';
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function structureProfile(rawProfile) {
  const prompt = `
    You are a data extraction specialist expert in extracting JSON data from HTML raw content.

    Convert the given LinkedIn raw profile HTML sections into JSON format.

    You have to follow the below schema:
    schema: {
      about: {
        summary,
        keyPoints (2-4 only) donot include for low quality profiles.
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

  return JSON.parse(cleanedJSON);
}

async function analyzeStructuredProfile(structuredProfile) {
  const prompt = `
    You are a LinkedIn profile optimization expert.

    Analyze the structured profile below and provide:
    1. Headline improvement suggestions
    2. About section rewrite advice
    3. Experience bullet improvements
    4. Overall positioning feedback

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

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No analysis generated."
  );
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

  // Remove ```json and ``` wrappers if present
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return cleaned;
}

// async function analyzeProfile(profile) {
//   const prompt = `You are a LinkedIn profile optimization expert.

// Profile:
// ${JSON.stringify(profile, null, 2)}

// Give actionable suggestions to improve this profile.`;

//   const res = await fetch(
//     `${GEMINI_URL}?key=AIzaSyA1H2fwgC3YtC9zBp3VSBa-pH-1CRpS_6s`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }]
//       })
//     }
//   );

//   const data = await res.json();
//   return {
//     result: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
//   };
// }
