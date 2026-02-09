/**
 * Pharmacy Alert Queue — Dr. Patel's view
 * 
 * Shows AI-triaged medication alerts for a selected patient.
 * High-priority alerts get full AI summaries and require action.
 * Low-priority alerts are suppressed by default.
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Collapse,
  Button,
  Divider,
  Link,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Warning,
  Info,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { customColors } from '../../theme/muiTheme';
import { PatientHeader, ConfidenceIndicator, ConfirmEditReject, AuditFooter } from './ClinicianComponents';
import { getAlertsForPatient, getAlertStats, type PharmacyAlert, type AlertStatus } from '../../data/healthcare/pharmacyAlerts';
import type { Patient } from '../../data/healthcare/patients';

// ─── Alert Card ───────────────────────────────────────────────

interface AlertCardProps {
  alert: PharmacyAlert;
  onStatusChange: (alertId: string, status: AlertStatus, note?: string) => void;
}

function AlertCard({ alert, onStatusChange }: AlertCardProps) {
  const [expanded, setExpanded] = useState(alert.severity === 'high');

  const severityConfig = {
    high: { color: customColors.health.red, label: 'HIGH', icon: <Warning sx={{ fontSize: 16 }} /> },
    medium: { color: customColors.health.amber, label: 'MED', icon: <Info sx={{ fontSize: 16 }} /> },
    low: { color: '#64748b', label: 'LOW', icon: <Info sx={{ fontSize: 16 }} /> },
  }[alert.severity];

  const typeLabels: Record<string, string> = {
    'drug-interaction': 'Drug Interaction',
    'renal-dose': 'Renal Dosing',
    'allergy': 'Allergy Alert',
    'duplicate-therapy': 'Duplicate Therapy',
    'dose-range': 'Dose Range',
    'formulary': 'Formulary',
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: alert.status !== 'pending' ? 'divider' : `${severityConfig.color}30`,
        borderLeft: `3px solid ${severityConfig.color}`,
        borderRadius: 1.5,
        opacity: alert.status !== 'pending' ? 0.7 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Alert header */}
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, cursor: 'pointer' }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={severityConfig.label}
                size="small"
                sx={{
                  bgcolor: `${severityConfig.color}15`,
                  color: severityConfig.color,
                  fontWeight: 700,
                  fontSize: '0.6rem',
                  height: 20,
                  letterSpacing: '0.05em',
                }}
              />
              <Chip
                label={typeLabels[alert.type] || alert.type}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
              <ConfidenceIndicator level={alert.confidence} compact />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {alert.title}
            </Typography>
          </Box>
          {expanded ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />}
        </Box>

        {/* Expanded content */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 1.5 }}>
            {/* AI Summary */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? customColors.dark.elevated : '#f8fafc',
                borderRadius: 1,
                mb: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Clinical Summary
                </Typography>
                <ConfidenceIndicator level={alert.confidence} />
              </Box>
              <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.8rem' }}>
                {alert.aiSummary}
              </Typography>
            </Box>

            {/* Medications */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
                MEDICATIONS INVOLVED
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {alert.medications.map((med, i) => (
                  <Chip key={i} label={med} size="small" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                ))}
              </Box>
            </Box>

            {/* Chart References */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
                CHART REFERENCES
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
                {alert.chartReferences.map((ref, i) => (
                  <Link key={i} component="button" variant="caption" sx={{ textAlign: 'left', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}>
                    {ref}
                  </Link>
                ))}
              </Box>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <ConfirmEditReject
                status={alert.status}
                compact
                onConfirm={() => onStatusChange(alert.id, 'confirmed')}
                onEdit={(note) => onStatusChange(alert.id, 'edited', note)}
                onReject={(reason) => onStatusChange(alert.id, 'rejected', reason)}
              />
            </Box>

            {/* Audit footer */}
            <AuditFooter
              timestamp={alert.timestamp}
              policyId={alert.severity === 'high' ? 'PHARM-SAFETY-001' : undefined}
            />
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

// ─── Main Pharmacy Alert Queue ────────────────────────────────

interface PharmacyAlertQueueProps {
  patient: Patient;
}

export function PharmacyAlertQueue({ patient }: PharmacyAlertQueueProps) {
  const [alertStatuses, setAlertStatuses] = useState<Record<string, AlertStatus>>({});
  const [showSuppressed, setShowSuppressed] = useState(false);

  const patientAlerts = getAlertsForPatient(patient.id);
  const allStats = getAlertStats();

  // Apply local status overrides
  const alertsWithStatus = patientAlerts.map(a => ({
    ...a,
    status: alertStatuses[a.id] || a.status,
  }));

  const highAlerts = alertsWithStatus.filter(a => a.severity === 'high');
  const mediumAlerts = alertsWithStatus.filter(a => a.severity === 'medium');
  const lowAlerts = alertsWithStatus.filter(a => a.severity === 'low');

  const handleStatusChange = (alertId: string, status: AlertStatus) => {
    setAlertStatuses(prev => ({ ...prev, [alertId]: status }));
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Patient header */}
      <PatientHeader patient={patient} workflow="Medication Review" />

      {/* Summary banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 1.5,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? customColors.dark.elevated : '#fef3c7',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? customColors.dark.hover : '#fcd34d',
        }}
      >
        <Warning sx={{ color: customColors.health.amber }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {highAlerts.length + mediumAlerts.length} alert{highAlerts.length + mediumAlerts.length !== 1 ? 's' : ''} need review
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {highAlerts.length} high-priority · {mediumAlerts.length} medium · {lowAlerts.length} AI-suppressed
          </Typography>
        </Box>
        <Chip label={`${patient.activeMeds} active meds`} size="small" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
      </Box>

      {/* High priority alerts */}
      {highAlerts.length > 0 && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: customColors.health.red, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem', mb: 1, display: 'block' }}>
            High Priority — Requires Action
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {highAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onStatusChange={handleStatusChange} />
            ))}
          </Box>
        </Box>
      )}

      {/* Medium priority alerts */}
      {mediumAlerts.length > 0 && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: customColors.health.amber, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem', mb: 1, display: 'block' }}>
            Medium Priority — Review Recommended
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {mediumAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onStatusChange={handleStatusChange} />
            ))}
          </Box>
        </Box>
      )}

      {/* Suppressed alerts */}
      {lowAlerts.length > 0 && (
        <Box>
          <Button
            size="small"
            onClick={() => setShowSuppressed(!showSuppressed)}
            endIcon={showSuppressed ? <ExpandLess /> : <ExpandMore />}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 500, fontSize: '0.8rem' }}
          >
            {lowAlerts.length} low-priority alerts (AI-suppressed)
          </Button>
          <Collapse in={showSuppressed}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {lowAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} onStatusChange={handleStatusChange} />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Empty state */}
      {patientAlerts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="body2">No active alerts for this patient</Typography>
          <Typography variant="caption">AI has reviewed all medication orders — no interactions detected.</Typography>
        </Box>
      )}
    </Box>
  );
}
