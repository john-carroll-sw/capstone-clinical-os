/**
 * Governance Page — Main layout for the Governance Control Plane surface
 * 
 * Routes between sub-pages based on the subPage prop:
 * - registry: Use Case Registry (default)
 * - audit: Audit Log
 * - rbac: RBAC Configuration
 * - allowlists: Allowlists & Templates
 */

import { UseCaseRegistry } from './UseCaseRegistry';
import { AuditLogView } from './AuditLogView';
import { RBACConfig } from './RBACConfig';
import { AllowlistEditor } from './AllowlistEditor';

interface GovernancePageProps {
  subPage: string;
}

export function GovernancePage({ subPage }: GovernancePageProps) {
  switch (subPage) {
    case 'audit':
      return <AuditLogView />;
    case 'rbac':
      return <RBACConfig />;
    case 'allowlists':
      return <AllowlistEditor />;
    case 'registry':
    default:
      return <UseCaseRegistry />;
  }
}
