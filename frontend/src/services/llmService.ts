// LLM Service for AI CoE Gateway integration
// Used for question polishing and response summarization in feedback collection
// Calls backend proxy to avoid CORS issues
import type { FeedbackSubmission, Persona } from '../types/feedback.types';
import { PERSONA_LABELS } from '../data/feedbackQuestions';
import axios, { AxiosError } from 'axios';
import { axiosInstance } from '../api/axiosInstance';

// LLM calls go through backend proxy to avoid CORS
const LLM_ENDPOINT = '/llm/chat';
const MAX_RETRIES = parseInt(import.meta.env.VITE_LLM_MAX_RETRIES || '3', 10);
const RETRY_BASE_DELAY = parseInt(import.meta.env.VITE_LLM_RETRY_BASE_DELAY || '2000', 10);

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Sleep helper for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Call the backend LLM proxy with retry logic
async function callLLM(messages: LLMMessage[]): Promise<string> {
  let lastError = '';
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await axiosInstance.post(LLM_ENDPOINT, { messages });
      const data: LLMResponse = response.data;
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 429) {
          lastError = 'Rate limited (429)';
          console.warn(`LLM rate limited, attempt ${attempt + 1}/${MAX_RETRIES}`);
        } else {
          lastError = `LLM API error: ${status ?? 'unknown'}`;
          console.error('LLM API error:', status, error.response?.data);
          return '';
        }
      } else {
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }
      console.warn(`LLM request error: ${lastError}, attempt ${attempt + 1}/${MAX_RETRIES}`);
    }
    
    // Exponential backoff with jitter before retry
    if (attempt < MAX_RETRIES - 1) {
      const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
      const jitter = delay * 0.25 * (2 * Math.random() - 1);
      const finalDelay = Math.max(500, delay + jitter);
      console.log(`Waiting ${Math.round(finalDelay)}ms before retry...`);
      await sleep(finalDelay);
    }
  }
  
  // All retries exhausted
  console.error(`LLM call failed after ${MAX_RETRIES} attempts: ${lastError}`);
  return '';
}

// Polish a scripted question to feel more conversational
export async function polishQuestion(
  question: string, 
  persona: Persona, 
  context?: string
): Promise<string> {
  const systemPrompt = `You are presenting feedback questions conversationally. Take this question and make it feel natural and friendly, like you're having a conversation. Keep it brief. Do not add pleasantries or padding - just rephrase the question naturally.`;

  const userPrompt = `Question: ${question}
User's persona: ${PERSONA_LABELS[persona]}
${context ? `Previous context: ${context}` : ''}

Rephrase this question naturally:`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const polished = await callLLM(messages);
  // Return original question if LLM fails
  return polished || question;
}

// Summarize feedback responses for product team review
export async function summarizeFeedback(submission: FeedbackSubmission): Promise<string> {
  const personaLabel = PERSONA_LABELS[submission.respondent.persona];
  
  const responsesText = submission.responses
    .map(r => `Q: ${r.questionText}\nA: ${r.answer}`)
    .join('\n\n');

  const systemPrompt = `You are summarizing stakeholder feedback for a product team. Be concise but capture key insights. Format as a brief summary paragraph followed by bullet points of key takeaways.`;

  const userPrompt = `Summarize this stakeholder feedback for product team review.

Respondent: ${submission.respondent.name} (${personaLabel})
Email: ${submission.respondent.email}

Responses:
${responsesText}

Provide a concise summary:`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const summary = await callLLM(messages);
  
  // Fallback summary if LLM fails
  if (!summary) {
    return `Feedback from ${submission.respondent.name} (${personaLabel}): ${submission.responses.length} responses collected.`;
  }
  
  return summary;
}

// Generate a friendly greeting to start feedback collection
export async function generateFeedbackGreeting(userName?: string): Promise<string> {
  const systemPrompt = `You are a friendly AI Assistant asking for product feedback. Generate a brief, warm greeting to start a feedback conversation. One sentence only.`;

  const userPrompt = userName 
    ? `Generate a greeting for ${userName} to start collecting feedback about the platform.`
    : `Generate a greeting to start collecting feedback about the platform.`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const greeting = await callLLM(messages);
  
  // Fallback greeting
  return greeting || "Thanks for taking a moment to share your feedback. Let's get started!";
}

// System prompt for guided (LLM-driven) feedback collection
const FEEDBACK_SYSTEM_PROMPT = `You are collecting stakeholder feedback about the platform. Be conversational and friendly.

ASK THESE QUESTIONS ONE AT A TIME, IN ORDER:

1. First, ask for their name
2. Then ask for their email
3. Ask which role best describes them: Leadership, Stakeholder, or Build Team
   - Briefly explain each if needed

4. Based on their role, ask these questions ONE AT A TIME:

   FOR LEADERSHIP:
   - "On a scale of 1-5, how clear is the portfolio status when you look at the platform?"
   - "What's missing that would help the platform replace your current status process?"
   - "Would you use the platform weekly to check on portfolio health?"

   FOR STAKEHOLDER:
   - "On a scale of 1-5, does the platform show progress on the things you care about?"
   - "What would make the platform more useful for you?"
   - "Is there anything confusing or friction you've encountered?"

   FOR BUILD TEAM:
   - "Does the platform feel helpful to you, or more like surveillance?"
   - "Would you use the platform voluntarily, or only because you have to?"
   - "What burden does the platform add vs remove from your work?"

5. Ask: "What's one thing the platform should do that it doesn't?"
6. Ask: "Anything else we should know?"
   - If they say no/nothing/nope, wrap up immediately

RULES:
- Ask ONE question at a time, wait for response
- Be conversational but don't ramble
- Accept answers as given - don't push for more detail
- When the user says they have nothing else, finish up

When ALL questions are answered, output EXACTLY this format:

FEEDBACK_COMPLETE
{"name":"...","email":"...","persona":"leadership|stakeholder|build_team","responses":[{"questionId":"q1","questionText":"...","answer":"..."},{"questionId":"q2","questionText":"...","answer":"..."}]}

Include ALL responses collected. Use question IDs like q1, q2, q3, etc.`;

// Call LLM for guided feedback conversation
export async function callFeedbackLLM(
  history: { role: string; content: string }[]
): Promise<string> {
  const messages: LLMMessage[] = [
    { role: 'system', content: FEEDBACK_SYSTEM_PROMPT },
    ...history.map(m => ({ 
      role: m.role as 'user' | 'assistant', 
      content: m.content 
    }))
  ];
  
  const response = await callLLM(messages);
  return response || "I'm sorry, I'm having trouble right now. Could you try again?";
}

// Evaluate if an answer needs follow-up and generate follow-up question if needed
export async function evaluateAnswerAndFollowUp(
  question: string,
  answer: string,
  persona: Persona
): Promise<{ needsFollowUp: boolean; followUpQuestion?: string }> {
  const systemPrompt = `You evaluate feedback answers and decide if they need elaboration.

EVALUATE the answer:
- If it's just "no", "yes", "maybe", or similarly brief without explanation, it likely needs a follow-up
- If they say "no" to a "would you use this" type question, we NEED to know why
- If they give a vague answer like "it's fine" or "not really", ask them to elaborate
- If they give a thoughtful answer with reasoning, no follow-up needed
- Scale ratings (1-5) are fine as-is, no follow-up needed

OUTPUT FORMAT:
If follow-up needed: FOLLOW_UP: [your brief, friendly follow-up question]
If no follow-up needed: OK

Keep follow-up questions short and conversational.`;

  const userPrompt = `Question asked: "${question}"
User's answer: "${answer}"
User's role: ${PERSONA_LABELS[persona]}

Evaluate if this answer needs elaboration:`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await callLLM(messages);
  
  if (!response) {
    return { needsFollowUp: false };
  }

  if (response.startsWith('FOLLOW_UP:')) {
    const followUpQuestion = response.replace('FOLLOW_UP:', '').trim();
    return { needsFollowUp: true, followUpQuestion };
  }

  return { needsFollowUp: false };
}
