export interface IAuditLog {
  id: string;
  action: string;
  volcanoId?: string;
  volcanoName?: string;
  performedBy: string;
  performedByEmail: string;
  performedByRole: string;
  details: string;
  timestamp: string;
}

