CREATE TABLE IF NOT EXISTS app_user (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('RESTORER','EXPERT','ARCHIVIST','VISITOR'))
);

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
  relic_id INTEGER REFERENCES relic_item(id),
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
  relic_id INTEGER REFERENCES relic_item(id),
  damage_record_id INTEGER REFERENCES damage_record(id),
  plan_title TEXT,
  method TEXT,
  risk_assessment TEXT,
  approval_status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (approval_status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED','ARCHIVED')),
  owner_id INTEGER REFERENCES app_user(id),
  approval_version INTEGER NOT NULL DEFAULT 1,
  reject_reason TEXT,
  submitted_at TEXT,
  approved_at TEXT,
  archived_at TEXT
);

-- 审批与执行追溯链：提交/通过/退回/重新送审/归档全部留痕
CREATE TABLE IF NOT EXISTS approval_record (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES restoration_plan(id),
  approval_version INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('SUBMIT','APPROVE','REJECT','RESUBMIT','ARCHIVE')),
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_id INTEGER REFERENCES app_user(id),
  actor_name TEXT NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS restoration_step (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES restoration_plan(id),
  step_order INTEGER NOT NULL,
  technique TEXT,
  material_used TEXT,
  operator_id INTEGER REFERENCES app_user(id),
  step_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (step_status IN ('PENDING','IN_PROGRESS','COMPLETED')),
  registered_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS image_version (
  id INTEGER PRIMARY KEY,
  relic_id INTEGER REFERENCES relic_item(id),
  plan_id INTEGER REFERENCES restoration_plan(id),
  version_no TEXT,
  image_type TEXT CHECK (image_type IN ('BEFORE','EVIDENCE','AFTER')),
  file_path TEXT,
  capture_at TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor_id INTEGER,
  actor_name TEXT NOT NULL,
  role TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_record_plan ON approval_record(plan_id);
CREATE INDEX IF NOT EXISTS idx_restoration_step_plan ON restoration_step(plan_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_type, target_id);
