// Small floating feedback chat widget - bottom right corner
import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Paper,
  Collapse,
  Chip,
  Button,
  Stack,
  useTheme,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { Close, MoreVert, Send } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import {
  getPriorityQuestions,
  getAdditionalQuestions,
} from '../../data/feedbackQuestions';
import type { 
  Persona, 
  FeedbackResponse, 
  FeedbackQuestion,
} from '../../types/feedback.types';
import { polishQuestion, evaluateAnswerAndFollowUp } from '../../services/llmService';
import { axiosInstance } from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/endpoints';

interface FeedbackWidgetProps {
  open: boolean;
  onClose: () => void;
  style: 'quick' | 'guided';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isAI?: boolean;
}

// Extended states for split name/email
type WidgetState = 'idle' | 'name' | 'email' | 'persona' | 'questions' | 'follow_up' | 'continue_check' | 'additional_questions' | 'complete';

interface PersistedFeedbackState {
  version: 1;
  updatedAt: number;
  style: 'quick' | 'guided';
  messages: ChatMessage[];
  input: string;
  feedbackState: WidgetState;
  userName: string;
  userEmail: string;
  feedbackPersona: Persona | null;
  feedbackResponses: FeedbackResponse[];
  currentQuestionIndex: number;
  currentQuestions: FeedbackQuestion[];
  pendingFollowUp: {
    originalQuestion: string;
    originalAnswer: string;
    questionId: string;
    returnState: WidgetState;
  } | null;
}

const FEEDBACK_STORAGE_KEY = 'feedback_widget_state_v1';

const loadPersistedState = (): PersistedFeedbackState | null => {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedFeedbackState;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
};

const persistState = (state: PersistedFeedbackState) => {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort persistence only.
  }
};

const clearPersistedState = () => {
  try {
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
  } catch {
    // Best-effort persistence only.
  }
};

export function FeedbackWidget({ open, onClose, style }: FeedbackWidgetProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackState, setFeedbackState] = useState<WidgetState>('idle');
  const [sessionStyle, setSessionStyle] = useState<'quick' | 'guided'>(style);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [feedbackPersona, setFeedbackPersona] = useState<Persona | null>(null);
  const [feedbackResponses, setFeedbackResponses] = useState<FeedbackResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState<FeedbackQuestion[]>([]);
  const [pendingFollowUp, setPendingFollowUp] = useState<{
    originalQuestion: string;
    originalAnswer: string;
    questionId: string;
    returnState: WidgetState;
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitializedRef = useRef(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (hasInitializedRef.current) return;

    const saved = loadPersistedState();
    if (saved && saved.feedbackState !== 'idle') {
      setMessages(saved.messages || []);
      setInput(saved.input || '');
      setFeedbackState(saved.feedbackState);
      setSessionStyle(saved.style);
      setUserName(saved.userName || '');
      setUserEmail(saved.userEmail || '');
      setFeedbackPersona(saved.feedbackPersona || null);
      setFeedbackResponses(saved.feedbackResponses || []);
      setCurrentQuestionIndex(saved.currentQuestionIndex || 0);
      setCurrentQuestions(saved.currentQuestions || []);
      setPendingFollowUp(saved.pendingFollowUp || null);
    }
    hasInitializedRef.current = true;
  }, []);

  useEffect(() => {
    if (!open) return;
    if (feedbackState === 'idle') {
      startFeedback();
    }
  }, [open, feedbackState]);

  useEffect(() => {
    if (feedbackState === 'idle' || feedbackState === 'complete') {
      setSessionStyle(style);
    }
  }, [style, feedbackState]);

  useEffect(() => {
    if (!isLoading && open) {
      inputRef.current?.focus();
    }
  }, [isLoading, open, messages]);

  const startFeedback = async () => {
    setSessionStyle(style);
    setMessages([]);
    setFeedbackState('name');
    setUserName('');
    setUserEmail('');
    setFeedbackPersona(null);
    setFeedbackResponses([]);
    setCurrentQuestionIndex(0);
    setCurrentQuestions([]);
    setPendingFollowUp(null);
    
    // Both modes start the same way
    addMessage('assistant', "Hi! What's your name?");
  };

  const resetFeedback = (closeAfterReset = false) => {
    clearPersistedState();
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setFeedbackState('idle');
    setSessionStyle(style);
    setUserName('');
    setUserEmail('');
    setFeedbackPersona(null);
    setFeedbackResponses([]);
    setCurrentQuestionIndex(0);
    setCurrentQuestions([]);
    setPendingFollowUp(null);
    if (closeAfterReset) {
      onClose();
    }
    startFeedback();
  };

  const addMessage = (role: 'user' | 'assistant', content: string, isAI = false) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      isAI,
    }]);
  };

  const handleOptionClick = async (option: string) => {
    if (isLoading) return;
    setInput('');
    addMessage('user', option);
    setIsLoading(true);

    try {
      await handleFeedbackFlow(option);
    } catch (error) {
      console.error('Feedback error:', error);
      addMessage('assistant', 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userInput = input.trim();
    setInput('');
    addMessage('user', userInput);
    setIsLoading(true);

    try {
      await handleFeedbackFlow(userInput);
    } catch (error) {
      console.error('Feedback error:', error);
      addMessage('assistant', 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to process an answer and potentially ask follow-up (guided mode only)
  const processAnswerWithFollowUp = async (
    question: string,
    answer: string,
    questionId: string,
    questionType: string,
    returnState: WidgetState
  ): Promise<{ needsFollowUp: boolean; followUpQuestion?: string }> => {
    // Only check for follow-ups in guided mode and for text questions
    if (sessionStyle !== 'guided' || questionType === 'scale') {
      return { needsFollowUp: false };
    }
    
    // Check if answer needs elaboration
    const result = await evaluateAnswerAndFollowUp(question, answer, feedbackPersona!);
    
    if (result.needsFollowUp && result.followUpQuestion) {
      setPendingFollowUp({
        originalQuestion: question,
        originalAnswer: answer,
        questionId,
        returnState,
      });
      return result;
    }
    
    return { needsFollowUp: false };
  };

  const handleFeedbackFlow = async (userInput: string) => {
    let nextMessage = '';
    let nextState: WidgetState = feedbackState;

    // Handle follow-up response (combines original + follow-up answer)
    if (feedbackState === 'follow_up' && pendingFollowUp) {
      const combinedAnswer = `${pendingFollowUp.originalAnswer} - Additional: ${userInput}`;
      setFeedbackResponses(prev => [...prev, {
        questionId: pendingFollowUp.questionId,
        questionText: pendingFollowUp.originalQuestion,
        answer: combinedAnswer,
      }]);
      
      // Return to the flow
      const returnTo = pendingFollowUp.returnState;
      setPendingFollowUp(null);
      
      // Move to next question or wrap up
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < currentQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
        const polished = await polishQuestion(currentQuestions[nextIndex].text, feedbackPersona!);
        nextMessage = polished;
        nextState = returnTo;
      } else if (returnTo === 'questions') {
        nextState = 'continue_check';
        nextMessage = "Thanks! Want to share more?";
      } else {
        await completeFeedback();
        return;
      }
      
      setFeedbackState(nextState);
      addMessage('assistant', nextMessage);
      return;
    }

    switch (feedbackState) {
      case 'name': {
        const name = userInput.trim();
        if (!name) {
          nextMessage = "Please enter your name.";
        } else {
          setUserName(name);
          nextState = 'email';
          nextMessage = `Thanks ${name}! What's your email?`;
        }
        break;
      }

      case 'email': {
        const emailMatch = userInput.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (!emailMatch) {
          nextMessage = "Please enter a valid email address.";
        } else {
          setUserEmail(emailMatch[0]);
          nextState = 'persona';
          nextMessage = "What's your role?";
        }
        break;
      }

      case 'persona': {
        const input = userInput.toLowerCase();
        let persona: Persona | null = null;
        if (input.includes('leader')) persona = 'leadership';
        else if (input.includes('stakeholder')) persona = 'stakeholder';
        else if (input.includes('build') || input.includes('team')) persona = 'build_team';
        
        if (!persona) {
          nextMessage = "Pick one: Leadership, Stakeholder, or Build Team";
        } else {
          setFeedbackPersona(persona);
          const questions = getPriorityQuestions(persona);
          setCurrentQuestions(questions);
          setCurrentQuestionIndex(0);
          nextState = 'questions';
          const polished = await polishQuestion(questions[0].text, persona);
          nextMessage = polished;
        }
        break;
      }

      case 'questions': {
        const currentQ = currentQuestions[currentQuestionIndex];
        const answer = currentQ.type === 'scale' ? parseInt(userInput) || userInput : userInput;
        
        // Check if we need follow-up (guided mode only, text questions only)
        const followUpResult = await processAnswerWithFollowUp(
          currentQ.text,
          String(answer),
          currentQ.id,
          currentQ.type,
          'questions'
        );
        
        if (followUpResult.needsFollowUp && followUpResult.followUpQuestion) {
          setFeedbackState('follow_up');
          addMessage('assistant', followUpResult.followUpQuestion, true);
          return;
        }
        
        // No follow-up needed, store answer and continue
        setFeedbackResponses(prev => [...prev, {
          questionId: currentQ.id,
          questionText: currentQ.text,
          answer,
        }]);
        
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < currentQuestions.length) {
          setCurrentQuestionIndex(nextIndex);
          const polished = await polishQuestion(currentQuestions[nextIndex].text, feedbackPersona!);
          nextMessage = polished;
        } else {
          nextState = 'continue_check';
          nextMessage = "Thanks! Want to share more?";
        }
        break;
      }

      case 'continue_check': {
        if (userInput.toLowerCase().includes('yes')) {
          const additionalQs = getAdditionalQuestions(feedbackPersona!);
          setCurrentQuestions(additionalQs);
          setCurrentQuestionIndex(0);
          nextState = 'additional_questions';
          const polished = await polishQuestion(additionalQs[0].text, feedbackPersona!);
          nextMessage = polished;
        } else {
          await completeFeedback();
          return;
        }
        break;
      }

      case 'additional_questions': {
        const currentQ = currentQuestions[currentQuestionIndex];
        const answer = currentQ.type === 'scale' ? parseInt(userInput) || userInput : userInput;
        
        // Check if we need follow-up (guided mode only, text questions only)
        const followUpResult = await processAnswerWithFollowUp(
          currentQ.text,
          String(answer),
          currentQ.id,
          currentQ.type,
          'additional_questions'
        );
        
        if (followUpResult.needsFollowUp && followUpResult.followUpQuestion) {
          setFeedbackState('follow_up');
          addMessage('assistant', followUpResult.followUpQuestion, true);
          return;
        }
        
        // No follow-up needed, store answer and continue
        setFeedbackResponses(prev => [...prev, {
          questionId: currentQ.id,
          questionText: currentQ.text,
          answer,
        }]);
        
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < currentQuestions.length) {
          setCurrentQuestionIndex(nextIndex);
          const polished = await polishQuestion(currentQuestions[nextIndex].text, feedbackPersona!);
          nextMessage = polished;
        } else {
          await completeFeedback();
          return;
        }
        break;
      }

      default:
        startFeedback();
        return;
    }

    setFeedbackState(nextState);
    addMessage('assistant', nextMessage);
  };

  const completeFeedback = async () => {
    try {
      const apiPayload = {
        respondent: {
          name: userName,
          email: userEmail,
          persona: feedbackPersona!,
        },
        responses: feedbackResponses.map(r => ({
          questionId: r.questionId,
          questionText: r.questionText,
          answer: String(r.answer),
        })),
        collectionMethod: "guided" as const,
      };

      await axiosInstance.post(API_ENDPOINTS.feedback.submit, apiPayload);
      addMessage('assistant', `Thank you${userName ? `, ${userName}` : ''}! Your feedback has been submitted and will help us improve the platform.`);
      setFeedbackState('complete');
      clearPersistedState();
    } catch {
      addMessage('assistant', "Thank you! Your feedback has been recorded.");
      setFeedbackState('complete');
      clearPersistedState();
    }
  };

  const handleClose = () => {
    // Just close - don't clear state until next open to avoid flash
    onClose();
  };

  // Get current question type for showing appropriate buttons
  const getCurrentQuestionType = () => {
    if (feedbackState === 'questions' || feedbackState === 'additional_questions') {
      return currentQuestions[currentQuestionIndex]?.type;
    }
    return null;
  };

  const showPersonaButtons = feedbackState === 'persona';
  const showYesNoButtons = feedbackState === 'continue_check';
  const showScaleButtons = getCurrentQuestionType() === 'scale';

  useEffect(() => {
    if (feedbackState === 'idle' || feedbackState === 'complete') return;
    persistState({
      version: 1,
      updatedAt: Date.now(),
      style: sessionStyle,
      messages,
      input,
      feedbackState,
      userName,
      userEmail,
      feedbackPersona,
      feedbackResponses,
      currentQuestionIndex,
      currentQuestions,
      pendingFollowUp,
    });
  }, [
    messages,
    input,
    feedbackState,
    userName,
    userEmail,
    feedbackPersona,
    feedbackResponses,
    currentQuestionIndex,
    currentQuestions,
    pendingFollowUp,
    sessionStyle,
  ]);

  return (
    <Collapse in={open}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: { xs: 88, sm: 92 },
          right: { xs: 16, sm: 24 },
          width: { xs: 'calc(100vw - 32px)', sm: 320 },
          maxWidth: 360,
          height: { xs: '70vh', sm: 600 },
          maxHeight: 'calc(100vh - 140px)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 1,
          overflow: 'hidden',
          zIndex: 1100,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        {/* Header */}
        <Box sx={{ 
          bgcolor: isDark ? 'background.paper' : 'primary.main',
          color: isDark ? 'text.primary' : 'primary.contrastText',
          px: 2, 
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Share Feedback
            </Typography>
            <Typography variant="caption" sx={{ opacity: isDark ? 0.7 : 0.85 }}>
              {sessionStyle === 'guided' ? 'AI Guided' : 'Quick'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Options">
              <IconButton
                size="small"
                onClick={(event) => setMenuAnchorEl(event.currentTarget)}
                sx={{ color: 'inherit' }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Menu
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={() => setMenuAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              resetFeedback(false);
            }}
          >
            Start over
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              resetFeedback(true);
            }}
          >
            Clear & close
          </MenuItem>
        </Menu>

        {/* Messages */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 1.5,
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1,
          minHeight: 260,
          bgcolor: isDark ? 'background.default' : 'background.default',
        }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  maxWidth: '85%',
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                  color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 1.25,
                  border: msg.role === 'assistant' ? 1 : 0,
                  borderColor: msg.role === 'assistant' ? 'divider' : 'transparent',
                }}
              >
                {msg.isAI && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      color: 'secondary.main',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      mb: 0.25,
                    }}
                  >
                    AI Follow-up
                  </Typography>
                )}
                <Typography variant="body2" sx={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              </Box>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box sx={{ px: 1.5, py: 1, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <CircularProgress size={14} color="inherit" />
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Option Buttons */}
        {!isLoading && feedbackState !== 'complete' && (showPersonaButtons || showYesNoButtons || showScaleButtons) && (
          <Box sx={{ px: 1.5, py: 1, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            {showPersonaButtons && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                <Chip
                  label="Leadership"
                  size="small"
                  onClick={() => handleOptionClick('Leadership')}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: 'action.hover',
                    '&:hover': { bgcolor: 'action.selected', color: 'primary.main' },
                  }}
                />
                <Chip
                  label="Stakeholder"
                  size="small"
                  onClick={() => handleOptionClick('Stakeholder')}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: 'action.hover',
                    '&:hover': { bgcolor: 'action.selected', color: 'primary.main' },
                  }}
                />
                <Chip
                  label="Build Team"
                  size="small"
                  onClick={() => handleOptionClick('Build Team')}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: 'action.hover',
                    '&:hover': { bgcolor: 'action.selected', color: 'primary.main' },
                  }}
                />
              </Stack>
            )}
            {showYesNoButtons && (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleOptionClick('Yes')}
                  sx={{ flex: 1 }}
                >
                  Yes
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOptionClick('No')}
                  sx={{ flex: 1 }}
                >
                  No
                </Button>
              </Stack>
            )}
            {showScaleButtons && (
              <Stack direction="row" spacing={0.5} justifyContent="center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Chip
                    key={n}
                    label={n}
                    size="small"
                    onClick={() => handleOptionClick(n.toString())}
                    sx={{ 
                      minWidth: 34, 
                      cursor: 'pointer',
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected', color: 'primary.main' },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}

        {/* Text Input */}
        {feedbackState !== 'complete' ? (
          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{ 
              p: 1.25, 
              borderTop: 1, 
              borderColor: 'divider', 
              display: 'flex', 
              alignItems: 'center',
              gap: 1, 
              bgcolor: 'background.paper',
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              size="small"
              placeholder={
                feedbackState === 'name' ? "Your name..." :
                feedbackState === 'email' ? "Your email..." :
                "Type here..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  fontSize: '0.95rem',
                  borderRadius: 1,
                  bgcolor: isDark ? alpha(theme.palette.common.white, 0.04) : 'background.paper',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'text.secondary' },
                },
              }}
            />
            <IconButton 
              type="submit"
              size="medium"
              color="primary" 
              disabled={!input.trim() || isLoading}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText',
                width: 38,
                height: 38,
                borderRadius: 1,
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { 
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled',
                },
              }}
            >
              <Send fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ p: 1.5, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
            <Chip 
              label="Done - Click to close" 
              onClick={handleClose}
              sx={{ cursor: 'pointer', bgcolor: 'action.hover' }}
            />
          </Box>
        )}
      </Paper>
    </Collapse>
  );
}
