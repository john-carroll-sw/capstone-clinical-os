/**
 * AI Chat Panel - Enhanced with dynamic UI generation
 * Features: full-screen mode, dynamic response cards, voice input, natural language search
 * Responses create custom visualizations that can be expanded/collapsed
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Chip,
  Paper,
  CircularProgress,
  Fade,
  Slide,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Close,
  Mic,
  Send,
  AutoAwesome,
  MicNone,
  OpenInFull,
  CloseFullscreen,
  Fullscreen,
  History,
  Add,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { customColors } from "../../theme/muiTheme";
import { AIResponseCard, type ResponseType } from "./AIResponseCard";
import { usePreference } from "../../services/preferencesStore";
import { useUser } from "../../context/UserContext";
import { axiosInstance } from "../../api/axiosInstance";
import { fetchWithAuth } from "../../api/authFetch";
import { env } from "../../config/env";
import { getMockChatResponse, GENERIC_MOCK_FALLBACK } from "../../data/healthcare/chatResponses";

// Surface-specific quick prompts
const LEADERSHIP_PROMPTS = [
  "How is the clinical AI program performing?",
  "What needs attention this week?",
  "Show me outcomes for pharmacy",
  "Any safety incidents?",
  "What should I focus on?",
];

const GOVERNANCE_PROMPTS = [
  "Show me pending use case approvals",
  "Any flagged AI interactions this week?",
  "What's the audit summary for pharmacy?",
  "Are there any policy violations?",
  "Which use cases need quarterly review?",
];

// Fallback for unknown surfaces
const DEFAULT_PROMPTS = [
  "How's the clinical AI program?",
  "What needs attention?",
  "Show me recent activity",
  "Any pending decisions?",
  "What should I focus on?",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: { name: string; confidence: number; kind?: "table" | "AI" | "system" }[];
  // New fields for dynamic UI
  responseType?: ResponseType;
  responseTitle?: string;
  queryContext?: string;
  responseData?: unknown;
}

interface ChatThreadSummary {
  id: string;
  title: string;
  summary?: string | null;
  messageCount: number;
  lastMessageAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ChatThreadPayload {
  id: string;
  title: string;
  summary?: string | null;
  messages: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
  }[];
  lastMessageAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  surface?: string;
}


// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

/**
 * Get user's first name from display name
 */
function getFirstName(displayName: string | undefined): string {
  if (!displayName) return 'there';
  
  // Handle "Last, First (CTR)" format
  const withoutSuffix = displayName.replace(/\s*\([^)]*\)\s*$/, '').trim();
  
  if (withoutSuffix.includes(',')) {
    const parts = withoutSuffix.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      // Return first name (which comes after the comma)
      return parts[1].split(/\s+/)[0] || 'there';
    }
  }
  
  // Handle "First Last" format
  const parts = withoutSuffix.split(/\s+/);
  return parts[0] || 'there';
}

/**
 * Get user initials from display name
 */
function getUserInitials(displayName: string | undefined): string {
  if (!displayName) return '?';
  
  // Handle "Last, First (CTR)" format
  const withoutSuffix = displayName.replace(/\s*\([^)]*\)\s*$/, '').trim();
  
  if (withoutSuffix.includes(',')) {
    const [last, first] = withoutSuffix.split(',').map(s => s.trim());
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  }
  
  // Handle "First Last" format
  const parts = withoutSuffix.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  
  return withoutSuffix.substring(0, 2).toUpperCase();
}

/**
 * Get time-appropriate greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function AIChatPanel({ isOpen, onClose, surface = 'leadership' }: AIChatPanelProps) {
  // Get voice input preference from store
  const [voiceInputEnabled] = usePreference('voiceInputEnabled');
  const { profile } = useUser();
  const apiBaseUrl = env.api.baseUrl.replace(/\/$/, "");
  
  // Get user's first name for personalized greeting
  const firstName = getFirstName(profile?.displayName);
  const greeting = getGreeting();

  // Surface-specific quick prompts
  const QUICK_PROMPTS = surface === 'governance' ? GOVERNANCE_PROMPTS
    : surface === 'leadership' ? LEADERSHIP_PROMPTS
    : DEFAULT_PROMPTS;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  
  // Agent streaming state
  const [agentThought, setAgentThought] = useState<string | null>(null);
  const [agentAction, setAgentAction] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ChatThreadSummary[]>([]);
  const [threadMenuAnchor, setThreadMenuAnchor] = useState<HTMLElement | null>(null);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [isThreadsLoading, setIsThreadsLoading] = useState(false);
  const [threadSearchInput, setThreadSearchInput] = useState("");
  const [threadSearch, setThreadSearch] = useState("");
  const [threadPage, setThreadPage] = useState(1);
  const [threadsHasNext, setThreadsHasNext] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<ChatThreadSummary | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingThread, setIsDeletingThread] = useState(false);
  const [deleteToast, setDeleteToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [areQuickPromptsOpen, setAreQuickPromptsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isThreadMenuOpen = Boolean(threadMenuAnchor);
  const activeStreamThreadIdRef = useRef<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const streamIdRef = useRef(0);

  // Check if speech recognition is supported
  const isSpeechSupported = useCallback(() => {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }, []);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    if (!isSpeechSupported()) {
      return null;
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
      setInterimTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setInput((prev) => prev + (prev ? " " : "") + finalTranscript.trim());
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      switch (event.error) {
        case "not-allowed":
          setSpeechError("Microphone access denied. Please enable microphone permissions.");
          break;
        case "no-speech":
          setSpeechError("No speech detected. Please try again.");
          break;
        case "network":
          setSpeechError("Network error. Please check your connection.");
          break;
        case "aborted":
          break;
        default:
          setSpeechError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    return recognition;
  }, [isSpeechSupported]);

  // Surface-specific welcome message
  const getWelcomeMessage = () => {
    if (surface === 'governance') {
      return `${greeting}, ${firstName}! I can help you review use case approvals, audit logs, policy compliance, and flagged interactions. What would you like to look at?`;
    }
    return `${greeting}, ${firstName}! How can I help you with the clinical AI program today?`;
  };

  // Initialize welcome message when panel opens and we have user info
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: getWelcomeMessage(),
        timestamp: new Date().toISOString(),
        responseType: "text_only",
      }]);
      setAreQuickPromptsOpen(true);
    }
  }, [isOpen, firstName, greeting, messages.length, surface]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!expandedResponseId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, expandedResponseId]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsFullscreen(false);
      setExpandedResponseId(null);
    }
  }, [isOpen, isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape") {
        if (expandedResponseId) {
          setExpandedResponseId(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isFullscreen, expandedResponseId]);

  // Detect response type from query (used for UI card selection)
  const detectResponseType = (query: string): { type: ResponseType; title: string; context?: string } => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("portfolio") || lowerQuery.includes("overview") || lowerQuery.includes("summary") || lowerQuery.includes("how is") || lowerQuery.includes("how are")) {
      return { type: "portfolio_overview", title: "Portfolio Overview" };
    }
    if (lowerQuery.includes("needle") || lowerQuery.includes("week") || lowerQuery.includes("progress") || lowerQuery.includes("this week") || lowerQuery.includes("wins")) {
      return { type: "weekly_performance", title: "Weekly Performance" };
    }
    if (lowerQuery.includes("attention") || lowerQuery.includes("risk") || lowerQuery.includes("alert") || lowerQuery.includes("signal") || lowerQuery.includes("blocker")) {
      return { type: "alerts_summary", title: "Alerts & Signals" };
    }
    if (lowerQuery.includes("decision") || lowerQuery.includes("pending") || lowerQuery.includes("approve")) {
      return { type: "decisions_pending", title: "Pending Decisions" };
    }
    if (lowerQuery.includes("recommend") || lowerQuery.includes("suggest") || lowerQuery.includes("should i") || lowerQuery.includes("what should") || lowerQuery.includes("focus")) {
      return { type: "recommendations", title: "AI Recommendations" };
    }
    if (lowerQuery.includes("trend") || lowerQuery.includes("anomaly") || lowerQuery.includes("pattern") || lowerQuery.includes("analysis")) {
      return { type: "trend_analysis", title: "Trend Analysis" };
    }

    return { type: "custom_query", title: "Query Results" };
  };

  /**
   * Parse SSE event data
   */
  const parseSSEEvent = (eventStr: string): { type: string; data: string } | null => {
    const lines = eventStr.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          return JSON.parse(line.slice(6));
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const buildContextMessages = (context: Message[], maxMessages = 12) => {
    return context
      .filter((message) => message.id !== "welcome")
      .slice(-maxMessages)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));
  };

  const fetchThreads = useCallback(async ({
    page = 1,
    search = "",
    append = false,
  }: {
    page?: number;
    search?: string;
    append?: boolean;
  } = {}) => {
    setIsThreadsLoading(true);
    let currentStreamId = streamIdRef.current;
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      params.set("page", String(page));
      if (search) {
        params.set("search", search);
      }
      const response = await axiosInstance.get("/chat/threads", {
        params: Object.fromEntries(params.entries()),
      });
      const data = response.data;
      const items = Array.isArray(data) ? data : data.items || [];
      const hasNext = Array.isArray(data) ? false : Boolean(data.hasNext);

      setThreads((prev) => (append ? [...prev, ...items] : items));
      setThreadPage(page);
      setThreadsHasNext(hasNext);
    } catch (error) {
      console.error("Failed to load chat threads:", error);
    } finally {
      setIsThreadsLoading(false);
    }
  }, []);

  const refreshThreads = useCallback(async (searchValue: string = threadSearch) => {
    await fetchThreads({ page: 1, search: searchValue, append: false });
  }, [fetchThreads, threadSearch]);

  const loadMoreThreads = useCallback(async () => {
    if (!threadsHasNext || isThreadsLoading) return;
    await fetchThreads({ page: threadPage + 1, search: threadSearch, append: true });
  }, [fetchThreads, threadPage, threadSearch, threadsHasNext, isThreadsLoading]);

  useEffect(() => {
    if (isOpen) {
      refreshThreads();
    }
  }, [isOpen, refreshThreads]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const nextSearch = threadSearchInput.trim();
      setThreadSearch(nextSearch);
      if (isOpen) {
        refreshThreads(nextSearch);
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [threadSearchInput, isOpen, refreshThreads]);

  const loadThread = useCallback(async (id: string) => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    streamIdRef.current += 1;
    activeStreamThreadIdRef.current = null;
    setAgentThought(null);
    setAgentAction(null);
    setStreamingContent("");
    setIsLoading(false);
    setIsThreadLoading(true);
    try {
      const response = await axiosInstance.get(`/chat/threads/${id}`);
      const data: ChatThreadPayload = response.data;
      const loadedMessages: Message[] = (data.messages || [])
        .filter((message) => message.role !== "system")
        .map((message) => ({
          id: message.id,
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content,
          timestamp: message.timestamp,
          sources: Array.isArray(message.sources) ? message.sources : [],
        }));
      setThreadId(data.id);
      setMessages(loadedMessages);
      setExpandedResponseId(null);
      setIsFullscreen(false);
      setAgentThought(null);
      setAgentAction(null);
      setStreamingContent("");
      setAreQuickPromptsOpen(false);
    } catch (error) {
      console.error("Failed to load thread:", error);
    } finally {
      setIsThreadLoading(false);
    }
  }, []);

  const openDeleteDialog = useCallback((thread: ChatThreadSummary) => {
    setThreadMenuAnchor(null);
    setDeleteCandidate(thread);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (isDeletingThread) return;
    setIsDeleteDialogOpen(false);
    setDeleteCandidate(null);
  }, [isDeletingThread]);

  const startNewThread = useCallback(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    streamIdRef.current += 1;
    activeStreamThreadIdRef.current = null;
    setThreadId(null);
    setMessages([]);
    setExpandedResponseId(null);
    setIsFullscreen(false);
    setAgentThought(null);
    setAgentAction(null);
    setStreamingContent("");
    setIsLoading(false);
    setAreQuickPromptsOpen(true);
  }, []);

  const ensureThread = useCallback(async (titleSeed: string) => {
    if (threadId) {
      return threadId;
    }
    try {
      const response = await axiosInstance.post("/chat/threads", {});
      const data: ChatThreadPayload = response.data;
      setThreadId(data.id);
      setThreads((prev) => [
        {
          id: data.id,
          title: data.title,
          summary: data.summary,
          messageCount: data.messages?.length || 0,
          lastMessageAt: data.lastMessageAt || null,
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        },
        ...prev.filter((thread) => thread.id !== data.id),
      ]);
      return data.id;
    } catch (error) {
      console.error("Failed to create chat thread:", error);
      return null;
    }
  }, [threadId]);

  const confirmDeleteThread = useCallback(async () => {
    if (!deleteCandidate || isDeletingThread) return;
    setIsDeletingThread(true);
    try {
      await axiosInstance.delete(`/chat/threads/${deleteCandidate.id}`);
      setThreads((prev) => prev.filter((thread) => thread.id !== deleteCandidate.id));
      if (threadId === deleteCandidate.id) {
        startNewThread();
      }
      setDeleteToast({ message: "Chat deleted.", severity: "success" });
    } catch (error) {
      console.error("Failed to delete chat thread:", error);
      setDeleteToast({ message: "Failed to delete chat.", severity: "error" });
    } finally {
      setIsDeletingThread(false);
      setIsDeleteDialogOpen(false);
      setDeleteCandidate(null);
    }
  }, [deleteCandidate, isDeletingThread, startNewThread, threadId]);

  /**
   * Generate AI response using streaming chat completions API
   * Streams agent thoughts and final response via SSE
   */
  const generateAIResponse = useCallback(async (
    query: string,
    contextMessages: { role: "user" | "assistant" | "system"; content: string }[],
    activeThreadId: string | null,
    abortSignal: AbortSignal,
    streamId: number,
  ): Promise<Message> => {
    const { title } = detectResponseType(query);
    const isActiveStream = () => streamIdRef.current === streamId && activeStreamThreadIdRef.current === activeThreadId;
    
    // Reset streaming state
    if (isActiveStream()) {
      setAgentThought(null);
      setAgentAction(null);
      setStreamingContent("");
    }
    
    try {
      // Call the streaming chat completions endpoint
      const response = await fetchWithAuth(`${apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: contextMessages,
          stream: true,
          thread_id: activeThreadId || undefined,
        }),
        signal: abortSignal,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      let finalContent = '';
      let hasError = false;
      let toolResult: {
        uiType?: ResponseType;
        payload?: unknown;
        sources?: { name: string; confidence: number; kind?: "table" | "AI" | "system" }[];
      } | null = null;
      
      while (true) {
        if (abortSignal.aborted) {
          throw new DOMException("Request aborted", "AbortError");
        }
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE events (separated by double newlines)
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer
        
        for (const eventStr of events) {
          if (!eventStr.trim()) continue;
          
          const event = parseSSEEvent(eventStr);
          if (!event) continue;
          
          if (!isActiveStream()) {
            continue;
          }
          switch (event.type) {
            case 'token':
              // REAL-TIME token from LLM - accumulate and display immediately
              finalContent += event.data;
              if (isActiveStream()) {
                setStreamingContent(finalContent);
              }
              // Clear tool indicator when tokens start flowing
              if (isActiveStream()) {
                setAgentAction(null);
              }
              break;
              
            case 'tool_start':
            case 'tool':
              // Agent is calling a tool - show as ghost text
              if (isActiveStream()) {
                setAgentAction(`Using ${event.data}...`);
              }
              break;

            case 'tool_result':
              toolResult = {
                uiType: event.data?.uiType as ResponseType | undefined,
                payload: event.data?.payload,
                sources: event.data?.sources,
              };
              break;
              
            case 'error':
              hasError = true;
              if (!finalContent) {
                finalContent = `Error: ${event.data}`;
              }
              break;
              
            case 'done':
              // Stream complete
              break;
          }
        }
      }
      
      // Clear any remaining streaming state
      if (isActiveStream()) {
        setAgentThought(null);
        setAgentAction(null);
        setStreamingContent("");
      }
      
      if (hasError || !finalContent) {
        return {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: finalContent || "I wasn't able to generate a response. Please try again.",
          timestamp: new Date().toISOString(),
          sources: [{ name: "System", kind: "system", confidence: 1 }],
          responseType: "text_only",
          responseTitle: "System",
        };
      }

      const responseType = toolResult?.uiType || "text_only";
      const responseData = toolResult?.payload;
      const sources = toolResult?.sources ? toolResult.sources : [];

      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: finalContent,
        timestamp: new Date().toISOString(),
        sources,
        responseType,
        responseTitle: title,
        responseData,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          sources: [],
          responseType: "text_only",
          responseTitle: "Cancelled",
        };
      }
      console.error('Failed to get AI response:', error);
      
      // Clear streaming state on error
      if (isActiveStream()) {
        setAgentThought(null);
        setAgentAction(null);
        setStreamingContent("");
      }
      
      // Fallback: use mock responses keyed by the user's query
      const mockResponse = getMockChatResponse(surface, query) ?? GENERIC_MOCK_FALLBACK;
      
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: mockResponse.content,
        timestamp: new Date().toISOString(),
        sources: mockResponse.sources ?? [{ name: "System", kind: "system", confidence: 1 }],
        responseType: "text_only",
        responseTitle: title,
      };
    }
  }, [apiBaseUrl, detectResponseType, surface]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (!messages.some((message) => message.role === "user")) {
      setAreQuickPromptsOpen(false);
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let activeThreadId: string | null = null;
    let currentStreamId = streamIdRef.current;
    try {
      const contextMessages = buildContextMessages([...messages, userMessage]);
      activeThreadId = await ensureThread(input);
      if (streamAbortRef.current) {
        streamAbortRef.current.abort();
      }
      const controller = new AbortController();
      streamAbortRef.current = controller;
      streamIdRef.current += 1;
      currentStreamId = streamIdRef.current;
      activeStreamThreadIdRef.current = activeThreadId;
      const response = await generateAIResponse(
        input,
        contextMessages,
        activeThreadId,
        controller.signal,
        currentStreamId,
      );
      if (activeStreamThreadIdRef.current === activeThreadId && streamIdRef.current === currentStreamId && response.content) {
        setMessages((prev) => [...prev, response]);
      }
      if (activeThreadId) {
        refreshThreads();
      }
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      if (activeStreamThreadIdRef.current === activeThreadId && streamIdRef.current === currentStreamId) {
        setIsLoading(false);
      }
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    // Auto-submit the quick prompt instead of just populating input
    if (isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (!messages.some((message) => message.role === "user")) {
      setAreQuickPromptsOpen(false);
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setAreQuickPromptsOpen(false);

    (async () => {
      let activeThreadId: string | null = null;
      let currentStreamId = streamIdRef.current;
      try {
        const contextMessages = buildContextMessages([...messages, userMessage]);
        activeThreadId = await ensureThread(prompt);
        if (streamAbortRef.current) {
          streamAbortRef.current.abort();
        }
        const controller = new AbortController();
        streamAbortRef.current = controller;
        streamIdRef.current += 1;
        currentStreamId = streamIdRef.current;
        activeStreamThreadIdRef.current = activeThreadId;
        const response = await generateAIResponse(
          prompt,
          contextMessages,
          activeThreadId,
          controller.signal,
          currentStreamId,
        );
        if (activeStreamThreadIdRef.current === activeThreadId && streamIdRef.current === currentStreamId && response.content) {
          setMessages((prev) => [...prev, response]);
        }
        if (activeThreadId) {
          refreshThreads();
        }
      } catch (err) {
        console.error("Error generating response:", err);
      } finally {
        if (activeStreamThreadIdRef.current === activeThreadId && streamIdRef.current === currentStreamId) {
          setIsLoading(false);
        }
      }
    })();
  };

  const toggleVoice = () => {
    // Check if voice input is enabled in preferences
    if (!voiceInputEnabled) {
      setSpeechError("Voice input is disabled. Enable it in Settings → AI Features.");
      return;
    }
    
    if (!isSpeechSupported()) {
      setSpeechError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      setSpeechError(null);
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (error) {
          console.error("Error starting speech recognition:", error);
          setSpeechError("Failed to start speech recognition.");
        }
      }
    }
  };

  const handleExpandResponse = (messageId: string) => {
    setExpandedResponseId(expandedResponseId === messageId ? null : messageId);
  };

  // Get panel width based on mode
  const getPanelWidth = () => {
    if (expandedResponseId) return "100vw";
    if (isFullscreen) return { xs: "100%", sm: "100%", md: 720 };
    return { xs: "100%", sm: 420 };
  };

  return (
    <>
      {/* Backdrop */}
      <Fade in={isOpen}>
        <Box
          onClick={() => {
            if (!expandedResponseId && !isFullscreen) {
              onClose();
            }
          }}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: expandedResponseId ? "background.default" : "rgba(0, 0, 0, 0.25)",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            transition: "background-color 0.3s ease",
          }}
        />
      </Fade>

      {/* Expanded Response Full-Screen View */}
      {expandedResponseId && (
        <Fade in={true}>
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: (theme) => theme.zIndex.drawer + 3,
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages
              .filter((m) => m.id === expandedResponseId)
              .map((message) => (
                <AIResponseCard
                  key={message.id}
                  type={message.responseType || "text_only"}
                  title={message.responseTitle || "Response"}
                  summary={message.content}
                  isFullscreen={true}
                  onToggleFullscreen={() => setExpandedResponseId(null)}
                  onClose={() => setExpandedResponseId(null)}
                  queryContext={message.queryContext}
                  sources={message.sources}
                />
              ))}
          </Box>
        </Fade>
      )}

      {/* Panel */}
      <Slide
        direction="left"
        in={isOpen && !expandedResponseId}
        mountOnEnter
        unmountOnExit
        timeout={{ enter: 450, exit: 380 }}
        easing={{ enter: "cubic-bezier(0.2, 0, 0, 1)", exit: "cubic-bezier(0.2, 0, 0, 1)" }}
      >
        <Drawer
          variant="persistent"
          anchor="right"
          open={isOpen}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 2,
            "& .MuiDrawer-paper": {
              width: getPanelWidth(),
              maxWidth: "100vw",
              boxSizing: "border-box",
              transition: "width 0.3s ease",
              height: isFullscreen ? "100%" : "calc(100% - 32px)",
              margin: isFullscreen ? 0 : "16px",
              borderRadius: isFullscreen ? 0 : 2,
              boxShadow: isFullscreen ? undefined : "0 24px 60px rgba(15, 23, 42, 0.15)",
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: `${customColors.accent.cyan}20`,
                    color: customColors.accent.cyan,
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    HelixGuard Assistant
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {surface === 'governance' ? 'Ask about approvals, audits & compliance' : 'Ask anything about clinical AI operations'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Tooltip title="New chat">
                  <IconButton onClick={startNewThread} size="small">
                    <Add fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Recent chats">
                  <IconButton onClick={(event) => setThreadMenuAnchor(event.currentTarget)} size="small">
                    <History fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isFullscreen ? "Exit full width" : "Expand width"}>
                  <IconButton onClick={() => setIsFullscreen(!isFullscreen)} size="small">
                    {isFullscreen ? <CloseFullscreen /> : <OpenInFull />}
                  </IconButton>
                </Tooltip>
                <IconButton onClick={onClose} size="small">
                  <Close />
                </IconButton>
              </Box>
            </Box>

            <Menu
              anchorEl={threadMenuAnchor}
              open={isThreadMenuOpen}
              onClose={() => setThreadMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{ sx: { maxHeight: 360 } }}
              MenuListProps={{ sx: { maxHeight: 360, overflow: "auto" } }}
            >
              <MenuItem disabled>Recent chats</MenuItem>
              <Divider />
              <MenuItem
                disableRipple
                disableGutters
                onClick={(event) => event.stopPropagation()}
                sx={{ cursor: "default", px: 2 }}
              >
                <TextField
                  size="small"
                  placeholder="Search chats"
                  value={threadSearchInput}
                  onChange={(event) => setThreadSearchInput(event.target.value)}
                  fullWidth
                />
              </MenuItem>
              <Divider />
              {isThreadsLoading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : threads.length === 0 ? (
                <MenuItem disabled>No previous chats</MenuItem>
              ) : (
                threads.map((thread) => (
                  <MenuItem
                    key={thread.id}
                    selected={thread.id === threadId}
                    onClick={() => {
                      setThreadMenuAnchor(null);
                      loadThread(thread.id);
                    }}
                    sx={{ maxWidth: 320, display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <ListItemText
                      primary={thread.title}
                      secondary={thread.lastMessageAt ? `Updated ${new Date(thread.lastMessageAt).toLocaleDateString()}` : "New"}
                      primaryTypographyProps={{ noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                      sx={{ flex: 1, minWidth: 0 }}
                    />
                    <Tooltip title="Delete chat">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openDeleteDialog(thread);
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </MenuItem>
                ))
              )}
              {threadsHasNext && (
                <>
                  <Divider />
                  <MenuItem onClick={loadMoreThreads} disabled={isThreadsLoading}>
                    Load more
                  </MenuItem>
                </>
              )}
            </Menu>

            {/* Speech Error Alert */}
            {speechError && (
              <Alert 
                severity="warning" 
                onClose={() => setSpeechError(null)}
                sx={{ mx: 2, mt: 2 }}
              >
                {speechError}
              </Alert>
            )}

            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
              <DialogTitle>Delete chat?</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary">
                  This will remove the chat from your recent list.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={closeDeleteDialog} disabled={isDeletingThread}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={confirmDeleteThread}
                  disabled={isDeletingThread}
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={Boolean(deleteToast)}
              autoHideDuration={4000}
              onClose={() => setDeleteToast(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert
                severity={deleteToast?.severity || "success"}
                onClose={() => setDeleteToast(null)}
                sx={{ width: "100%" }}
              >
                {deleteToast?.message || ""}
              </Alert>
            </Snackbar>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {isThreadLoading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                  <CircularProgress size={14} color="inherit" />
                  <Typography variant="caption">Loading chat...</Typography>
                </Box>
              )}
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isFullscreen={isFullscreen}
                  onExpand={() => handleExpandResponse(message.id)}
                  userInitials={getUserInitials(profile?.displayName)}
                />
              ))}
              {isLoading && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: `${customColors.accent.cyan}20`,
                      color: customColors.accent.cyan,
                    }}
                  >
                    <CircularProgress size={16} color="inherit" />
                  </Avatar>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                    {/* Agent thought - ghost text that fades */}
                    {agentThought && (
                      <Fade in={!!agentThought} timeout={300}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                            color: "text.disabled",
                            fontStyle: "italic",
                            fontSize: "0.85rem",
                            animation: "fadeInOut 3s ease-in-out",
                            "@keyframes fadeInOut": {
                              "0%": { opacity: 0 },
                              "10%": { opacity: 0.7 },
                              "80%": { opacity: 0.7 },
                              "100%": { opacity: 0 },
                            },
                          }}
                        >
                          <AutoAwesome sx={{ fontSize: 14, mt: 0.3, opacity: 0.5 }} />
                          <Typography variant="caption" sx={{ opacity: 0.7, lineHeight: 1.4 }}>
                            {agentThought}
                          </Typography>
                        </Box>
                      </Fade>
                    )}
                    
                    {/* Agent action - what tool is being used */}
                    {agentAction && (
                      <Fade in={!!agentAction} timeout={200}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: customColors.accent.cyan,
                            fontSize: "0.75rem",
                          }}
                        >
                          <CircularProgress size={10} color="inherit" />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {agentAction}
                          </Typography>
                        </Box>
                      </Fade>
                    )}
                    
                    {/* Streaming content - shows real-time as LLM generates */}
                    {streamingContent && (
                      <Paper sx={{ p: 2, borderRadius: 1.5, bgcolor: "background.default" }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: "pre-wrap",
                            "& strong": { fontWeight: 600 },
                          }}
                        >
                          {streamingContent}
                          <Box
                            component="span"
                            sx={{
                              display: "inline-block",
                              width: 8,
                              height: 16,
                              bgcolor: customColors.accent.cyan,
                              ml: 0.5,
                              animation: "blink 1s infinite",
                              "@keyframes blink": {
                                "0%, 50%": { opacity: 1 },
                                "51%, 100%": { opacity: 0 },
                              },
                            }}
                          />
                        </Typography>
                      </Paper>
                    )}
                    
                    {/* Default loading dots when no streaming info */}
                    {!agentThought && !agentAction && !streamingContent && (
                      <Paper sx={{ p: 2, borderRadius: 1.5 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {[1, 2, 3].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: customColors.accent.cyan,
                                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                                "@keyframes pulse": {
                                  "0%, 80%, 100%": { opacity: 0.3 },
                                  "40%": { opacity: 1 },
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Quick Prompts */}
            <Box
              sx={{ borderTop: 1, borderColor: "divider", px: 1.5, py: 1 }}
              onClick={() => {
                if (!areQuickPromptsOpen) {
                  setAreQuickPromptsOpen(true);
                }
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                  cursor: areQuickPromptsOpen ? "default" : "pointer",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Quick prompts
                </Typography>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    setAreQuickPromptsOpen((prev) => !prev);
                  }}
                  aria-label={areQuickPromptsOpen ? "Collapse quick prompts" : "Expand quick prompts"}
                >
                  {areQuickPromptsOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
              </Box>
              <Collapse in={areQuickPromptsOpen} timeout="auto" unmountOnExit>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {QUICK_PROMPTS.map((prompt) => (
                    <Chip
                      key={prompt}
                      label={prompt}
                      size="small"
                      variant="outlined"
                      onClick={() => handleQuickPrompt(prompt)}
                      sx={{
                        cursor: "pointer",
                        borderRadius: 1.5,
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.hover",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>

            {/* Input */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 1.5,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              {interimTranscript && (
                <Box
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 0.75,
                    bgcolor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CircularProgress size={12} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    {interimTranscript}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip 
                  title={
                    !voiceInputEnabled
                      ? "Voice input disabled. Enable in Settings."
                      : !isSpeechSupported() 
                        ? "Speech recognition not supported" 
                        : isListening 
                          ? "Stop listening" 
                          : "Start voice input"
                  }
                >
                  <span>
                    <IconButton
                      onClick={toggleVoice}
                      size="small"
                      disabled={!voiceInputEnabled || !isSpeechSupported()}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: isListening ? customColors.accent.cyan : "transparent",
                        color: isListening ? "background.paper" : "text.secondary",
                        animation: isListening ? "pulse 1.5s ease-in-out infinite" : "none",
                        "@keyframes pulse": {
                          "0%": { boxShadow: `0 0 0 0 ${customColors.accent.cyan}40` },
                          "70%": { boxShadow: `0 0 0 10px ${customColors.accent.cyan}00` },
                          "100%": { boxShadow: `0 0 0 0 ${customColors.accent.cyan}00` },
                        },
                        "&:hover": {
                          bgcolor: isListening 
                            ? customColors.accent.cyan 
                            : "action.hover",
                        },
                        "&:disabled": {
                          color: "text.disabled",
                        },
                      }}
                    >
                      {isListening ? <Mic fontSize="small" /> : <MicNone fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
                <TextField
                  inputRef={inputRef}
                  fullWidth
                  size="small"
                  multiline
                  minRows={1}
                  maxRows={3}
                  placeholder={isListening ? "Listening..." : "Ask me anything..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      if (!isLoading && input.trim()) {
                        handleSubmit(event as unknown as React.FormEvent);
                      }
                    }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                    },
                    "& .MuiInputBase-inputMultiline": {
                      maxHeight: "4.5em",
                      overflow: "auto",
                    },
                  }}
                />
                <IconButton
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  color="primary"
                  size="small"
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    width: 32,
                    height: 32,
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "&:disabled": {
                      bgcolor: "action.disabledBackground",
                    },
                  }}
                >
                  <Send fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Drawer>
      </Slide>
    </>
  );
}

// Chat Message Component
interface ChatMessageProps {
  message: Message;
  isFullscreen: boolean;
  onExpand: () => void;
  userInitials: string;
}

function ChatMessage({ message, isFullscreen, onExpand, userInitials }: ChatMessageProps) {
  const theme = useTheme();
  const isUser = message.role === "user";
  const hasCustomUI = Boolean(message.responseData) && message.responseType !== "text_only" && message.responseType !== "custom_query";
  const safe_sources = Array.isArray(message.sources) ? message.sources : [];
  const max_confidence = safe_sources.length
    ? Math.max(...safe_sources.map((source) => Number(source.confidence) || 0))
    : null;

  // User message colors with better contrast
  const userMessageBg = `linear-gradient(135deg, ${customColors.brand.navy} 0%, ${customColors.brand.navyLight} 100%)`;
  const userMessageTextColor = "#ffffff"; // Always white text for user messages

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: isUser
            ? `${customColors.accent.primary}20`
            : `${customColors.accent.cyan}20`,
          color: isUser ? customColors.accent.primary : customColors.accent.cyan,
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        {isUser ? userInitials : <AutoAwesome sx={{ fontSize: 16 }} />}
      </Avatar>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          alignItems: isUser ? "flex-end" : "flex-start",
          maxWidth: isFullscreen ? "100%" : "calc(100% - 48px)",
        }}
      >
        {/* User message or text content */}
        {(isUser || !hasCustomUI) && (
          <Paper
            elevation={0}
            sx={{
              maxWidth: "100%",
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              background: isUser ? userMessageBg : undefined,
              bgcolor: isUser ? undefined : "background.default",
              color: isUser ? userMessageTextColor : "text.primary",
              // Markdown styles
              "& .markdown-content": {
                color: isUser ? userMessageTextColor : "inherit",
                "& p": {
                  margin: 0,
                  marginBottom: "0.5em",
                  "&:last-child": { marginBottom: 0 },
                },
                "& strong": {
                  fontWeight: 600,
                  color: isUser ? userMessageTextColor : theme.palette.text.primary,
                },
                "& em": {
                  fontStyle: "italic",
                },
                "& ul, & ol": {
                  margin: "0.5em 0",
                  paddingLeft: "1.5em",
                },
                "& li": {
                  marginBottom: "0.25em",
                },
                "& code": {
                  backgroundColor: isUser 
                    ? "rgba(255, 255, 255, 0.2)" 
                    : theme.palette.action.hover,
                  padding: "0.1em 0.4em",
                  borderRadius: "3px",
                  fontSize: "0.9em",
                  fontFamily: "monospace",
                },
                "& pre": {
                  backgroundColor: isUser 
                    ? "rgba(255, 255, 255, 0.15)" 
                    : theme.palette.action.hover,
                  padding: "0.75em",
                  borderRadius: "6px",
                  overflow: "auto",
                  "& code": {
                    backgroundColor: "transparent",
                    padding: 0,
                  },
                },
                "& blockquote": {
                  borderLeft: `3px solid ${isUser ? "rgba(255,255,255,0.5)" : theme.palette.divider}`,
                  marginLeft: 0,
                  paddingLeft: "1em",
                  color: isUser ? "rgba(255,255,255,0.9)" : theme.palette.text.secondary,
                },
                "& a": {
                  color: isUser ? userMessageTextColor : theme.palette.primary.main,
                  textDecoration: "underline",
                },
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                  margin: "0.5em 0 0.25em",
                  fontWeight: 600,
                  color: isUser ? userMessageTextColor : theme.palette.text.primary,
                },
              },
            }}
          >
            <Box className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </Box>
          </Paper>
        )}

        {/* Dynamic Response Card for AI messages */}
        {!isUser && hasCustomUI && (
          <Box sx={{ width: "100%" }}>
            <AIResponseCard
              type={message.responseType!}
              title={message.responseTitle || "Response"}
              summary={message.content}
              isFullscreen={false}
              onToggleFullscreen={onExpand}
              queryContext={message.queryContext}
              sources={message.sources}
              data={message.responseData}
            />
          </Box>
        )}

        {/* Sources + Confidence pills */}
        {!isUser && safe_sources.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <Chip
              size="small"
              label={`Confidence ${Math.round((max_confidence ?? 0) * 100)}%`}
              sx={{
                height: 22,
                fontSize: "0.7rem",
                bgcolor: "action.hover",
                borderRadius: 1.5,
              }}
            />
            {safe_sources.map((source, i) => (
              <Chip
                key={i}
                size="small"
                icon={
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: source.confidence >= 0.9 
                        ? customColors.health.green 
                        : customColors.health.amber,
                      ml: 1,
                    }}
                  />
                }
                label={`${source.name}${source.kind ? ` (${source.kind})` : ""}`}
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  bgcolor: "action.hover",
                  borderRadius: 1.5,
                }}
              />
            ))}
          </Box>
        )}

        {/* Expand button for custom UI responses */}
        {!isUser && hasCustomUI && (
          <Button
            size="small"
            onClick={onExpand}
            startIcon={<Fullscreen fontSize="small" />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              fontSize: "0.75rem",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            View Full Analysis
          </Button>
        )}

        {/* Timestamp */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: isUser ? "right" : "left" }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Box>
    </Box>
  );
}

export default AIChatPanel;
