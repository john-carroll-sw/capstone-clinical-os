/**
 * FeedbackWidget — simplified text + screenshot form that posts to
 * /api/feedback (Vercel Serverless Function → GitHub Issues).
 */
import { useState, useRef, useCallback } from 'react';
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
  useTheme,
  Alert,
  type SxProps,
  type Theme,
} from '@mui/material';
import { Close, Send, PhotoCamera, Delete } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { usePersona } from '../../context/PersonaContext';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
export interface FeedbackWidgetProps {
  open: boolean;
  onClose: () => void;
  positionSx?: SxProps<Theme>;
}

/* ------------------------------------------------------------------ */
/*  State type for the 3-step flow: form → submitting → done           */
/* ------------------------------------------------------------------ */
type WidgetStep = 'form' | 'submitting' | 'success' | 'error';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function FeedbackWidget({ open, onClose, positionSx }: FeedbackWidgetProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { persona } = usePersona();
  const positionOverrides = Array.isArray(positionSx) ? positionSx : positionSx ? [positionSx] : [];

  const [step, setStep] = useState<WidgetStep>('form');
  const [text, setText] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [issueUrl, setIssueUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* --- Screenshot handling --- */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Cap at 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Screenshot must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setScreenshotPreview(result);
      setScreenshotBase64(result);
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, []);

  const removeScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotBase64(null);
  };

  /* --- Submit --- */
  const handleSubmit = async () => {
    if (!text.trim()) return;
    setStep('submitting');
    setErrorMsg('');

    const payload = {
      text: text.trim(),
      screenshot: screenshotBase64 || undefined,
      page: window.location.pathname,
      persona: persona ? `${persona.name} (${persona.department}, ${persona.role})` : 'unknown',
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setIssueUrl(data.issueUrl ?? null);
      setStep('success');
    } catch (err: unknown) {
      console.error('Feedback submit error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStep('error');
    }
  };

  /* --- Reset & close --- */
  const resetWidget = () => {
    setText('');
    setScreenshotPreview(null);
    setScreenshotBase64(null);
    setIssueUrl(null);
    setErrorMsg('');
    setStep('form');
  };

  const handleClose = () => {
    onClose();
    // Delay reset so the collapse animation finishes
    setTimeout(resetWidget, 300);
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <Collapse in={open}>
      <Paper
        elevation={8}
        sx={[
          {
            position: 'fixed',
            bottom: { xs: 88, sm: 92 },
            right: { xs: 16, sm: 24 },
            width: { xs: 'calc(100vw - 32px)', sm: 340 },
            maxWidth: 380,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            zIndex: (theme) => theme.zIndex.drawer + 4,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          },
          ...positionOverrides,
        ]}
      >
        {/* ---- Header ---- */}
        <Box
          sx={{
            bgcolor: isDark ? 'background.paper' : 'primary.main',
            color: isDark ? 'text.primary' : 'primary.contrastText',
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Share Feedback
          </Typography>
          <IconButton size="small" onClick={handleClose} sx={{ color: 'inherit' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* ---- Body ---- */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {step === 'form' && (
            <>
              <Typography variant="body2" color="text.secondary">
                What did you notice? Bug, idea, or general reaction — all helpful.
              </Typography>

              <TextField
                multiline
                minRows={3}
                maxRows={6}
                placeholder="Type your feedback here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.9rem',
                    borderRadius: 1,
                    bgcolor: isDark
                      ? alpha(theme.palette.common.white, 0.04)
                      : 'background.paper',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'text.secondary' },
                  },
                }}
              />

              {/* Screenshot preview */}
              {screenshotPreview && (
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: 1,
                    borderColor: 'divider',
                    maxHeight: 160,
                  }}
                >
                  <Box
                    component="img"
                    src={screenshotPreview}
                    alt="Screenshot preview"
                    sx={{
                      width: '100%',
                      maxHeight: 160,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={removeScreenshot}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Action row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileSelect}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ textTransform: 'none', borderRadius: 1, flexShrink: 0 }}
                >
                  {screenshotPreview ? 'Replace' : 'Screenshot'}
                </Button>

                <Box sx={{ flex: 1 }} />

                <Button
                  size="small"
                  variant="contained"
                  endIcon={<Send />}
                  disabled={!text.trim()}
                  onClick={handleSubmit}
                  sx={{ textTransform: 'none', borderRadius: 1 }}
                >
                  Submit
                </Button>
              </Box>

              {errorMsg && (
                <Alert severity="warning" sx={{ fontSize: '0.8rem', py: 0 }}>
                  {errorMsg}
                </Alert>
              )}
            </>
          )}

          {step === 'submitting' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                py: 3,
              }}
            >
              <CircularProgress size={28} />
              <Typography variant="body2" color="text.secondary">
                Submitting feedback...
              </Typography>
            </Box>
          )}

          {step === 'success' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                py: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Thanks! Feedback submitted.
              </Typography>
              {issueUrl && (
                <Chip
                  label="View on GitHub"
                  component="a"
                  href={issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Button size="small" onClick={handleClose} sx={{ textTransform: 'none' }}>
                Close
              </Button>
            </Box>
          )}

          {step === 'error' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                py: 2,
              }}
            >
              <Alert severity="error" sx={{ width: '100%', fontSize: '0.8rem' }}>
                {errorMsg || 'Could not submit feedback.'}
              </Alert>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setStep('form')}
                  sx={{ textTransform: 'none' }}
                >
                  Try again
                </Button>
                <Button
                  size="small"
                  onClick={handleClose}
                  sx={{ textTransform: 'none' }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Collapse>
  );
}
