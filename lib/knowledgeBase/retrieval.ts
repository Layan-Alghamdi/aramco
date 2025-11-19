import { HelpEntry } from './productHelp';
import { productHelp } from './productHelp';
import { faqAramco } from './faqAramco';

export interface RetrievalResult {
  entries: HelpEntry[];
  context: string;
}

/**
 * Simple keyword-based retrieval to find relevant help entries
 * Returns the most relevant entries based on keyword matching
 */
export function retrieveRelevantKnowledge(userMessage: string, maxEntries: number = 6): RetrievalResult {
  const userText = userMessage.toLowerCase();
  const allEntries = [...productHelp, ...faqAramco];
  
  // Score each entry based on keyword matches
  const scoredEntries = allEntries.map(entry => {
    let score = 0;
    
    // Check if any keyword appears in the user message
    for (const keyword of entry.keywords) {
      if (userText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    // Bonus if the question title matches
    if (userText.includes(entry.question.toLowerCase())) {
      score += 2;
    }
    
    return { entry, score };
  });
  
  // Filter out entries with score 0 and sort by score (highest first)
  const relevantEntries = scoredEntries
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxEntries)
    .map(item => item.entry);
  
  // Build context string
  let context = "";
  if (relevantEntries.length > 0) {
    context = "Here is relevant information from the knowledge base:\n\n";
    relevantEntries.forEach((entry, index) => {
      context += `${index + 1}. ${entry.question}\n${entry.answer}\n\n`;
    });
  }
  
  return {
    entries: relevantEntries,
    context: context.trim()
  };
}

