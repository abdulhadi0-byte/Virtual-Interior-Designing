// ---- Gemini vision analysis (called directly from the browser) ----
//
// Security note: since this is a static, backend-less site, the API key
// lives in the visitor's own browser (localStorage) and is sent directly
// to Google's API. It is never committed to this repo's source code.
// For extra safety, restrict the key in Google AI Studio to only the
// Generative Language API, and consider setting a daily quota cap.

const GEMINI_MODEL = "gemini-2.0-flash";

const PROMPT_TEMPLATE = (roomType) => `You are an interior design assistant analyzing a photo of a ${roomType}.

Look carefully at the actual photo and respond with ONLY valid JSON (no markdown, no explanation) in exactly this shape:

{
  "room_summary": "one sentence describing what you actually see in this specific room",
  "layouts": [
    {"name": "short layout name", "description": "one sentence, specific to what you see in THIS photo, not generic advice"},
    {"name": "short layout name", "description": "..."},
    {"name": "short layout name", "description": "..."}
  ],
  "palettes": [
    {"name": "palette name", "colors": ["#HEXVAL", "#HEXVAL", "#HEXVAL"]},
    {"name": "palette name", "colors": ["#HEXVAL", "#HEXVAL", "#HEXVAL"]},
    {"name": "palette name", "colors": ["#HEXVAL", "#HEXVAL", "#HEXVAL"]}
  ]
}

Base the first palette on colors that would actually complement what's already in the photo (existing furniture, flooring, lighting). Give exactly 3 layouts and exactly 3 palettes. Respond with ONLY the JSON object, nothing else.`;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function analyzeRoomWithGemini(file, roomType, apiKey) {
  const base64Data = await fileToBase64(file);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: file.type || "image/jpeg", data: base64Data } },
          { text: PROMPT_TEMPLATE(roomType) },
        ],
      },
    ],
    generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 200) || "request failed"}`);
  }

  const data = await res.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  text = text.trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```json?/, "").replace(/```$/, "").trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned a response that couldn't be parsed. Try again.");
  }

  if (!Array.isArray(parsed.layouts) || !Array.isArray(parsed.palettes)) {
    throw new Error("Gemini's response was missing expected fields. Try again.");
  }

  return {
    roomSummary: parsed.room_summary || "",
    layouts: parsed.layouts.slice(0, 3),
    palettes: parsed.palettes.slice(0, 3),
    imageDataUrl: `data:${file.type || "image/jpeg"};base64,${base64Data}`,
  };
}
