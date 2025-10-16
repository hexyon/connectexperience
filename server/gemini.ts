import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ImageAnalysisResult {
  narrative: string;
  connections: string[];
  tags: string[];
  theme: string;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeImageWithContext(
  base64Image: string,
  previousChapters: Array<{ narrative: string; tags: string[]; chapterNumber: number }> = [],
  retries: number = 3
): Promise<ImageAnalysisResult> {
  const contextPrompt = previousChapters.length > 0 
    ? `Previous story chapters for context:
${previousChapters.map((chapter, index) => 
  `Chapter ${chapter.chapterNumber}: ${chapter.narrative}
Tags: ${chapter.tags.join(', ')}`
).join('\n\n')}

Now, analyze the new image and continue the story, making creative connections to the previous chapters while maintaining the same narrative tone and style.`
    : "This is the first image in a new story. Analyze it and create an engaging narrative that will serve as the foundation for future chapters.";

  try {
    const systemPrompt = `You are a creative storyteller and image analyst. Your task is to analyze images and create compelling narratives that connect to previous images in a continuous story. 

For each image, provide:
1. A detailed, creative narrative (150-200 words) that describes the image and connects it to previous chapters
2. Specific connections to previous images/chapters (if any)
3. Relevant tags that capture key themes, objects, or emotions
4. An overall theme for this chapter

Maintain a consistent tone throughout the story and make creative, meaningful connections between images. The narrative should feel like chapters in a continuous story.

Respond with JSON in this exact format:
{
  "narrative": "detailed story narrative here",
  "connections": ["connection to previous chapter 1", "connection to previous chapter 2"],
  "tags": ["tag1", "tag2", "tag3"],
  "theme": "main theme of this chapter"
}`;

    const contents = [
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
      `${systemPrompt}\n\n${contextPrompt}`,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            narrative: { type: "string" },
            connections: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } },
            theme: { type: "string" },
          },
          required: ["narrative", "connections", "tags", "theme"],
        },
      },
      contents: contents,
    });

    const rawJson = response.text;
    if (rawJson) {
      const result: ImageAnalysisResult = JSON.parse(rawJson);
      return {
        narrative: result.narrative || "Unable to generate narrative",
        connections: result.connections || [],
        tags: result.tags || [],
        theme: result.theme || "Unknown"
      };
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    
    // Check if it's a 503 overload error and retry
    const errorMessage = error instanceof Error ? error.message : String(error);
    const is503Error = errorMessage.includes('503') || errorMessage.includes('overloaded');
    
    if (is503Error && retries > 0) {
      const waitTime = (4 - retries) * 2000; // 2s, 4s, 6s
      console.log(`Gemini overloaded, retrying in ${waitTime}ms... (${retries} retries left)`);
      await delay(waitTime);
      return analyzeImageWithContext(base64Image, previousChapters, retries - 1);
    }
    
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
