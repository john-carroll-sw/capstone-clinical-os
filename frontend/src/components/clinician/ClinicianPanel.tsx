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

import { useState } from 'react';
import { Box, Typography, Chip, List, ListItemButton, ListItemText, ListItemAvatar, Avatar, Divider, Badge } from '@mui/material';
import { Person, Warning, FiberManualRecord } from '@mui/icons-material';
import { customColors } from '../../theme/muiTheme';
import { useTheme } from '../../context/ThemeContext';
import { PATIENTS, type Patient } from '../../data/healthcare/patients';
import { PharmacyAlertQueue } from './PharmacyAlertQueue';
import { NursingHandoffView } from './NursingHandoffView';

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

          {/* Main content area */}
          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {department === 'pharmacy' ? (
              <PharmacyAlertQueue patient={selectedPatient} />
            ) : (
              <NursingHandoffView patient={selectedPatient} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
