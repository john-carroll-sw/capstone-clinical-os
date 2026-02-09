/**
 * Clinician Panel — Surface 1
 * 
 * Layout: blurred EHR screenshot as background + AI assistance panel on the right.
 * Communicates: "Clinicians never open a new app — AI surfaces inline in the EHR."
 * 
 * The left side is a blurred, non-interactive mock of an EHR.
 * The right side is the actual ClinicalOS AI panel with:
 * - Patient context header
 * - Pharmacy: alert priority queue with AI summaries
 * - Nursing: SBAR handoff summary with edit/sign-off
 */

import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Fade,
} from '@mui/material';
import { Warning, FiberManualRecord, Send, AutoAwesome, RestartAlt } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { customColors } from '../../theme/muiTheme';
import { useTheme } from '../../context/ThemeContext';
import { PATIENTS, type Patient } from '../../data/healthcare/patients';
import { PharmacyAlertQueue } from './PharmacyAlertQueue';
import { NursingHandoffView } from './NursingHandoffView';
import {
  getMockChatResponse,
  GENERIC_MOCK_FALLBACK,
  CLINICIAN_PHARMACY_MOCK_RESPONSES,
  CLINICIAN_NURSING_MOCK_RESPONSES,
} from '../../data/healthcare/chatResponses';

interface ClinicianPanelProps {
  department: 'pharmacy' | 'nursing';
}

// ─── Simulated EHR Background ─────────────────────────────────

function EHRBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isDark ? '#0a0c10' : '#e8ecf0',
      }}
    >
      {/* Simulated EHR content (blurred) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          filter: 'blur(6px)',
          opacity: isDark ? 0.3 : 0.4,
          p: 3,
          overflow: 'hidden',
        }}
      >
        {/* Fake EHR header */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Box sx={{ width: 140, height: 32, bgcolor: isDark ? '#1a2035' : '#3b82f6', borderRadius: 1 }} />
          <Box sx={{ width: 80, height: 24, bgcolor: isDark ? '#1a2035' : '#94a3b8', borderRadius: 1 }} />
          <Box sx={{ width: 80, height: 24, bgcolor: isDark ? '#1a2035' : '#94a3b8', borderRadius: 1 }} />
          <Box sx={{ width: 80, height: 24, bgcolor: isDark ? '#1a2035' : '#94a3b8', borderRadius: 1 }} />
          <Box sx={{ flex: 1 }} />
          <Box sx={{ width: 200, height: 28, bgcolor: isDark ? '#1a2035' : '#e2e8f0', borderRadius: 1 }} />
        </Box>

        {/* Fake patient banner */}
        <Box sx={{ bgcolor: isDark ? '#131726' : '#f8fafc', borderRadius: 1, p: 2, mb: 2, border: '1px solid', borderColor: isDark ? '#1e2540' : '#cbd5e1' }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Box sx={{ width: 180, height: 20, bgcolor: isDark ? '#1e2540' : '#475569', borderRadius: 0.5, mb: 1 }} />
              <Box sx={{ width: 120, height: 14, bgcolor: isDark ? '#1a2035' : '#94a3b8', borderRadius: 0.5 }} />
            </Box>
            <Box>
              <Box sx={{ width: 100, height: 14, bgcolor: isDark ? '#1a2035' : '#94a3b8', borderRadius: 0.5, mb: 0.5 }} />
              <Box sx={{ width: 80, height: 14, bgcolor: isDark ? '#1a2035' : '#94a3b8', borderRadius: 0.5 }} />
            </Box>
            <Box>
              <Box sx={{ width: 100, height: 14, bgcolor: isDark ? '#1a2035' : '#94a3b8', borderRadius: 0.5, mb: 0.5 }} />
              <Box sx={{ width: 60, height: 14, bgcolor: isDark ? '#1a2035' : '#94a3b8', borderRadius: 0.5 }} />
            </Box>
          </Box>
        </Box>

        {/* Fake chart tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {['Orders', 'Results', 'Notes', 'MAR', 'Vitals', 'I&O'].map((tab) => (
            <Box key={tab} sx={{ px: 2, py: 0.5, bgcolor: isDark ? '#1a2035' : '#e2e8f0', borderRadius: 1 }}>
              <Box sx={{ width: 50, height: 14, bgcolor: isDark ? '#252d45' : '#94a3b8', borderRadius: 0.5 }} />
            </Box>
          ))}
        </Box>

        {/* Fake orders table */}
        {Array.from({ length: 12 }, (_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, py: 1, borderBottom: '1px solid', borderColor: isDark ? '#1a2035' : '#e2e8f0' }}>
            <Box sx={{ width: 20, height: 14, bgcolor: isDark ? '#1a2035' : '#cbd5e1', borderRadius: 0.5 }} />
            <Box sx={{ width: 200 + Math.random() * 100, height: 14, bgcolor: isDark ? '#1a2035' : '#94a3b8', borderRadius: 0.5 }} />
            <Box sx={{ width: 80, height: 14, bgcolor: isDark ? '#1a2035' : '#cbd5e1', borderRadius: 0.5 }} />
            <Box sx={{ width: 60, height: 14, bgcolor: isDark ? '#1a2035' : '#cbd5e1', borderRadius: 0.5 }} />
            <Box sx={{ width: 100, height: 14, bgcolor: isDark ? '#1e2540' : '#94a3b8', borderRadius: 0.5 }} />
          </Box>
        ))}
      </Box>

      {/* "EHR" label overlay */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
            fontWeight: 600,
            letterSpacing: '0.1em',
            fontSize: '1rem',
          }}
        >
          ELECTRONIC HEALTH RECORD
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            display: 'block',
          }}
        >
          Patient chart view (simulated)
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Patient Roster Sidebar ───────────────────────────────────

interface PatientRosterProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  department: 'pharmacy' | 'nursing';
}

function PatientRoster({ patients, selectedPatientId, onSelectPatient, department }: PatientRosterProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Box
      sx={{
        width: 220,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: isDark ? customColors.dark.surface : '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', fontSize: '0.65rem' }}>
          {department === 'pharmacy' ? 'Medication Review Queue' : 'My Patients'}
        </Typography>
      </Box>
      <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {patients.map((patient) => (
          <ListItemButton
            key={patient.id}
            selected={selectedPatientId === patient.id}
            onClick={() => onSelectPatient(patient.id)}
            sx={{
              py: 1,
              '&.Mui-selected': {
                bgcolor: isDark ? `${customColors.accent.primary}15` : `${customColors.accent.primary}08`,
              },
            }}
          >
            <ListItemAvatar sx={{ minWidth: 36 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  patient.riskLevel === 'high' ? (
                    <Warning sx={{ fontSize: 12, color: customColors.health.red }} />
                  ) : null
                }
              >
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: isDark ? customColors.dark.card : '#e2e8f0', color: 'text.secondary' }}>
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={patient.name}
              secondary={patient.room}
              primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: selectedPatientId === patient.id ? 600 : 400 }}
              secondaryTypographyProps={{ fontSize: '0.65rem' }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

// ─── Inline AI Assistant ──────────────────────────────────────

interface InlineMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface InlineAIAssistantProps {
  department: 'pharmacy' | 'nursing';
}

function InlineAIAssistant({ department }: InlineAIAssistantProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<InlineMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = department === 'pharmacy'
    ? Object.keys(CLINICIAN_PHARMACY_MOCK_RESPONSES)
    : Object.keys(CLINICIAN_NURSING_MOCK_RESPONSES);

  const hasMessages = messages.length > 0;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const handleRestart = useCallback(() => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
    inputRef.current?.focus();
  }, []);

  const submitQuery = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMsg: InlineMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    // Simulate brief network delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const mockResponse = getMockChatResponse('clinician', query) ?? GENERIC_MOCK_FALLBACK;
    const assistantMsg: InlineMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: mockResponse.content,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
    scrollToBottom();
  }, [isLoading, scrollToBottom]);

  const handleQuickAction = (action: string) => {
    submitQuery(action);
  };

  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: hasMessages ? 320 : 'auto',
        bgcolor: isDark ? customColors.dark.surface : '#f8fafc',
      }}
    >
      {/* Chat header — visible when conversation is active */}
      {hasMessages && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
            {messages.filter(m => m.role === 'assistant').length} response{messages.filter(m => m.role === 'assistant').length !== 1 ? 's' : ''}
          </Typography>
          <Chip
            icon={<RestartAlt sx={{ fontSize: '14px !important' }} />}
            label="New chat"
            size="small"
            variant="outlined"
            onClick={handleRestart}
            sx={{
              fontSize: '0.65rem',
              height: 22,
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
            }}
          />
        </Box>
      )}

      {/* Messages area */}
      {hasMessages && (
        <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {messages.map(msg => (
            <Fade in key={msg.id}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: '85%',
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    bgcolor: msg.role === 'user'
                      ? customColors.brand.navy
                      : isDark ? customColors.dark.card : 'background.paper',
                    color: msg.role === 'user' ? '#fff' : 'text.primary',
                    fontSize: '0.8rem',
                    '& p': { margin: 0, mb: 0.5, '&:last-child': { mb: 0 } },
                    '& ul, & ol': { m: 0, pl: 2 },
                    '& li': { mb: 0.25 },
                    '& table': { fontSize: '0.75rem', borderCollapse: 'collapse', width: '100%', mt: 1, mb: 1 },
                    '& th, & td': { border: '1px solid', borderColor: 'divider', px: 1, py: 0.5, textAlign: 'left' },
                    '& th': { fontWeight: 600, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
                    '& strong': { fontWeight: 600 },
                  }}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </Paper>
              </Box>
            </Fade>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 0.5 }}>
              <CircularProgress size={12} sx={{ color: customColors.accent.cyan }} />
              <Typography variant="caption" color="text.secondary">Analyzing...</Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      )}

      {/* Quick action pills — shown when no messages, or as compact row during conversation */}
      <Box
        sx={{
          px: 1.5,
          pt: hasMessages ? 0.5 : 1,
          pb: hasMessages ? 0.5 : 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
        }}
      >
        {quickActions.map(action => (
          <Chip
            key={action}
            label={action}
            size="small"
            variant="outlined"
            onClick={() => handleQuickAction(action)}
            disabled={isLoading}
            sx={{
              fontSize: hasMessages ? '0.6rem' : '0.7rem',
              height: hasMessages ? 20 : undefined,
              borderRadius: 1.5,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
            }}
          />
        ))}
      </Box>

      {/* Input bar */}
      <Box
        component="form"
        onSubmit={(e: React.FormEvent) => { e.preventDefault(); submitQuery(input); }}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 1 }}
      >
        <AutoAwesome sx={{ fontSize: 16, color: customColors.accent.cyan, flexShrink: 0 }} />
        <TextField
          inputRef={inputRef}
          fullWidth
          size="small"
          placeholder={department === 'pharmacy' ? 'Ask about this patient...' : 'Ask about handoffs, patients...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) submitQuery(input);
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              fontSize: '0.8rem',
            },
            '& .MuiOutlinedInput-input': {
              py: 0.75,
            },
          }}
        />
        <IconButton
          type="submit"
          size="small"
          disabled={!input.trim() || isLoading}
          sx={{
            width: 28,
            height: 28,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          <Send sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

// ─── Main Clinician Panel ─────────────────────────────────────

export function ClinicianPanel({ department }: ClinicianPanelProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(PATIENTS[0].id);
  const selectedPatient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', mx: -3, mt: -3, mb: -3 }}>
      {/* Left: Blurred EHR background */}
      <EHRBackground />

      {/* Right: AI Assistance Panel */}
      <Box
        sx={{
          width: 680,
          minWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '2px solid',
          borderColor: 'primary.main',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        {/* Panel header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label="AI"
            size="small"
            sx={{
              bgcolor: `${customColors.accent.primary}15`,
              color: customColors.accent.primary,
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {department === 'pharmacy' ? 'Medication Safety Assistant' : 'Handoff Summary Generator'}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Chip
            icon={<FiberManualRecord sx={{ fontSize: '8px !important', color: `${customColors.health.green} !important` }} />}
            label="Active"
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: '0.65rem' }}
          />
        </Box>

        {/* Panel body: roster + content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Patient roster */}
          <PatientRoster
            patients={PATIENTS}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            department={department}
          />

          {/* Main content area + inline AI */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {department === 'pharmacy' ? (
                <PharmacyAlertQueue patient={selectedPatient} />
              ) : (
                <NursingHandoffView patient={selectedPatient} />
              )}
            </Box>
            {/* Inline AI Assistant */}
            <InlineAIAssistant department={department} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
