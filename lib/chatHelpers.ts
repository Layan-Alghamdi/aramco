// System prompt for the AI assistant
export const SYSTEM_PROMPT = `You are an in-app assistant for an internal slide editor web tool used at Aramco Digital.

Your main jobs:
1. Help users understand and use this web app (projects, templates, saving, shortcuts, etc.).
2. Answer basic FAQ about Aramco and Aramco Digital only using the provided context.

Important guidelines:
- If a question about Aramco or Aramco Digital cannot be answered from the provided FAQ/context, say you are not sure and recommend contacting official Aramco / Aramco Digital channels.
- Do not claim that you are an official representative of Aramco or Aramco Digital.
- Never reveal or assume internal or confidential information.
- If the user asks for something outside the scope of the app and the FAQ, politely decline or say you don't know.
- When appropriate, you may suggest specific actions in the app (e.g., "click Template Library", "open the Projects page", "use Cmd/Ctrl + S to save").
- Keep your responses concise, helpful, and friendly.
- Focus on being practical and actionable.`;

// Legacy FAQ content (kept for backward compatibility, but retrieval will use knowledge base files)
export const FAQ_CONTENT = {
  templates: {
    question: ["template", "templates", "slide template", "add slide"],
    answer: "You can add slides from templates in the editor! Click the 'New' button in the Slides panel on the left, or use templates from the template library. Templates help you create professional slides quickly with pre-designed layouts for titles, content, data visualization, and more."
  },
  save: {
    question: ["save", "saving", "save project", "how to save"],
    answer: "Click the blue 'Save' button in the top-right corner of the editor to save your work as a draft. Your project will be saved locally in the editor. When you're ready to publish it to your Projects list, click the 'Projects' button to leave the editor - your saved draft will be published automatically."
  },
  shortcuts: {
    question: ["shortcut", "shortcuts", "keyboard", "hotkey"],
    answer: "Here are some useful keyboard shortcuts: Cmd/Ctrl + S to save, Cmd/Ctrl + N for a new project, and Cmd/Ctrl + C to create a new project from the dashboard. In the editor, you can use standard editing shortcuts for text formatting."
  },
  dashboard: {
    question: ["dashboard", "home", "main page"],
    answer: "The Dashboard is your main workspace where you can see all your projects, create new ones, and access the template library. Use the quick action cards or keyboard shortcuts to get started quickly."
  },
  editor: {
    question: ["editor", "edit", "editing", "canvas"],
    answer: "The editor is where you create and edit your slides. You can add text, shapes, images, and more using the toolbar. The left panel shows all your slides, and the right panel has formatting options for selected elements. Toggle panels on/off using the edge buttons for more workspace."
  },
  aramco: {
    question: ["aramco", "aramco digital", "company", "about"],
    answer: "Aramco Digital is your company's digital transformation partner. This slide editor is designed to help you create professional presentations aligned with Aramco Digital's brand guidelines and best practices."
  },
  general: {
    question: [],
    answer: "I'm your in-app assistant. I can help you with using this slide editor and answer basic questions about templates, saving, shortcuts, and more. What would you like to know?"
  }
};

// Legacy function (kept for fallback, but OpenAI integration will use retrieval)
export function generateAssistantReply(messages: Array<{ role: string; content: string }>): string {
  if (messages.length === 0) {
    return FAQ_CONTENT.general.answer;
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    return FAQ_CONTENT.general.answer;
  }

  const userText = lastMessage.content.toLowerCase();

  for (const [key, faq] of Object.entries(FAQ_CONTENT)) {
    if (key === "general") continue;
    
    const matches = faq.question.some((keyword) => userText.includes(keyword));
    if (matches) {
      return faq.answer;
    }
  }

  return FAQ_CONTENT.general.answer;
}
