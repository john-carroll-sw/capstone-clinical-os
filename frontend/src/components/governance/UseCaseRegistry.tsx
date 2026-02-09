/**
 * Use Case Registry — Governance view of all AI use cases
 * 
 * Table of AI use cases with status, risk level, approval workflow.
 * CISO Martinez can approve, suspend, or add comments.
 */

import { useState } from 'react';
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Collapse,
  Divider,
  Avatar,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  PauseCircle,
  HourglassEmpty,
  Edit,
  ExpandMore,
  ExpandLess,
  Shield,
  Warning,
  Info,
  Timeline,
  Gavel,
  VerifiedUser,
} from '@mui/icons-material';
import { USE_CASES, type UseCase, type ApprovalStatus, type RiskLevel } from '../../data/healthcare/useCases';
import { APPROVAL_HISTORY, type ApprovalHistoryEntry } from '../../data/healthcare/governanceRegistry';
import { customColors } from '../../theme/muiTheme';

// ─── Status + Risk Helpers ───────────────────────────────────

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }> = {
  approved: { label: 'Approved', color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
  pending: { label: 'Pending Review', color: 'warning', icon: <HourglassEmpty sx={{ fontSize: 16 }} /> },
  suspended: { label: 'Suspended', color: 'error', icon: <PauseCircle sx={{ fontSize: 16 }} /> },
  draft: { label: 'Draft', color: 'default', icon: <Edit sx={{ fontSize: 16 }} /> },
};

const RISK_CONFIG: Record<RiskLevel, { label: string; color: 'success' | 'info' | 'warning' | 'error' }> = {
  low: { label: 'Low', color: 'success' },
  medium: { label: 'Medium', color: 'info' },
  high: { label: 'High', color: 'warning' },
  critical: { label: 'Critical', color: 'error' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

// ─── Main Component ──────────────────────────────────────────

export function UseCaseRegistry() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{ useCase: UseCase; action: 'approve' | 'suspend' | 'comment' } | null>(null);
  const [comment, setComment] = useState('');
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  const handleAction = () => {
    if (actionDialog) {
      const verb = actionDialog.action === 'approve' ? 'Approved' : actionDialog.action === 'suspend' ? 'Suspended' : 'Comment added to';
      setSuccessAlert(`${verb}: ${actionDialog.useCase.name}`);
      setActionDialog(null);
      setComment('');
      setTimeout(() => setSuccessAlert(null), 4000);
    }
  };

  const stats = {
    total: USE_CASES.length,
    approved: USE_CASES.filter(uc => uc.status === 'approved').length,
    pending: USE_CASES.filter(uc => uc.status === 'pending').length,
    draft: USE_CASES.filter(uc => uc.status === 'draft').length,
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Shield sx={{ color: customColors.accent.primary, fontSize: 28 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            AI Use Case Registry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review, approve, and manage clinical AI use cases across departments
          </Typography>
        </Box>
      </Box>

      {/* Stats Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Use Cases', value: stats.total, color: 'text.primary' },
          { label: 'Approved', value: stats.approved, color: customColors.health.green },
          { label: 'Pending Review', value: stats.pending, color: customColors.health.amber },
          { label: 'Draft', value: stats.draft, color: 'text.secondary' },
        ].map(stat => (
          <Paper key={stat.label} sx={{ px: 2.5, py: 1.5, flex: '1 1 120px', minWidth: 120 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontSize: '0.65rem' }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
              {stat.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {successAlert && (
        <Alert severity="success" onClose={() => setSuccessAlert(null)} sx={{ mb: 2 }}>
          {successAlert}
        </Alert>
      )}

      {/* Use Case Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 40 }} />
              <TableCell sx={{ fontWeight: 600 }}>Use Case</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Risk</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Interactions</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Flagged</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Audit</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {USE_CASES.map(uc => {
              const isExpanded = expandedId === uc.id;
              const statusCfg = STATUS_CONFIG[uc.status];
              const riskCfg = RISK_CONFIG[uc.riskLevel];
              const history = APPROVAL_HISTORY[uc.id] || [];
              const flagRate = uc.totalInteractions > 0 ? ((uc.flaggedInteractions / uc.totalInteractions) * 100).toFixed(2) : '0';

              return (
                <>
                  <TableRow
                    key={uc.id}
                    hover
                    onClick={() => setExpandedId(isExpanded ? null : uc.id)}
                    sx={{ cursor: 'pointer', '& > *': { borderBottom: isExpanded ? 'none' : undefined } }}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{uc.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Model: {uc.modelVersion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={uc.departmentId === 'pharmacy' ? 'Pharmacy' : 'Nursing'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={riskCfg.label} size="small" color={riskCfg.color} />
                    </TableCell>
                    <TableCell>
                      <Chip label={statusCfg.label} size="small" color={statusCfg.color} icon={statusCfg.icon as any} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatNumber(uc.totalInteractions)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: uc.flaggedInteractions > 20 ? customColors.health.red : 'text.primary' }}>
                        {uc.flaggedInteractions} ({flagRate}%)
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(uc.lastAuditDate)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {uc.status === 'pending' && (
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); setActionDialog({ useCase: uc, action: 'approve' }); }}>
                              <VerifiedUser sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {uc.status === 'approved' && (
                          <Tooltip title="Suspend">
                            <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); setActionDialog({ useCase: uc, action: 'suspend' }); }}>
                              <PauseCircle sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Add comment">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setActionDialog({ useCase: uc, action: 'comment' }); }}>
                            <Gavel sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Detail Row */}
                  <TableRow key={`${uc.id}-detail`}>
                    <TableCell colSpan={9} sx={{ py: 0, px: 0 }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: 'action.hover' }}>
                          {/* Description */}
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {uc.description}
                          </Typography>

                          {/* Workflow */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Workflow
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
                              {uc.workflow}
                            </Typography>
                          </Box>

                          {/* Flag Rate Bar */}
                          {uc.totalInteractions > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Flag Rate
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {uc.flaggedInteractions} / {formatNumber(uc.totalInteractions)} ({flagRate}%)
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(parseFloat(flagRate) * 10, 100)} // Scale for visibility
                                color={parseFloat(flagRate) > 0.5 ? 'warning' : 'success'}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          )}

                          {/* Approval History */}
                          {history.length > 0 && (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <Timeline sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Approval History
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {history.map(entry => (
                                  <HistoryEntry key={entry.id} entry={entry} />
                                ))}
                              </Box>
                            </Box>
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

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog?.action === 'approve' ? 'Approve Use Case' :
           actionDialog?.action === 'suspend' ? 'Suspend Use Case' : 'Add Governance Comment'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {actionDialog?.useCase.name}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label={actionDialog?.action === 'comment' ? 'Comment' : 'Reason / conditions'}
            placeholder={
              actionDialog?.action === 'approve' ? 'e.g. Approved with conditions: quarterly audit reviews required...' :
              actionDialog?.action === 'suspend' ? 'e.g. Suspended pending investigation of flagged interactions...' :
              'e.g. Please provide updated data flow diagram before next review...'
            }
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setActionDialog(null); setComment(''); }}>Cancel</Button>
          <Button
            variant="contained"
            color={actionDialog?.action === 'suspend' ? 'warning' : 'primary'}
            onClick={handleAction}
          >
            {actionDialog?.action === 'approve' ? 'Approve' :
             actionDialog?.action === 'suspend' ? 'Suspend' : 'Submit Comment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── History Entry ───────────────────────────────────────────

function HistoryEntry({ entry }: { entry: ApprovalHistoryEntry }) {
  const actionColors: Record<string, string> = {
    submitted: customColors.accent.primary,
    approved: customColors.health.green,
    rejected: customColors.health.red,
    suspended: customColors.health.amber,
    comment: 'text.secondary',
    resubmitted: customColors.accent.cyan,
  };

  const actionIcons: Record<string, React.ReactNode> = {
    submitted: <Info sx={{ fontSize: 14 }} />,
    approved: <CheckCircle sx={{ fontSize: 14 }} />,
    rejected: <Warning sx={{ fontSize: 14 }} />,
    suspended: <PauseCircle sx={{ fontSize: 14 }} />,
    comment: <Gavel sx={{ fontSize: 14 }} />,
    resubmitted: <Edit sx={{ fontSize: 14 }} />,
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: `${actionColors[entry.action]}20`, color: actionColors[entry.action] }}>
          {actionIcons[entry.action]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
              {entry.action}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              by {entry.actor} — {formatDate(entry.timestamp)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {entry.comment}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
