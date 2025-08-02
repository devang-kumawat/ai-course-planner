import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { fetchFromPerplexity } from "../helperFunctions"; // Import shared helper

/**
 * Reads the dummy schedule plan from a root-level JSON file.
 * Used as a fallback when Perplexity API call fails.
 */
async function readDummyPlanFromFile() {
  const filePath = path.join(process.cwd(), "dummy_resp.json"); // file at project root
  const fileContents = await readFile(filePath, "utf-8");
  return JSON.parse(fileContents);
}
/**
 * POST handler to generate weekly schedule plan.
 * Accepts topic, proficiency level, and duration (weeks).
 * Returns a normalized JSON array of learning weeks with articles/videos.
 * Falls back to dummy JSON file on failure.
 */
export async function POST(req: NextRequest) {
  const { topic, proficiency, duration } = await req.json();

  // Compose the detailed prompt for Perplexity
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
Video rule: pick the top 1–2 most viewed AND highest‑rated videos from YouTube (youtube.com), preferring official and most viewed channels.  

Requirements:  
• Use only real, unique URLs—no repeats across weeks or fields.  
• Validate that each URL is live (HTTP 200).  
• Double‑quote all keys and strings.  
• Return **only** the JSON array—no commentary or extra fields.  
  `.trim();

  try {
    const weeklyPlan = await fetchFromPerplexity(prompt);

    // Defensive validation: ensure array is returned
    if (!Array.isArray(weeklyPlan)) {
      return NextResponse.json({ error: "Invalid response format from Perplexity API" }, { status: 500 });
    }
    // console.log(JSON.stringify(weeklyPlan, null, 2));
    // Success: return the plan
    return NextResponse.json({ plan: weeklyPlan });
  } catch (error: unknown) {
    console.warn("Falling back to dummy json file due to Perplexity API error:", error);

    try {
      const dummyPlan = await readDummyPlanFromFile();
      return NextResponse.json({ plan: dummyPlan, usingDummy: true });
    } catch (fileError: unknown) {
      console.error("Failed to load dummy schedule fallback:", fileError);
      return NextResponse.json(
        { error: "Failed to generate schedule and fallback also failed" },
        { status: 500 }
      );
    }
  }
}
