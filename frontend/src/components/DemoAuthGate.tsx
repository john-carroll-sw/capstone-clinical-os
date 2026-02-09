/**
 * DemoAuthGate — simple password screen for the deployed demo
 *
 * Wraps the entire app. If VITE_DEMO_PASS is set, visitors must
 * enter the password before seeing anything. Auth state is stored
 * in sessionStorage so it persists across page refreshes but
 * clears when the browser tab is closed.
 *
 * When VITE_DEMO_PASS is not set (local dev), the gate is invisible.
 */

import { useState, type ReactNode, type FormEvent } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import { Lock } from '@mui/icons-material';

const DEMO_PASS = import.meta.env.VITE_DEMO_PASS as string | undefined;
const SESSION_KEY = 'clinicalos_demo_auth';

function isAuthenticated(): boolean {
  if (!DEMO_PASS) return true; // no password configured — skip gate
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function DemoAuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  // No password configured — render children immediately
  if (!DEMO_PASS) return <>{children}</>;

  // Already authenticated this session
  if (authed) return <>{children}</>;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input === DEMO_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#003087',
        background: 'linear-gradient(135deg, #003087 0%, #001a4d 100%)',
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#003087',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Lock sx={{ color: '#fff', fontSize: 28 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#003087' }}>
          ClinicalOS
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Enter the demo password to continue
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
            Incorrect password. Try again.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="password"
            placeholder="Password"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={!input.trim()}
            sx={{
              bgcolor: '#003087',
              fontWeight: 600,
              py: 1.25,
              '&:hover': { bgcolor: '#001a4d' },
            }}
          >
            Enter Demo
          </Button>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 3, color: 'text.disabled' }}>
          Clinical AI Governance & Decision Support
        </Typography>
      </Paper>
    </Box>
  );
}
