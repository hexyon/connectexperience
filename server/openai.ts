import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ImageAnalysisResult {
  narrative: string;
  connections: string[];
  tags: string[];
  theme: string;
}

export async function analyzeImageWithContext(
  base64Image: string,
  previousChapters: Array<{ narrative: string; tags: string[]; chapterNumber: number }> = []
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a creative storyteller and image analyst. Your task is to analyze images and create compelling narratives that connect to previous images in a continuous story. 

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
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: contextPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      narrative: result.narrative || "Unable to generate narrative",
      connections: result.connections || [],
      tags: result.tags || [],
      theme: result.theme || "Unknown"
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateStoryTitle(chapters: Array<{ narrative: string; tags: string[] }>): Promise<string> {
  if (chapters.length === 0) return "Untitled Story";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative writer. Generate a compelling, concise title for a story based on the provided chapters. The title should capture the essence and themes of the narrative. Respond with JSON in this format: { \"title\": \"story title here\" }"
        },
        {
          role: "user",
          content: `Generate a title for this story based on these chapters:

${chapters.map((chapter, index) => 
  `Chapter ${index + 1}: ${chapter.narrative.substring(0, 200)}...
Tags: ${chapter.tags.join(', ')}`
).join('\n\n')}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 100
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.title || "Untitled Story";
  } catch (error) {
    console.error("Error generating story title:", error);
    return "Untitled Story";
  }
}
