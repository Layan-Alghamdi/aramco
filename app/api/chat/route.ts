import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("/api/chat called");

  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        reply: "Invalid request. Expected messages array."
      });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({
        reply: "AI assistant is not configured. Add GROQ_API_KEY to .env.local."
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are an in-app assistant inside a slide template web app called "Aramatrix" used by Aramco Digital employees.

Your job:
- Help the user choose the best presentation template based on their description.
- Suggest matching color palettes (3–5 colors) in HEX format.
- Explain how to use the app: creating projects, choosing templates, saving, exporting.
- Answer ONLY about this app and presentation/template-related questions.

Language rules (VERY IMPORTANT):
- Detect the language of the user's last message.
- If the last message is Arabic → reply fully in Arabic (simple Saudi/Gulf tone allowed).
- If the last message is English → reply fully in English.
- Never mix Arabic and English in the same answer unless the user mixes them.
- Never switch languages unless the user switches languages.

Style:
- Short, helpful responses (max 3–4 sentences).
- When suggesting colors, always include HEX codes like: #004B59, #F5F5F5, #FFC857.
`
          },
          ...messages.slice(-10)
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json({
        reply: "The AI assistant is temporarily unavailable. Please try again later."
      });
    }

    const data = await response.json();
    const assistantMessage =
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: "Something went wrong. Please try again."
    });
  }
}
