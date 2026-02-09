/**
 * Nursing Handoff View — Sarah, RN's view
 * 
 * AI-generated SBAR shift handoff summaries.
 * Nurse reviews, edits any section, then signs off.
 * Receiving nurse gets the finalized document.
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit,
  Save,
  Close,
  CheckCircle,
  AccessTime,
  Warning,
  FiberManualRecord,
  Assignment,
  TrendingUp,
  Task,
} from '@mui/icons-material';
import { customColors } from '../../theme/muiTheme';
import { PatientHeader, ConfidenceIndicator, AuditFooter } from './ClinicianComponents';
import { getHandoffForPatient, type NursingHandoff, type SBARSection } from '../../data/healthcare/nursingHandoffs';
import type { Patient } from '../../data/healthcare/patients';

// ─── SBAR Section Card ────────────────────────────────────────

interface SBARCardProps {
  section: SBARSection;
  onEdit: (content: string) => void;
}

function SBARCard({ section, onEdit }: SBARCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(section.content);

  const sbarColors: Record<string, string> = {
    Situation: customColors.health.red,
    Background: customColors.accent.primary,
    Assessment: customColors.health.amber,
    Recommendation: customColors.health.green,
  };

  const sbarIcons: Record<string, string> = {
    Situation: 'S',
    Background: 'B',
    Assessment: 'A',
    Recommendation: 'R',
  };

  const color = sbarColors[section.label] || customColors.accent.primary;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `3px solid ${color}`,
        borderRadius: 1.5,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label={sbarIcons[section.label]}
            size="small"
            sx={{
              bgcolor: `${color}15`,
              color: color,
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 24,
              width: 24,
              '& .MuiChip-label': { px: 0 },
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
            {section.label}
          </Typography>
          {!editing ? (
            <Tooltip title="Edit this section">
              <IconButton size="small" onClick={() => setEditing(true)}>
                <Edit sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Save edits">
                <IconButton size="small" color="primary" onClick={() => { onEdit(editContent); setEditing(false); }}>
                  <Save sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton size="small" onClick={() => { setEditContent(section.content); setEditing(false); }}>
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {editing ? (
          <TextField
            multiline
            fullWidth
            minRows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem', lineHeight: 1.6 } }}
          />
        ) : (
          <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.8rem', color: 'text.secondary' }}>
            {section.content}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Nursing Handoff View ────────────────────────────────

interface NursingHandoffViewProps {
  patient: Patient;
}

export function NursingHandoffView({ patient }: NursingHandoffViewProps) {
  const handoff = getHandoffForPatient(patient.id);
  const [sbarContent, setSbarContent] = useState<Record<string, string>>({});
  const [signed, setSigned] = useState(false);
  const [signDialogOpen, setSignDialogOpen] = useState(false);

  if (!handoff) {
    return (
      <Box sx={{ p: 2 }}>
        <PatientHeader patient={patient} workflow="Shift Handoff" />
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Assignment sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
          <Typography variant="body1" sx={{ mb: 0.5 }}>No handoff generated yet</Typography>
          <Typography variant="body2">Click "Generate Handoff" to create an AI-assisted SBAR summary for this patient.</Typography>
          <Button variant="contained" sx={{ mt: 2, textTransform: 'none' }} disabled>
            Generate Handoff (demo)
          </Button>
        </Box>
      </Box>
    );
  }

  const handleSbarEdit = (label: string, content: string) => {
    setSbarContent(prev => ({ ...prev, [label]: content }));
  };

  const currentSbar = handoff.sbar.map(s => ({
    ...s,
    content: sbarContent[s.label] || s.content,
  }));

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Patient header */}
      <PatientHeader patient={patient} workflow="Shift Handoff" />

      {/* Handoff meta */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          icon={<AccessTime sx={{ fontSize: '0.9rem !important' }} />}
          label={`${handoff.shiftType.replace(/-/g, ' → ')} shift`}
          size="small"
          variant="outlined"
          sx={{ height: 26, fontSize: '0.7rem' }}
        />
        <Chip
          label={`Outgoing: ${handoff.outgoingNurse}`}
          size="small"
          variant="outlined"
          sx={{ height: 26, fontSize: '0.7rem' }}
        />
        <ConfidenceIndicator level={handoff.confidence} />
        {signed && (
          <Chip
            icon={<CheckCircle sx={{ fontSize: '0.9rem !important' }} />}
            label="Signed"
            size="small"
            color="success"
            sx={{ height: 26, fontSize: '0.7rem', fontWeight: 600 }}
          />
        )}
      </Box>

      {/* SBAR Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {currentSbar.map((section) => (
          <SBARCard
            key={section.label}
            section={section}
            onEdit={(content) => handleSbarEdit(section.label, content)}
          />
        ))}
      </Box>

      {/* Change Highlights */}
      {handoff.changeHighlights.length > 0 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUp sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Changes — Last 12 Hours
              </Typography>
            </Box>
            <List dense disablePadding>
              {handoff.changeHighlights.map((change, i) => (
                <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <FiberManualRecord
                      sx={{
                        fontSize: 8,
                        color: change.significance === 'critical'
                          ? customColors.health.red
                          : change.significance === 'notable'
                          ? customColors.health.amber
                          : 'text.disabled',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5, fontSize: '0.7rem' }}>
                          {change.time}
                        </Box>
                        {change.description}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks */}
      {handoff.pendingTasks.length > 0 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Task sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Pending Tasks
              </Typography>
            </Box>
            <List dense disablePadding>
              {handoff.pendingTasks.map((task) => (
                <ListItem key={task.id} disablePadding sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Chip
                      label={task.priority === 'urgent' ? '!' : '○'}
                      size="small"
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: '0.6rem',
                        bgcolor: task.priority === 'urgent' ? `${customColors.health.red}15` : 'transparent',
                        color: task.priority === 'urgent' ? customColors.health.red : 'text.disabled',
                        border: task.priority === 'urgent' ? `1px solid ${customColors.health.red}40` : '1px solid transparent',
                        '& .MuiChip-label': { px: 0 },
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                        {task.description}
                        {task.dueTime && (
                          <Box component="span" sx={{ color: 'text.disabled', ml: 0.5, fontSize: '0.7rem' }}>
                            (due {task.dueTime})
                          </Box>
                        )}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Escalation Flags */}
      {handoff.escalationFlags.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? `${customColors.health.red}10` : '#fef2f2',
            borderRadius: 1.5,
            border: `1px solid ${customColors.health.red}30`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Warning sx={{ fontSize: 16, color: customColors.health.red }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: customColors.health.red, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Escalation Flags
            </Typography>
          </Box>
          {handoff.escalationFlags.map((flag, i) => (
            <Typography key={i} variant="body2" sx={{ fontSize: '0.8rem', color: customColors.health.red }}>
              {flag}
            </Typography>
          ))}
        </Box>
      )}

      {/* Sign-off button */}
      {!signed ? (
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => setSignDialogOpen(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
            bgcolor: customColors.health.green,
            '&:hover': { bgcolor: customColors.health.greenLight },
          }}
        >
          Review Complete — Sign Off Handoff
        </Button>
      ) : (
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Chip
            icon={<CheckCircle />}
            label="Handoff signed and sent to receiving nurse"
            color="success"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}

      {/* Audit footer */}
      <AuditFooter
        timestamp={handoff.generatedAt}
        policyId="NURS-HANDOFF-001"
      />

      {/* Sign-off confirmation dialog */}
      <Dialog open={signDialogOpen} onClose={() => setSignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Sign Off Handoff</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            By signing off, you confirm that you have reviewed the AI-generated summary, made any necessary edits, and approve this handoff document for the incoming nurse.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
            Patient: {patient.name} ({patient.mrn})
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Signed by: {handoff.outgoingNurse}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => { setSigned(true); setSignDialogOpen(false); }}
          >
            Sign & Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
