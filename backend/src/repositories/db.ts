import type { RelicItem } from "../models/RelicItem";
import type { DamageRecord } from "../models/DamageRecord";
import type { RestorationPlan, ApprovalRecord } from "../models/RestorationPlan";
import type { RestorationStep } from "../models/RestorationStep";
import type { ImageVersion } from "../models/ImageVersion";
import type { AuditLog } from "../models/AuditLog";
import type { User } from "../models/User";

/**
 * 内存数据库：全部数据本地存放，禁止接入第三方 API。
 * 仓储层统一从这里取引用，保证一次进程内的审批/执行动作可被后续请求看到。
 */
export interface Database {
  user: User[];
  relicItem: RelicItem[];
  damageRecord: DamageRecord[];
  restorationPlan: RestorationPlan[];
  restorationStep: RestorationStep[];
  approvalRecord: ApprovalRecord[];
  imageVersion: ImageVersion[];
  auditLog: AuditLog[];
}

export const db: Database = {
  user: [],
  relicItem: [],
  damageRecord: [],
  restorationPlan: [],
  restorationStep: [],
  approvalRecord: [],
  imageVersion: [],
  auditLog: []
};

export const clone = <T>(row: T): T => JSON.parse(JSON.stringify(row)) as T;

let sequence = 1000;
export const nextId = () => ++sequence;
