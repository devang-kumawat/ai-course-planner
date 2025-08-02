import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";


async function readDummyPlanFromFile() {
  const filePath = path.join(process.cwd(), "dummy_resp.json"); // root-level file
  const fileContents = await readFile(filePath, "utf-8");
  return JSON.parse(fileContents);
}

function tryParseJsonArray(raw: string) {
    try {
        return JSON.parse(raw);
    } catch {
        const start = raw.indexOf("[");
        const end   = raw.lastIndexOf("]");
        if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(raw.slice(start, end + 1));
        }
        throw new Error("Cannot recover JSON");
    }
}
async function fetchFromPerplexity(prompt: string) {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
        
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY ?? ""}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "sonar",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
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

    console.log("Perplexity raw response content:\n", content);

    try {
        // return JSON.parse(content);
        return tryParseJsonArray(content);
    } catch (err) {
        console.error("JSON parse failed for:\n", content);
        throw new Error("Failed to parse Perplexity API response");
    }

}

export async function POST(req: NextRequest){
    const {topic, proficiency, duration} = await req.json();

  //   const prompt = [
  //   `Create a week-by-week learning schedule to master the topic "${topic}" for a "${proficiency}" in exactly ${duration} weeks.`,
  //   `For each week, return this as a JSON array, each object having:`,
  //   `- w (number)`,
  //   `- t (string)`,
  //   `- g (string)`,
  //   `- a: up to 2 items { ti: [string], u: [string] }`,
  //   `- v: up to 2 items { ti: [string], u: [string] }`,
  //   `Make sure every week has both articles and videos with real links. JSON only, no explanation, and use double quotes everywhere.`,
  // ].join('\n');

  const prompt = `
You’re an expert curriculum designer.  
Input:  
  topic = "${topic}"  
  proficiency = "${proficiency}"  
  duration = ${duration}  

Task: produce a JSON array of length = duration.  
Each object must have exactly  
  "w": week number(int),  
  "t": topic string,  
  "g": goal string,  
  "a": 1–2 articles EACH must be { "ti": article title, "u": full geeksforgeeks.org url },  
  "v": 1–2 videos EACH must be { "ti": video title, "u": full youtube.com url }

Article rule: pick the top 1–2 most liked AND most viewed tutorials from GeeksforGeeks (geeksforgeeks.org) for that week’s subtopic.  
Video rule: pick the top 1–2 most viewed AND highest‑rated videos from YouTube (youtube.com), preferring official channels (e.g. GeeksforGeeks, freeCodeCamp).  

Requirements:  
• Use only real, unique URLs—no repeats across weeks or fields.  
• Validate that each URL is live (HTTP 200).  
• Double‑quote all keys and strings.  
• Return **only** the JSON array—no commentary or extra fields.  
`.trim();


try {
const weeklyPlan = await fetchFromPerplexity(prompt);
if (!Array.isArray(weeklyPlan)) {
    return NextResponse.json({ error: "Invalid response format from Perplexity API" }, { status: 500 });
}
return NextResponse.json({ plan: weeklyPlan });
} catch (error: any) {
  console.warn("Falling back to dummy_resp.json due to error:", error.message);

  try {
    const dummyPlan = await readDummyPlanFromFile();
    return NextResponse.json({ plan: dummyPlan });
  } catch (fileError: any) {
    return NextResponse.json(
      { error: "Failed to generate schedule and fallback also failed" },
      { status: 500 }
    );
  }

}}
