/**
 * Demo Index Page — the front door to ClinicalOS
 * 
 * Shows three surface cards that communicate the core thesis:
 * "One platform, three surfaces for three personas."
 * 
 * Each card links into its respective surface:
 * - Clinician Panel → /clinician
 * - Leadership Dashboard → /leadership
 * - Governance Control Plane → /governance
 */

import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import {
  LocalHospital,
  Dashboard,
  Shield,
  ArrowForward,
} from '@mui/icons-material';
import { customColors } from '../../theme/muiTheme';
import { useTheme } from '../../context/ThemeContext';
import { usePersona } from '../../context/PersonaContext';

interface SurfaceCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  /** Persona ID to activate when entering this surface */
  defaultPersonaId: string;
  personas: string[];
  accentColor: string;
  tag: string;
}

const SURFACES: SurfaceCard[] = [
  {
    id: 'clinician',
    title: 'Clinician Panel',
    subtitle: 'Embedded in the EHR',
    description: 'AI assistance surfaces inline — clinicians never open a new app. Review alerts, generate handoff summaries, confirm or reject every AI output.',
    icon: <LocalHospital sx={{ fontSize: 32 }} />,
    defaultPersonaId: 'dr-patel',
    personas: ['Dr. Patel — Pharmacist', 'Sarah, RN — Nurse'],
    accentColor: customColors.health.green,
    tag: 'Use',
  },
  {
    id: 'leadership',
    title: 'Leadership Dashboard',
    subtitle: 'Outcomes at a glance',
    description: 'See whether AI is helping or hurting. Time saved, alert signal-to-noise, adoption rates, and safety events — all in one read-only view.',
    icon: <Dashboard sx={{ fontSize: 32 }} />,
    defaultPersonaId: 'vp-chen',
    personas: ['VP Chen — Clinical Operations'],
    accentColor: customColors.accent.primary,
    tag: 'Measure',
  },
  {
    id: 'governance',
    title: 'Governance Control Plane',
    subtitle: 'Approve, configure, audit',
    description: 'Every AI use case is approved before deployment. Configure guardrails, manage access, and review full audit logs of every AI interaction.',
    icon: <Shield sx={{ fontSize: 32 }} />,
    defaultPersonaId: 'ciso-martinez',
    personas: ['CISO Martinez — IT/Compliance'],
    accentColor: customColors.accent.purple,
    tag: 'Govern',
  },
];

export function DemoIndexPage() {
  const { setPersonaById } = usePersona();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 6,
        bgcolor: isDark ? customColors.dark.void : '#f8fafc',
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 640 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${customColors.accent.primary}, ${customColors.accent.emerald})`,
              fontWeight: 700,
              fontSize: '1.3rem',
            }}
          >
            C
          </Avatar>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            ClinicalOS
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            fontWeight: 400,
            mb: 1,
          }}
        >
          Clinical AI Governance & Decision Support
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: 480,
            mx: 'auto',
            lineHeight: 1.7,
          }}
        >
          One platform, three purpose-built surfaces. Each persona sees exactly what they need — nothing more.
        </Typography>
      </Box>

      {/* Journey flow indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        {['Govern', 'Embed', 'Measure'].map((step, i) => (
          <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={step}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor: isDark ? customColors.dark.elevated : 'white',
                border: `1px solid`,
                borderColor: 'divider',
              }}
            />
            {i < 2 && (
              <ArrowForward sx={{ fontSize: 14, color: 'text.disabled' }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Surface Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          maxWidth: 1100,
          width: '100%',
        }}
      >
        {SURFACES.map((surface) => (
          <Card
            key={surface.id}
            elevation={isDark ? 0 : 2}
            sx={{
              borderRadius: 3,
              border: `1px solid`,
              borderColor: isDark ? customColors.dark.hover : 'divider',
              bgcolor: isDark ? customColors.dark.surface : '#fff',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDark
                  ? `0 8px 32px rgba(0,0,0,0.4)`
                  : `0 8px 32px rgba(0,0,0,0.12)`,
                borderColor: surface.accentColor,
              },
            }}
          >
            <CardActionArea
              onClick={() => setPersonaById(surface.defaultPersonaId)}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Tag + Icon */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    label={surface.tag}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      letterSpacing: '0.05em',
                      bgcolor: `${surface.accentColor}15`,
                      color: surface.accentColor,
                      border: `1px solid ${surface.accentColor}30`,
                    }}
                  />
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: `${surface.accentColor}12`,
                      color: surface.accentColor,
                    }}
                  >
                    {surface.icon}
                  </Avatar>
                </Box>

                {/* Title */}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 0.5,
                    fontSize: '1.25rem',
                  }}
                >
                  {surface.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: surface.accentColor,
                    fontWeight: 500,
                    mb: 1.5,
                  }}
                >
                  {surface.subtitle}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    mb: 2,
                    flex: 1,
                  }}
                >
                  {surface.description}
                </Typography>

                {/* Personas */}
                <Stack spacing={0.5}>
                  {surface.personas.map((p) => (
                    <Typography
                      key={p}
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: surface.accentColor,
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      {p}
                    </Typography>
                  ))}
                </Stack>

                {/* Enter CTA */}
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: surface.accentColor }}
                  >
                    Enter {surface.title.split(' ')[0]}
                  </Typography>
                  <ArrowForward sx={{ fontSize: 18, color: surface.accentColor }} />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Use the persona switcher inside any surface to change department and role
        </Typography>
      </Box>
    </Box>
  );
}
