// Feedback questions by persona for stakeholder feedback collection
import type { FeedbackQuestion, Persona } from '../types/feedback.types';

export interface PersonaQuestions {
  priority: FeedbackQuestion[];
  additional: FeedbackQuestion[];
}

export interface FeedbackQuestionsConfig {
  leadership: PersonaQuestions;
  stakeholder: PersonaQuestions;
  build_team: PersonaQuestions;
  common: FeedbackQuestion[];
}

// Questions from spec - each persona has priority (first 2) and additional questions
export const FEEDBACK_QUESTIONS: FeedbackQuestionsConfig = {
  leadership: {
    priority: [
      { 
        id: 'l1', 
        text: 'Can you quickly understand portfolio status in the platform?', 
        type: 'scale' 
      },
      { 
        id: 'l2', 
        text: "What's missing for the platform to replace your current status process?", 
        type: 'text' 
      },
    ],
    additional: [
      { 
        id: 'l3', 
        text: 'Would you use the platform weekly without being reminded? Why/why not?', 
        type: 'text' 
      },
    ],
  },
  stakeholder: {
    priority: [
      { 
        id: 's1', 
        text: 'Does the platform show you progress on things you care about?', 
        type: 'scale' 
      },
      { 
        id: 's2', 
        text: 'What would make the platform more useful for your role?', 
        type: 'text' 
      },
    ],
    additional: [
      { 
        id: 's3', 
        text: 'Any friction or confusion when using the platform?', 
        type: 'text' 
      },
    ],
  },
  build_team: {
    priority: [
      { 
        id: 'b1', 
        text: 'Does the platform feel helpful or like surveillance? (Be honest)', 
        type: 'text' 
      },
      { 
        id: 'b2', 
        text: 'Would you use the platform voluntarily if not required? Why/why not?', 
        type: 'text' 
      },
    ],
    additional: [
      { 
        id: 'b3', 
        text: 'What burden does the platform add vs. remove?', 
        type: 'text' 
      },
    ],
  },
  // Common questions asked to all personas at the end
  common: [
    { 
      id: 'c1', 
      text: "What's one thing the platform should do that it doesn't?", 
      type: 'text' 
    },
    { 
      id: 'c2', 
      text: 'Anything else we should know?', 
      type: 'text' 
    },
  ],
};

// Persona display labels
export const PERSONA_LABELS: Record<Persona, string> = {
  leadership: 'Leadership',
  stakeholder: 'Stakeholder',
  build_team: 'Build Team',
};

// Persona descriptions for selection UI
export const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  leadership: 'I oversee portfolio progress and make strategic decisions',
  stakeholder: 'I care about specific initiatives and their outcomes',
  build_team: 'I work on initiatives and track my own progress',
};

// Helper to get all questions for a persona (priority + additional + common)
export function getQuestionsForPersona(persona: Persona): FeedbackQuestion[] {
  const personaQuestions = FEEDBACK_QUESTIONS[persona];
  return [
    ...personaQuestions.priority,
    ...personaQuestions.additional,
    ...FEEDBACK_QUESTIONS.common,
  ];
}

// Helper to get only priority questions for a persona
export function getPriorityQuestions(persona: Persona): FeedbackQuestion[] {
  return FEEDBACK_QUESTIONS[persona].priority;
}

// Helper to get additional questions (after continue check)
export function getAdditionalQuestions(persona: Persona): FeedbackQuestion[] {
  return [
    ...FEEDBACK_QUESTIONS[persona].additional,
    ...FEEDBACK_QUESTIONS.common,
  ];
}
