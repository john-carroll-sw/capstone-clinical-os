/**
 * Audit Log View — Searchable, filterable log of all AI interactions
 * 
 * Shows timestamp, user, patient (anonymized), AI I/O, action, severity.
 * Filterable by use case, department, action, severity, escalation status.
 */

import { useState, useMemo } from 'react';
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
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Collapse,
  InputAdornment,
  Pagination,
  Avatar,
} from '@mui/material';
import {
  Search,
  FilterList,
  ExpandMore,
  ExpandLess,
  Flag,
  CheckCircle,
  Edit,
  Cancel,
  Visibility,
  AssignmentTurnedIn,
  Warning,
  ArrowUpward,
  AutoMode,
} from '@mui/icons-material';
import { AUDIT_LOG, getAuditStats, type AuditEntry, type AuditAction, type AuditSeverity, type EscalationStatus } from '../../data/healthcare/auditLog';
import { customColors } from '../../theme/muiTheme';

// ─── Config ──────────────────────────────────────────────────

const ACTION_CONFIG: Record<AuditAction, { label: string; color: string; icon: React.ReactNode }> = {
  'confirmed': { label: 'Confirmed', color: customColors.health.green, icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  'edited': { label: 'Edited', color: customColors.accent.primary, icon: <Edit sx={{ fontSize: 14 }} /> },
  'rejected': { label: 'Rejected', color: customColors.health.red, icon: <Cancel sx={{ fontSize: 14 }} /> },
  'auto-suppressed': { label: 'AI Suppressed', color: 'text.secondary', icon: <AutoMode sx={{ fontSize: 14 }} /> },
  'escalated': { label: 'Escalated', color: customColors.health.red, icon: <ArrowUpward sx={{ fontSize: 14 }} /> },
  'viewed': { label: 'Viewed', color: 'text.secondary', icon: <Visibility sx={{ fontSize: 14 }} /> },
  'signed-off': { label: 'Signed Off', color: customColors.health.green, icon: <AssignmentTurnedIn sx={{ fontSize: 14 }} /> },
  'flagged': { label: 'Flagged', color: customColors.health.amber, icon: <Flag sx={{ fontSize: 14 }} /> },
  'overridden': { label: 'Overridden', color: customColors.health.amber, icon: <Warning sx={{ fontSize: 14 }} /> },
};

const SEVERITY_COLORS: Record<AuditSeverity, 'default' | 'warning' | 'error'> = {
  normal: 'default',
  warning: 'warning',
  critical: 'error',
};

const PAGE_SIZE = 25;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
         d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ─── Main Component ──────────────────────────────────────────

export function AuditLogView() {
  const [search, setSearch] = useState('');
  const [filterUseCase, setFilterUseCase] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterEscalation, setFilterEscalation] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const stats = useMemo(() => getAuditStats(), []);

  const filtered = useMemo(() => {
    return AUDIT_LOG.filter(entry => {
      if (filterUseCase !== 'all' && entry.useCaseId !== filterUseCase) return false;
      if (filterDepartment !== 'all' && entry.department.toLowerCase() !== filterDepartment) return false;
      if (filterSeverity !== 'all' && entry.severity !== filterSeverity) return false;
      if (filterEscalation !== 'all') {
        if (filterEscalation === 'flagged' && entry.escalationStatus === 'none') return false;
        if (filterEscalation !== 'flagged' && entry.escalationStatus !== filterEscalation) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return (
          entry.aiInput.toLowerCase().includes(s) ||
          entry.aiOutput.toLowerCase().includes(s) ||
          entry.patientId.toLowerCase().includes(s) ||
          entry.userRole.toLowerCase().includes(s) ||
          entry.action.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [search, filterUseCase, filterDepartment, filterSeverity, filterEscalation]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Flag sx={{ color: customColors.accent.cyan, fontSize: 28 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            AI Interaction Audit Log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete trail of every AI interaction across all clinical use cases
          </Typography>
        </Box>
      </Box>

      {/* Stats Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Entries', value: stats.total.toLocaleString() },
          { label: 'Flagged', value: stats.flagged.toString(), color: customColors.health.amber },
          { label: 'Critical', value: stats.critical.toString(), color: customColors.health.red },
          { label: 'Avg Confidence', value: `${Math.round(stats.avgConfidence * 100)}%` },
          { label: 'Avg Response', value: `${stats.avgResponseMs}ms` },
        ].map(stat => (
          <Paper key={stat.label} sx={{ px: 2, py: 1.5, flex: '1 1 100px', minWidth: 100 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontSize: '0.6rem' }}>
              {stat.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color || 'text.primary' }}>
              {stat.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterList sx={{ color: 'text.secondary' }} />
        <TextField
          size="small"
          placeholder="Search interactions..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          sx={{ minWidth: 200, flex: 1 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>,
          }}
        />
        <TextField
          select
          size="small"
          label="Use Case"
          value={filterUseCase}
          onChange={e => { setFilterUseCase(e.target.value); setPage(1); }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All Use Cases</MenuItem>
          <MenuItem value="uc-alert-prioritization">Medication Alert Prioritization</MenuItem>
          <MenuItem value="uc-drug-interaction">Drug Interaction Summary</MenuItem>
          <MenuItem value="uc-handoff-summary">Shift Handoff Summary</MenuItem>
          <MenuItem value="uc-patient-summary">Patient Status Summary</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Department"
          value={filterDepartment}
          onChange={e => { setFilterDepartment(e.target.value); setPage(1); }}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pharmacy">Pharmacy</MenuItem>
          <MenuItem value="nursing">Nursing</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Severity"
          value={filterSeverity}
          onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="critical">Critical</MenuItem>
          <MenuItem value="warning">Warning</MenuItem>
          <MenuItem value="normal">Normal</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Escalation"
          value={filterEscalation}
          onChange={e => { setFilterEscalation(e.target.value); setPage(1); }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="flagged">Any Flag</MenuItem>
          <MenuItem value="investigating">Investigating</MenuItem>
          <MenuItem value="resolved">Resolved</MenuItem>
          <MenuItem value="documented">Documented</MenuItem>
        </TextField>
      </Paper>

      {/* Results count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Showing {paged.length} of {filtered.length} entries
        </Typography>
        {pageCount > 1 && (
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
            size="small"
            color="primary"
          />
        )}
      </Box>

      {/* Audit Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 32 }} />
              <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Use Case</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Confidence</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Escalation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map(entry => {
              const isExpanded = expandedId === entry.id;
              const actionCfg = ACTION_CONFIG[entry.action];

              return (
                <>
                  <TableRow
                    key={entry.id}
                    hover
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    sx={{
                      cursor: 'pointer',
                      '& > *': { borderBottom: isExpanded ? 'none' : undefined },
                      bgcolor: entry.escalationStatus !== 'none' ? 'rgba(255, 170, 0, 0.04)' : undefined,
                    }}
                  >
                    <TableCell>
                      <IconButton size="small" sx={{ p: 0 }}>
                        {isExpanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                        {formatDateTime(entry.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {entry.useCaseName.length > 25 ? entry.useCaseName.substring(0, 25) + '...' : entry.useCaseName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{entry.userRole}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {entry.patientId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={actionCfg.label}
                        icon={<Box sx={{ display: 'flex', alignItems: 'center', color: actionCfg.color }}>{actionCfg.icon}</Box>}
                        sx={{ height: 22, fontSize: '0.7rem', '& .MuiChip-icon': { ml: 0.5 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={entry.severity} color={SEVERITY_COLORS[entry.severity]} sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ color: entry.confidenceScore >= 0.9 ? customColors.health.green : entry.confidenceScore >= 0.8 ? 'text.primary' : customColors.health.amber }}>
                        {Math.round(entry.confidenceScore * 100)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {entry.escalationStatus !== 'none' && (
                        <Chip
                          size="small"
                          label={entry.escalationStatus}
                          color={entry.escalationStatus === 'resolved' || entry.escalationStatus === 'documented' ? 'success' : 'warning'}
                          sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }}
                        />
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Expanded Detail */}
                  <TableRow key={`${entry.id}-detail`}>
                    <TableCell colSpan={9} sx={{ py: 0 }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 1 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                AI Input
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                                {entry.aiInput}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                AI Output
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                                {entry.aiOutput}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Model: <strong>{entry.modelVersion}</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Response: <strong>{entry.responseTimeMs}ms</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Confidence: <strong>{Math.round(entry.confidenceScore * 100)}%</strong>
                            </Typography>
                          </Box>
                          {entry.escalationNote && (
                            <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5, borderColor: customColors.health.amber }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                Escalation Note
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                                {entry.escalationNote}
                              </Typography>
                            </Paper>
                          )}
                          {entry.policyViolation && (
                            <Paper variant="outlined" sx={{ p: 1.5, mt: 1, borderColor: customColors.health.red }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: customColors.health.red, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                Policy Violation
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                                {entry.policyViolation}
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bottom Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
