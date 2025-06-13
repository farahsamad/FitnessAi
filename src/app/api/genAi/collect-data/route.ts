import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userData = {} } = body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: {
        temperature: 0.4, // lower temperature for more predictable outputs
        topP: 0.9,
        responseMimeType: "application/json",
      },
    });
    //   .getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Build the context string
    if (Object.keys(userData).length === 0 && message === "") {
      const contextPrompt = `
            You're a helpful fitness assistant collecting user data to create a personalized workout and diet plan.
            You must Start with a warm greeting and ask the user that you need to gather some information about him to create a personalized workout and diet plan.
        `;
      const result = await model.generateContent([contextPrompt]);

      const text = result.response.text();

      return Response.json({ text });
    }
    if (Object.keys(userData).length > 0 || message !== "") {
      const contextPrompt = `
            You're a helpful fitness assistant collecting user data to create a personalized workout and diet plan.
            You need to gather:
                - Age
                - Gender
                - Height
                - Weight
                - Injuries or limitations
                - Available workout days
                - Fitness goal
                - Fitness level
                - Dietary restrictions

            CRITICAL INSTRUCTION:
            -Height must be in cm
            -weight must be in kg
            -When ask fitness goal mention fitness goal For example, losing fat, building muscle, or improving endurance.

            Here is what you already know:
            ${Object.entries(userData)
              .map(([key, value]) => `- ${key}: ${value}`)
              .join("\n")}

            Ask ONLY one question at a time based on the missing fields above.
            Once all fields are collected, say: "Thanks! I now have all I need to generate your plan." and stop asking questions.

            User: ${message}
        `;
      const result = await model.generateContent([contextPrompt]);

      const text = result.response.text();

      return Response.json({ text });
    }
  } catch (error) {
    console.error("Gemini chat error:", error);
    return Response.json({ error: "Failed to fetch response from Gemini" }, { status: 500 });
  }
}
