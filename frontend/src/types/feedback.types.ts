// Feedback collection types for stakeholder feedback MVP

export type FeedbackState = 
  | 'idle'
  | 'identity'
  | 'persona'
  | 'priority_questions'
  | 'continue_check'
  | 'additional_questions'
  | 'complete';

export type Persona = 'leadership' | 'stakeholder' | 'build_team';

export type QuestionType = 'scale' | 'text';

export interface FeedbackQuestion {
  id: string;
  text: string;
  type: QuestionType;
}

export interface FeedbackResponse {
  questionId: string;
  questionText: string;
  answer: string | number;
}

export interface FeedbackSubmission {
  id: string;
  submittedAt: string;
  respondent: {
    name: string;
    email: string;
    persona: Persona;
  };
  responses: FeedbackResponse[];
}

export interface FeedbackIdentity {
  name: string;
  email: string;
}
