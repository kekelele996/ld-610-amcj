CREATE TABLE IF NOT EXISTS relic_item (
  id INTEGER PRIMARY KEY,
  relic_code TEXT,
  name TEXT,
  era TEXT,
  material TEXT,
  collection_level TEXT,
  storage_location TEXT,
  current_condition TEXT
);

CREATE TABLE IF NOT EXISTS damage_record (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_type TEXT,
  position_desc TEXT,
  severity TEXT,
  discovered_by TEXT,
  discovered_at TEXT,
  image_url TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS restoration_plan (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_record_id TEXT,
  plan_title TEXT,
  method TEXT,
  risk_assessment TEXT,
  approval_status TEXT,
  owner_id TEXT,
  owner_name TEXT,
  submitted_at TEXT,
  approved_at TEXT,
  rejected_at TEXT,
  archived_at TEXT,
  rejection_reason TEXT,
  updated_at TEXT
);

-- 审批轨迹：送审 / 通过 / 退回（含退回原因）/ 归档，构成可追溯审批链
CREATE TABLE IF NOT EXISTS plan_approval_record (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES restoration_plan(id),
  action TEXT NOT NULL,
  actor_id INTEGER,
  actor_name TEXT,
  actor_role TEXT,
  comment TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_plan_approval_record_plan ON plan_approval_record(plan_id);

CREATE TABLE IF NOT EXISTS restoration_step (
  id INTEGER PRIMARY KEY,
  plan_id TEXT,
  step_order INTEGER,
  technique TEXT,
  material_used TEXT,
  operator_id TEXT,
  operator_name TEXT,
  step_status TEXT,
  started_at TEXT,
  finished_at TEXT,
  quality_note TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_restoration_step_plan ON restoration_step(plan_id);

CREATE TABLE IF NOT EXISTS image_version (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  plan_id TEXT,
  version_no TEXT,
  image_type TEXT,
  file_path TEXT,
  capture_at TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  actor_id INTEGER,
  actor_name TEXT,
  actor_role TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  message TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_type, target_id);
