// /api/helperfunction.ts

export function tryParseJsonArray(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error("Cannot recover JSON");
  }
}

export async function fetchFromPerplexity(prompt: string) {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Perplexity API error:", response.status, text);
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error("Unexpected Perplexity response shape:", JSON.stringify(data, null, 2));
    throw new Error("Missing expected data from Perplexity response");
  }

  const content = data.choices[0].message.content;

  return tryParseJsonArray(content);
}
