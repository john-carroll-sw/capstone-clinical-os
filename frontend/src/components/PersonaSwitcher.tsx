/**
 * PersonaSwitcher — the demo superpower
 * 
 * Compact component that lets evaluators quickly switch between
 * department + role combos to see the product from every angle.
 * 
 * Can be placed in the sidebar, settings page, or as a floating toolbar.
 */

import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Chip,
  Paper,
} from '@mui/material';
import {
  LocalPharmacy,
  MedicalServices,
  Person,
  AdminPanelSettings,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { usePersona } from '../context/PersonaContext';
import type { Department, Role } from '../data/healthcare/personas';

interface PersonaSwitcherProps {
  /** Compact mode for sidebar placement */
  compact?: boolean;
}

export function PersonaSwitcher({ compact = false }: PersonaSwitcherProps) {
  const { persona, department, role, setDepartmentAndRole } = usePersona();

  const handleDepartment = (_: React.MouseEvent<HTMLElement>, newDept: Department | null) => {
    if (newDept) {
      setDepartmentAndRole(newDept, role);
    }
  };

  const handleRole = (_: React.MouseEvent<HTMLElement>, newRole: Role | null) => {
    if (newRole) {
      setDepartmentAndRole(department, newRole);
    }
  };

  if (compact) {
    return (
      <Box sx={{ px: 1, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: '0.75rem',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            {persona.avatar}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
              {persona.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              {persona.title}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={department === 'pharmacy' ? '💊 Pharm' : '🩺 Nursing'}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.65rem', height: 22 }}
          />
          <Chip
            label={role === 'clinician' ? 'Clinician' : role === 'ops_leader' ? 'Ops Leader' : 'Governance'}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ fontSize: '0.65rem', height: 22 }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
        Persona Switcher
      </Typography>

      {/* Department Toggle */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 500 }}>
          Department
        </Typography>
        <ToggleButtonGroup
          value={department}
          exclusive
          onChange={handleDepartment}
          size="small"
          fullWidth
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', py: 0.75, fontSize: '0.8rem' } }}
        >
          <ToggleButton value="pharmacy">
            <LocalPharmacy sx={{ mr: 0.75, fontSize: '1rem' }} />
            Pharmacy
          </ToggleButton>
          <ToggleButton value="nursing">
            <MedicalServices sx={{ mr: 0.75, fontSize: '1rem' }} />
            Nursing
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Role Toggle */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 500 }}>
          Role
        </Typography>
        <ToggleButtonGroup
          value={role}
          exclusive
          onChange={handleRole}
          size="small"
          fullWidth
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', py: 0.75, fontSize: '0.8rem' } }}
        >
          <ToggleButton value="clinician">
            <Person sx={{ mr: 0.5, fontSize: '1rem' }} />
            Clinician
          </ToggleButton>
          <ToggleButton value="ops_leader">
            <DashboardIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Ops Leader
          </ToggleButton>
          <ToggleButton value="governance">
            <AdminPanelSettings sx={{ mr: 0.5, fontSize: '1rem' }} />
            Governance
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Current Persona Display */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'action.hover',
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600,
          }}
        >
          {persona.avatar}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {persona.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {persona.title}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mt: 0.25, fontSize: '0.7rem', fontStyle: 'italic' }}>
            {persona.description.substring(0, 60)}…
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
