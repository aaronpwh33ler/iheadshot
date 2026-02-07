import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { imageUrlToBase64 } from "@/lib/nano-banana";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || "" });

/**
 * Detect gender from an uploaded photo using Gemini
 * Used to show appropriate style thumbnails and adjust outfit prompts
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const { base64, mimeType } = await imageUrlToBase64(imageUrl);

    // Ask Gemini to classify gender
    const model = genAI.models;
    const response = await model.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text: "Look at this photo of a person. Is this person male or female? Reply with exactly one word: male or female",
            },
          ],
        },
      ],
    });

    const textPart = response.candidates?.[0]?.content?.parts?.[0];
    const rawAnswer = (textPart && "text" in textPart && textPart.text ? textPart.text : "")
      .toLowerCase()
      .trim();

    // Parse the response
    let gender: "male" | "female" = "male"; // default fallback
    if (rawAnswer.includes("female") || rawAnswer.includes("woman")) {
      gender = "female";
    } else if (rawAnswer.includes("male") || rawAnswer.includes("man")) {
      gender = "male";
    }

    console.log(`Gender detection: raw="${rawAnswer}" → ${gender}`);

    return NextResponse.json({
      success: true,
      gender,
    });
  } catch (error) {
    console.error("Gender detection error:", error);
    // Default to male on failure
    return NextResponse.json({
      success: false,
      gender: "male" as const,
    });
  }
}
