/**
 * Healthcare Outcomes Dashboard
 * 
 * Phase 1: Department → Use Case → Metric hierarchy
 * Shows healthcare outcome metrics filtered by persona's department.
 * Toggles between Pharmacy and Nursing via PersonaContext.
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Divider,
} from '@mui/material';
import {
  LocalPharmacy,
  MedicalServices,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { usePersona } from '../../context/PersonaContext';
import { DEPARTMENTS, type Department as DeptType } from '../../data/healthcare/departments';
import { getUseCasesByDepartment, type UseCase } from '../../data/healthcare/useCases';
import {
  getMetricsByDepartment,
  PROGRAM_METRICS,
  ALL_HEALTHCARE_METRICS,
} from '../../data/healthcare/metrics';
import { MetricCard } from '../thread/MetricCard';
import type { Metric } from '@/types/metrics';

const statusColors = {
  approved: '#03cc54',
  pending: '#e0a73f',
  draft: '#94a3b8',
  suspended: '#ba0000',
};

const riskColors = {
  low: '#03cc54',
  medium: '#e0a73f',
  high: '#f97316',
  critical: '#ba0000',
};

function ProgramSummary() {
  const allMetrics = ALL_HEALTHCARE_METRICS;
  const greenCount = allMetrics.filter(m => m.calculations.state === 'green').length;
  const amberCount = allMetrics.filter(m => m.calculations.state === 'amber').length;
  const redCount = allMetrics.filter(m => m.calculations.state === 'red').length;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Clinical AI Program
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cross-department outcome metrics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip icon={<CheckCircle sx={{ fontSize: 16 }} />} label={`${greenCount} On Track`} size="small" sx={{ bgcolor: 'rgba(3, 204, 84, 0.1)', color: '#03cc54', fontWeight: 600 }} />
            <Chip icon={<Warning sx={{ fontSize: 16 }} />} label={`${amberCount} Watch`} size="small" sx={{ bgcolor: 'rgba(224, 167, 63, 0.1)', color: '#e0a73f', fontWeight: 600 }} />
            {redCount > 0 && (
              <Chip icon={<ErrorIcon sx={{ fontSize: 16 }} />} label={`${redCount} At Risk`} size="small" sx={{ bgcolor: 'rgba(186, 0, 0, 0.1)', color: '#ba0000', fontWeight: 600 }} />
            )}
          </Box>
        </Box>

        {/* Program-level metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 2 }}>
          {PROGRAM_METRICS.map(metric => (
            <MetricCard key={metric.config.id} metric={metric} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

interface DepartmentSectionProps {
  department: DeptType;
  metrics: Metric[];
  useCases: UseCase[];
  isActive: boolean;
}

function DepartmentSection({ department, metrics, useCases, isActive }: DepartmentSectionProps) {
  const approvedUseCases = useCases.filter(uc => uc.status === 'approved');
  const totalInteractions = useCases.reduce((sum, uc) => sum + uc.totalInteractions, 0);

  return (
    <Card sx={{
      mb: 3,
      border: isActive ? 2 : 1,
      borderColor: isActive ? 'primary.main' : 'divider',
      transition: 'border-color 0.2s',
    }}>
      <CardContent>
        {/* Department Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{
            bgcolor: `${department.color}20`,
            color: department.color,
            width: 48,
            height: 48,
            fontSize: '1.5rem',
          }}>
            {department.icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {department.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {department.description}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: department.color }}>
              {Math.round(department.aiAdoptionRate * 100)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI Adoption
            </Typography>
          </Box>
        </Box>

        {/* Department Stats Row */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
              Active Use Cases
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {approvedUseCases.length} / {useCases.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
              Total AI Interactions
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {totalInteractions.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
              Clinicians
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {department.headcount}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Use Cases */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
          AI Use Cases
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {useCases.map(uc => (
            <Chip
              key={uc.id}
              label={uc.name}
              size="small"
              sx={{
                bgcolor: `${statusColors[uc.status]}15`,
                color: statusColors[uc.status],
                fontWeight: 500,
                borderLeft: `3px solid ${riskColors[uc.riskLevel]}`,
                borderRadius: 1,
              }}
            />
          ))}
        </Box>

        {/* Outcome Metrics */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
          Outcome Metrics
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 2 }}>
          {metrics.map(metric => (
            <MetricCard key={metric.config.id} metric={metric} showPace />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

interface HealthcareDashboardProps {
  onTakeAction?: (id: string) => void;
}

export function HealthcareDashboard({ onTakeAction }: HealthcareDashboardProps) {
  const { department: activeDepartment } = usePersona();
  const [viewMode, setViewMode] = useState<'all' | 'pharmacy' | 'nursing'>(activeDepartment);

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (newView) {
      setViewMode(newView as typeof viewMode);
    }
  };

  const departmentsToShow = viewMode === 'all'
    ? DEPARTMENTS
    : DEPARTMENTS.filter(d => d.id === viewMode);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Filter Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Clinical AI outcomes across {DEPARTMENTS.length} departments
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 2 } }}
        >
          <ToggleButton value="all">All Departments</ToggleButton>
          <ToggleButton value="pharmacy">
            <LocalPharmacy sx={{ mr: 0.5, fontSize: '1rem' }} />
            Pharmacy
          </ToggleButton>
          <ToggleButton value="nursing">
            <MedicalServices sx={{ mr: 0.5, fontSize: '1rem' }} />
            Nursing
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Program Summary */}
      <ProgramSummary />

      {/* Department Sections */}
      {departmentsToShow.map(dept => (
        <DepartmentSection
          key={dept.id}
          department={dept}
          metrics={getMetricsByDepartment(dept.id)}
          useCases={getUseCasesByDepartment(dept.id)}
          isActive={dept.id === activeDepartment}
        />
      ))}
    </Box>
  );
}
