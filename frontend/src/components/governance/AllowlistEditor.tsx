/**
 * Allowlist Editor — View approved models, prompt templates, and constraints
 * 
 * Shows per-use-case approved prompts/templates, allowed AI models.
 * Read-only for demo, with edit simulation.
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Collapse,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Gavel,
  Memory,
  Description,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Warning,
  Edit,
  Code,
  VerifiedUser,
  Token,
} from '@mui/icons-material';
import { ALLOWED_MODELS, PROMPT_TEMPLATES, GOVERNANCE_POLICIES, type AllowedModel, type PromptTemplate, type GovernancePolicy } from '../../data/healthcare/governanceRegistry';
import { USE_CASES } from '../../data/healthcare/useCases';
import { customColors } from '../../theme/muiTheme';

function getUseCaseName(id: string): string {
  return USE_CASES.find(u => u.id === id)?.name || id;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Main Component ──────────────────────────────────────────

export function AllowlistEditor() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Gavel sx={{ color: customColors.accent.cyan, fontSize: 28 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Allowlists & Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approved AI models, prompt templates, and governance policies
          </Typography>
        </Box>
        <Chip label="Read Only" size="small" variant="outlined" sx={{ ml: 'auto' }} />
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Memory sx={{ fontSize: 18 }} />} iconPosition="start" label="Approved Models" />
        <Tab icon={<Description sx={{ fontSize: 18 }} />} iconPosition="start" label="Prompt Templates" />
        <Tab icon={<VerifiedUser sx={{ fontSize: 18 }} />} iconPosition="start" label="Governance Policies" />
      </Tabs>

      {/* Tab Panels — all stay mounted to prevent layout jumps */}
      <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
        <ModelsTab />
      </Box>
      <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
        <TemplatesTab />
      </Box>
      <Box sx={{ display: tab === 2 ? 'block' : 'none' }}>
        <PoliciesTab />
      </Box>
    </Box>
  );
}

// ─── Models Tab ──────────────────────────────────────────────

function ModelsTab() {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Approved For</TableCell>
            <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Max Tokens</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Human Review</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ALLOWED_MODELS.map(model => (
            <TableRow key={model.modelId} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: `${customColors.accent.cyan}20`, color: customColors.accent.cyan }}>
                    <Memory sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{model.modelName}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                      {model.modelId}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{model.vendor}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={`v${model.version}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.7rem', fontFamily: 'monospace' }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {model.approvedFor.map(ucId => (
                    <Chip key={ucId} label={getUseCaseName(ucId)} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                  ))}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {model.maxTokens.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                {model.requiresHumanReview ? (
                  <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label="Required" size="small" color="warning" sx={{ height: 22, fontSize: '0.65rem' }} />
                ) : (
                  <Chip label="Optional" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Templates Tab ───────────────────────────────────────────

function TemplatesTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusConfig: Record<string, { color: 'success' | 'warning' | 'default'; icon: React.ReactNode }> = {
    active: { color: 'success', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
    draft: { color: 'warning', icon: <Edit sx={{ fontSize: 14 }} /> },
    deprecated: { color: 'default', icon: <Warning sx={{ fontSize: 14 }} /> },
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, width: 32 }} />
            <TableCell sx={{ fontWeight: 600 }}>Template</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Use Case</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Updated By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {PROMPT_TEMPLATES.map(tpl => {
            const isExpanded = expandedId === tpl.id;
            const sCfg = statusConfig[tpl.status] || statusConfig.active;

            return (
              <>
                <TableRow key={tpl.id} hover onClick={() => setExpandedId(isExpanded ? null : tpl.id)} sx={{ cursor: 'pointer', '& > *': { borderBottom: isExpanded ? 'none' : undefined } }}>
                  <TableCell>
                    <IconButton size="small" sx={{ p: 0 }}>
                      {isExpanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{tpl.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getUseCaseName(tpl.useCaseId)} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={`v${tpl.version}`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem', fontFamily: 'monospace' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={tpl.status} size="small" color={sCfg.color} icon={sCfg.icon as any} sx={{ height: 22, fontSize: '0.65rem', textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatDate(tpl.lastUpdated)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{tpl.updatedBy}</Typography>
                  </TableCell>
                </TableRow>

                <TableRow key={`${tpl.id}-detail`}>
                  <TableCell colSpan={7} sx={{ py: 0 }}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                          Prompt Template
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            mt: 1,
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                            bgcolor: 'background.default',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                            <Code sx={{ fontSize: 14 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Template Content</Typography>
                          </Box>
                          {tpl.template}
                        </Paper>
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
  );
}

// ─── Policies Tab ────────────────────────────────────────────

function PoliciesTab() {
  const categoryColors: Record<string, string> = {
    'compliance': customColors.health.green,
    'safety': customColors.health.red,
    'audit': customColors.accent.cyan,
    'model-usage': customColors.accent.primary,
    'data-access': customColors.health.amber,
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'compliance': <VerifiedUser sx={{ fontSize: 18 }} />,
    'safety': <Warning sx={{ fontSize: 18 }} />,
    'audit': <Description sx={{ fontSize: 18 }} />,
    'model-usage': <Memory sx={{ fontSize: 18 }} />,
    'data-access': <Token sx={{ fontSize: 18 }} />,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {GOVERNANCE_POLICIES.map(policy => (
        <Paper key={policy.id} sx={{ p: 2.5, borderRadius: 2, borderLeft: `4px solid ${categoryColors[policy.category] || 'text.secondary'}` }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: `${categoryColors[policy.category]}20`, color: categoryColors[policy.category] }}>
              {categoryIcons[policy.category]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {policy.name}
                </Typography>
                <Chip
                  label={policy.category.replace('-', ' ')}
                  size="small"
                  sx={{ height: 20, fontSize: '0.6rem', textTransform: 'capitalize' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {policy.description}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Enforced since {formatDate(policy.enforcedSince)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
