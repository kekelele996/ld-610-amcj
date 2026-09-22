export interface AuditLog {
  id: number;
  actor_id: number | null;
  actor_name: string;
  role: string | null;
  action: string;
  target_type: string;
  target_id: string;
  detail: string;
  created_at: string;
}
