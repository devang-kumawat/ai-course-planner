import { NextRequest, NextResponse } from "next/server";
import { fetchFromPerplexity } from "../helperFunctions"; // Import Perplexity utilities

/**
 * Calls Perplexity API with a prompt to generate 2 True/False quiz questions
 * related to the given topic and goal.
 * 
 * @param topic The main topic string
 * @param goal The detailed weekly learning goal
 * @returns Promise resolving to an array of quiz question objects
 */
async function fetchQuizFromPerplexity(topic: string, goal: string) {
  const prompt = `
You are a programming instructor.

Generate 2 unique True/False quiz questions focusing on this topic and learning goal:

- Topic: "${topic}"
- Goal: "${goal}"

Each should be a clear, factual statement directly relevant to this week's learning goal.

Return a JSON array of 2 objects, each:
- "id": unique int (1 or 2)
- "question": the question string (short and clear)
- "choices": ["True", "False"]
- "answer": 0 or 1 (index of correct choice; 0 if 'True' is correct, 1 if 'False' is correct)

ONLY return the JSON array, no explanation or commentary.
`.trim();

  // Use the shared fetchFromPerplexity helper
  const result = await fetchFromPerplexity(prompt);
  return result;
}

export async function POST(req: NextRequest) {
  const { topic, goal } = await req.json();

  try {
    const questions = await fetchQuizFromPerplexity(topic, goal);

    // Validate the response structure is as expected
    if (
      !Array.isArray(questions) ||
      !questions.every(
        q =>
          typeof q.id === "number" &&
          typeof q.question === "string" &&
          Array.isArray(q.choices) &&
          q.choices.length === 2 &&
          q.choices[0] === "True" &&
          q.choices[1] === "False" &&
          (q.answer === 0 || q.answer === 1)
      )
    ) {
      console.error("Unexpected quiz format from Perplexity.", questions);
      return NextResponse.json(
        { error: "Unexpected quiz format from Perplexity." },
        { status: 500 }
      );
    }

    // Return valid quiz questions to the client
    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Quiz generation failed, falling back to defaults:", error);

    // Provide fallback questions if Perplexity API fails
    return NextResponse.json({
      questions: [
        {
          id: 1,
          question: `Is this weekly goal for "${topic}" achieved by studying only once?`,
          choices: ["True", "False"],
          answer: 1,
        },
        {
          id: 2,
          question: `Is the goal "${goal}" unrelated to "${topic}"?`,
          choices: ["True", "False"],
          answer: 1,
        },
      ],
    });
  }
}
