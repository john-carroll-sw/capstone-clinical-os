/**
 * RBAC Configuration — Read-only view of role-based access rules
 * 
 * Shows who can use which AI workflows, by role and department.
 * Governance persona can view; editing is simulated.
 */

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Security,
  Person,
  LocalHospital,
  Shield,
  AdminPanelSettings,
  VerifiedUser,
  Visibility,
  Edit,
  Block,
  Flag,
} from '@mui/icons-material';
import { RBAC_RULES, type RBACRule } from '../../data/healthcare/governanceRegistry';
import { USE_CASES } from '../../data/healthcare/useCases';
import { customColors } from '../../theme/muiTheme';

const PERMISSION_CONFIG: Record<string, { label: string; color: 'success' | 'info' | 'warning' | 'default'; icon: React.ReactNode }> = {
  'use': { label: 'Use AI Tools', color: 'success', icon: <VerifiedUser sx={{ fontSize: 14 }} /> },
  'view': { label: 'View Only', color: 'default', icon: <Visibility sx={{ fontSize: 14 }} /> },
  'view-audit': { label: 'View Audit', color: 'info', icon: <Visibility sx={{ fontSize: 14 }} /> },
  'view-dashboard': { label: 'View Dashboard', color: 'info', icon: <Visibility sx={{ fontSize: 14 }} /> },
  'override': { label: 'Override AI', color: 'warning', icon: <Edit sx={{ fontSize: 14 }} /> },
  'approve': { label: 'Approve', color: 'success', icon: <VerifiedUser sx={{ fontSize: 14 }} /> },
  'suspend': { label: 'Suspend', color: 'warning', icon: <Block sx={{ fontSize: 14 }} /> },
  'configure': { label: 'Configure', color: 'warning', icon: <AdminPanelSettings sx={{ fontSize: 14 }} /> },
  'request-use-case': { label: 'Request Use Case', color: 'info', icon: <Flag sx={{ fontSize: 14 }} /> },
  'manage-allowlists': { label: 'Manage Allowlists', color: 'warning', icon: <AdminPanelSettings sx={{ fontSize: 14 }} /> },
  'manage-rbac': { label: 'Manage RBAC', color: 'warning', icon: <Security sx={{ fontSize: 14 }} /> },
  'flag-incident': { label: 'Flag Incidents', color: 'warning', icon: <Flag sx={{ fontSize: 14 }} /> },
};

function getUseCaseName(id: string): string {
  const uc = USE_CASES.find(u => u.id === id);
  return uc?.name || id;
}

export function RBACConfig() {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Security sx={{ color: customColors.accent.primary, fontSize: 28 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Role-Based Access Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Who can use which AI workflows, by role and department
          </Typography>
        </Box>
        <Chip label="Read Only" size="small" variant="outlined" sx={{ ml: 'auto' }} />
      </Box>

      {/* Permission Matrix */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', color: 'text.secondary' }}>
        Access Matrix
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Authorized Use Cases</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {RBAC_RULES.map(rule => (
              <TableRow key={rule.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'action.hover', color: 'text.secondary' }}>
                      {rule.role.includes('CISO') ? <Shield sx={{ fontSize: 16 }} /> :
                       rule.role.includes('VP') ? <AdminPanelSettings sx={{ fontSize: 16 }} /> :
                       rule.role.includes('IT') ? <Security sx={{ fontSize: 16 }} /> :
                       <Person sx={{ fontSize: 16 }} />}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{rule.role}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {rule.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={rule.department}
                    size="small"
                    variant="outlined"
                    icon={rule.department === 'All' ? <Shield sx={{ fontSize: 14 }} /> : <LocalHospital sx={{ fontSize: 14 }} />}
                    sx={{ height: 24 }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {rule.permissions.map(perm => {
                      const cfg = PERMISSION_CONFIG[perm] || { label: perm, color: 'default' as const, icon: null };
                      return (
                        <Tooltip key={perm} title={cfg.label}>
                          <Chip
                            label={cfg.label}
                            size="small"
                            color={cfg.color}
                            sx={{ height: 22, fontSize: '0.65rem' }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {rule.useCaseIds.map(ucId => (
                      <Chip
                        key={ucId}
                        label={getUseCaseName(ucId)}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.65rem' }}
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Policy Summary */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', color: 'text.secondary' }}>
        Active Policies
      </Typography>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            'Human-in-the-loop required for all HIGH and CRITICAL risk use cases',
            'Minimum data access principle enforced per use case',
            'All AI interactions logged to 7-year retention audit trail',
            'Quarterly bias monitoring with 5% disparity threshold',
            'Model version pinning — no auto-updates without governance approval',
          ].map((policy, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
              <VerifiedUser sx={{ fontSize: 16, color: customColors.health.green }} />
              <Typography variant="body2">{policy}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
