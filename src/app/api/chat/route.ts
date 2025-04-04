import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Ensure that you have the correct environment and configuration for OpenAI
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runtime = "edge";

// POST request handler
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate the input
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid input: "messages" must be an array.', {
        status: 400,
      });
    }

    const result = streamText({
      model: openai("gpt-3.5-turbo"),
      system: "You are a helpful assistant.",
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error with OpenAI request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
