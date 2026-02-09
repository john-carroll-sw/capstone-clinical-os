/**
 * Shared Clinician Components
 * 
 * Reusable pieces for both Pharmacy and Nursing clinician views:
 * - PatientHeader: patient context bar at the top
 * - ConfidenceIndicator: AI confidence level badge
 * - ConfirmEditReject: human-in-the-loop action buttons
 * - AuditFooter: traceability footer on every AI output
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Edit,
  Cancel,
  Warning,
  Shield,
  AccessTime,
  LocalHospital,
  FiberManualRecord,
} from '@mui/icons-material';
import { customColors } from '../../theme/muiTheme';
import type { Patient } from '../../data/healthcare/patients';

// ─── Patient Header ───────────────────────────────────────────

interface PatientHeaderProps {
  patient: Patient;
  workflow: string;
  compact?: boolean;
}

export function PatientHeader({ patient, workflow, compact = false }: PatientHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: compact ? 1 : 1.5,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? customColors.dark.elevated : '#f1f5f9',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Avatar
        sx={{
          width: compact ? 36 : 44,
          height: compact ? 36 : 44,
          bgcolor: patient.riskLevel === 'high'
            ? `${customColors.health.red}20`
            : patient.riskLevel === 'moderate'
            ? `${customColors.health.amber}20`
            : `${customColors.health.green}20`,
          color: patient.riskLevel === 'high'
            ? customColors.health.red
            : patient.riskLevel === 'moderate'
            ? customColors.health.amber
            : customColors.health.green,
        }}
      >
        <Person />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant={compact ? 'body2' : 'subtitle1'} sx={{ fontWeight: 600 }}>
            {patient.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {patient.mrn}
          </Typography>
          <Chip
            label={`${patient.age}${patient.sex} · ${patient.room}`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: '0.7rem' }}
          />
          {patient.riskLevel === 'high' && (
            <Chip
              icon={<Warning sx={{ fontSize: '0.8rem !important' }} />}
              label="High Risk"
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        {!compact && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {patient.primaryDiagnosis}
            {patient.allergies.length > 0 && (
              <Box component="span" sx={{ color: customColors.health.red, ml: 1 }}>
                Allergies: {patient.allergies.join(', ')}
              </Box>
            )}
          </Typography>
        )}
      </Box>

      <Chip
        icon={<LocalHospital sx={{ fontSize: '0.9rem !important' }} />}
        label={workflow}
        size="small"
        sx={{
          bgcolor: (theme) => theme.palette.mode === 'dark' ? customColors.dark.card : '#e2e8f0',
          fontWeight: 500,
          fontSize: '0.7rem',
        }}
      />
    </Box>
  );
}

// ─── Confidence Indicator ─────────────────────────────────────

interface ConfidenceIndicatorProps {
  level: 'high' | 'medium' | 'low';
  compact?: boolean;
}

export function ConfidenceIndicator({ level, compact = false }: ConfidenceIndicatorProps) {
  const config = {
    high: { color: customColors.health.green, label: 'High Confidence', icon: '●' },
    medium: { color: customColors.health.amber, label: 'Medium Confidence', icon: '●' },
    low: { color: customColors.health.red, label: 'Low Confidence', icon: '●' },
  }[level];

  if (compact) {
    return (
      <Tooltip title={config.label}>
        <FiberManualRecord sx={{ fontSize: 10, color: config.color }} />
      </Tooltip>
    );
  }

  return (
    <Chip
      icon={<FiberManualRecord sx={{ fontSize: '10px !important', color: `${config.color} !important` }} />}
      label={config.label}
      size="small"
      variant="outlined"
      sx={{
        borderColor: `${config.color}40`,
        color: config.color,
        fontSize: '0.7rem',
        height: 24,
        '& .MuiChip-icon': { ml: 0.5 },
      }}
    />
  );
}

// ─── Confirm / Edit / Reject Buttons ──────────────────────────

interface ConfirmEditRejectProps {
  onConfirm: () => void;
  onEdit: (note: string) => void;
  onReject: (reason: string) => void;
  status: 'pending' | 'confirmed' | 'edited' | 'rejected' | 'overridden';
  compact?: boolean;
}

export function ConfirmEditReject({ onConfirm, onEdit, onReject, status, compact = false }: ConfirmEditRejectProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  if (status !== 'pending') {
    const statusConfig = {
      confirmed: { label: 'Confirmed', color: customColors.health.green, icon: <CheckCircle sx={{ fontSize: 16 }} /> },
      edited: { label: 'Edited', color: customColors.health.amber, icon: <Edit sx={{ fontSize: 16 }} /> },
      rejected: { label: 'Rejected', color: customColors.health.red, icon: <Cancel sx={{ fontSize: 16 }} /> },
      overridden: { label: 'Overridden', color: customColors.health.red, icon: <Warning sx={{ fontSize: 16 }} /> },
    }[status];

    return (
      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        size="small"
        sx={{
          bgcolor: `${statusConfig.color}15`,
          color: statusConfig.color,
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      />
    );
  }

  return (
    <>
      <ButtonGroup size={compact ? 'small' : 'medium'} variant="outlined">
        <Button
          startIcon={<CheckCircle />}
          onClick={onConfirm}
          sx={{
            color: customColors.health.green,
            borderColor: `${customColors.health.green}50`,
            '&:hover': { bgcolor: `${customColors.health.green}10`, borderColor: customColors.health.green },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Confirm
        </Button>
        <Button
          startIcon={<Edit />}
          onClick={() => setEditOpen(true)}
          sx={{
            color: customColors.health.amber,
            borderColor: `${customColors.health.amber}50`,
            '&:hover': { bgcolor: `${customColors.health.amber}10`, borderColor: customColors.health.amber },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Edit
        </Button>
        <Button
          startIcon={<Cancel />}
          onClick={() => setRejectOpen(true)}
          sx={{
            color: customColors.health.red,
            borderColor: `${customColors.health.red}50`,
            '&:hover': { bgcolor: `${customColors.health.red}10`, borderColor: customColors.health.red },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Reject
        </Button>
      </ButtonGroup>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit AI Recommendation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Add your clinical judgment or corrections:
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            placeholder="Enter your clinical notes or edits..."
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => { onEdit(editNote); setEditOpen(false); setEditNote(''); }}
            disabled={!editNote.trim()}
          >
            Save Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject AI Recommendation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Please provide a reason for rejection (required for audit):
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            placeholder="Clinical rationale for override..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => { onReject(rejectReason); setRejectOpen(false); setRejectReason(''); }}
            disabled={!rejectReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Audit Footer ─────────────────────────────────────────────

interface AuditFooterProps {
  timestamp: string;
  modelVersion?: string;
  policyId?: string;
}

export function AuditFooter({ timestamp, modelVersion = 'GPT-4o v2.1', policyId }: AuditFooterProps) {
  const time = new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        pt: 1,
        mt: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AccessTime sx={{ fontSize: 12, color: 'text.disabled' }} />
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
          {time}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
          Model: {modelVersion}
        </Typography>
      </Box>
      {policyId && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Shield sx={{ fontSize: 12, color: 'text.disabled' }} />
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
            Policy: {policyId}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
