import type { RestorationPlan } from "./models/RestorationPlan";
import type { RestorationStep } from "./models/RestorationStep";
import type { ApprovalRecord } from "./models/RestorationPlan";

const T0 = "2026-06-11T09:00:00.000Z";
const T1 = "2026-06-12T09:00:00.000Z";
const T2 = "2026-06-13T09:00:00.000Z";

const approvalRecords: ApprovalRecord[] = [
  { id: 1, plan_id: 1, action: "SUBMIT", actor_id: 2, actor_name: "陆修复", actor_role: "RESTORER", comment: "请专家审批青瓷清洗方案", created_at: T0 },
  { id: 2, plan_id: 2, action: "SUBMIT", actor_id: 2, actor_name: "陆修复", actor_role: "RESTORER", comment: "请专家审批竹简脱水方案", created_at: T1 },
  { id: 3, plan_id: 2, action: "APPROVE", actor_id: 3, actor_name: "沈专家", actor_role: "EXPERT", comment: "工艺与风险可控，同意实施", created_at: T1 },
  { id: 4, plan_id: 4, action: "SUBMIT", actor_id: 2, actor_name: "陆修复", actor_role: "RESTORER", comment: "请审批丝织品加固方案", created_at: T2 },
  { id: 5, plan_id: 4, action: "REJECT", actor_id: 3, actor_name: "沈专家", actor_role: "EXPERT", comment: "风险评估缺少染料掉色试验，请补充后重新送审", created_at: T2 }
];

const restorationPlan: RestorationPlan[] = [
  {
    id: 1, relic_id: 1, damage_record_id: 1,
    plan_title: "宋青瓷表面沉积物清洗方案", method: "软毛笔配合去离子水逐步清洗", risk_assessment: "釉面可能存在细微开片，清洗力度需可控",
    approval_status: "SUBMITTED", owner_id: 2, owner_name: "陆修复",
    submitted_at: T0, approved_at: null, rejected_at: null, archived_at: null, rejection_reason: null,
    updated_at: T0, approval_records: approvalRecords.filter((r) => r.plan_id === 1)
  },
  {
    id: 2, relic_id: 2, damage_record_id: 2,
    plan_title: "汉代竹简脱水定型方案", method: "乙醇梯度脱水后真空冷冻干燥", risk_assessment: "脱水过快会导致简牍翘曲",
    approval_status: "APPROVED", owner_id: 2, owner_name: "陆修复",
    submitted_at: T1, approved_at: T1, rejected_at: null, archived_at: null, rejection_reason: null,
    updated_at: T1, approval_records: approvalRecords.filter((r) => r.plan_id === 2)
  },
  {
    id: 3, relic_id: 3, damage_record_id: 3,
    plan_title: "明代绢本设色画托裱方案（编制中）", method: "待补充", risk_assessment: "待补充",
    approval_status: "DRAFT", owner_id: 2, owner_name: "陆修复",
    submitted_at: null, approved_at: null, rejected_at: null, archived_at: null, rejection_reason: null,
    updated_at: T2, approval_records: []
  },
  {
    id: 4, relic_id: 1, damage_record_id: 1,
    plan_title: "唐代丝织品残片加固方案", method: "蚕丝线丝网衬垫加固", risk_assessment: "染料遇水可能掉色，待试验",
    approval_status: "REJECTED", owner_id: 2, owner_name: "陆修复",
    submitted_at: T2, approved_at: null, rejected_at: T2, archived_at: null,
    rejection_reason: "风险评估缺少染料掉色试验，请补充后重新送审",
    updated_at: T2, approval_records: approvalRecords.filter((r) => r.plan_id === 4)
  },
  {
    id: 5, relic_id: 2, damage_record_id: 2,
    plan_title: "青铜鼎矿化部位补配方案", method: "环氧树脂配矿物颜料补缺", risk_assessment: "补配材料需可逆",
    approval_status: "ARCHIVED", owner_id: 2, owner_name: "陆修复",
    submitted_at: "2026-05-10T09:00:00.000Z", approved_at: "2026-05-11T09:00:00.000Z",
    rejected_at: null, archived_at: "2026-05-20T09:00:00.000Z", rejection_reason: null,
    updated_at: "2026-05-20T09:00:00.000Z",
    approval_records: [
      { id: 6, plan_id: 5, action: "SUBMIT", actor_id: 2, actor_name: "陆修复", actor_role: "RESTORER", comment: "请审批补配方案", created_at: "2026-05-10T09:00:00.000Z" },
      { id: 7, plan_id: 5, action: "APPROVE", actor_id: 3, actor_name: "沈专家", actor_role: "EXPERT", comment: "同意", created_at: "2026-05-11T09:00:00.000Z" },
      { id: 8, plan_id: 5, action: "ARCHIVE", actor_id: 4, actor_name: "韩档案", actor_role: "ARCHIVIST", comment: "修复完成，归档入库", created_at: "2026-05-20T09:00:00.000Z" }
    ]
  }
];

const restorationStep: RestorationStep[] = [
  // plan#2 已通过：前两步完成、第三步执行中、第四步待执行（用于展示顺序执行）
  { id: 1, plan_id: 2, step_order: 1, technique: "清洗除霉", material_used: "去离子水、软毛刷", operator_id: 2, operator_name: "陆修复", step_status: "FINISHED", started_at: "2026-06-13T09:00:00.000Z", finished_at: "2026-06-13T11:00:00.000Z", quality_note: "质检通过", created_at: T1, updated_at: "2026-06-13T11:00:00.000Z" },
  { id: 2, plan_id: 2, step_order: 2, technique: "乙醇梯度脱水", material_used: "无水乙醇", operator_id: 2, operator_name: "陆修复", step_status: "FINISHED", started_at: "2026-06-14T09:00:00.000Z", finished_at: "2026-06-14T15:00:00.000Z", quality_note: "质检通过", created_at: T1, updated_at: "2026-06-14T15:00:00.000Z" },
  { id: 3, plan_id: 2, step_order: 3, technique: "真空冷冻干燥", material_used: "冷冻干燥设备", operator_id: 2, operator_name: "陆修复", step_status: "IN_PROGRESS", started_at: "2026-06-15T08:30:00.000Z", finished_at: null, quality_note: "", created_at: T1, updated_at: "2026-06-15T08:30:00.000Z" },
  { id: 4, plan_id: 2, step_order: 4, technique: "定型上架", material_used: "无酸纸板", operator_id: 2, operator_name: "陆修复", step_status: "PENDING", started_at: null, finished_at: null, quality_note: "", created_at: T1, updated_at: T1 },
  // plan#4 被退回：既有步骤保留，但禁止继续执行
  { id: 5, plan_id: 4, step_order: 1, technique: "丝网衬垫裁剪", material_used: "蚕丝丝网", operator_id: 2, operator_name: "陆修复", step_status: "FINISHED", started_at: "2026-06-13T09:00:00.000Z", finished_at: "2026-06-13T10:00:00.000Z", quality_note: "已完成的步骤随方案退回而冻结", created_at: T2, updated_at: "2026-06-13T10:00:00.000Z" },
  { id: 6, plan_id: 4, step_order: 2, technique: "衬垫缝合加固", material_used: "蚕丝线", operator_id: 2, operator_name: "陆修复", step_status: "PENDING", started_at: null, finished_at: null, quality_note: "", created_at: T2, updated_at: T2 },
  // plan#5 已归档：步骤全部完成
  { id: 7, plan_id: 5, step_order: 1, technique: "矿化层清理", material_used: "机械清理工具", operator_id: 2, operator_name: "陆修复", step_status: "FINISHED", started_at: "2026-05-12T09:00:00.000Z", finished_at: "2026-05-12T12:00:00.000Z", quality_note: "通过", created_at: "2026-05-11T09:00:00.000Z", updated_at: "2026-05-12T12:00:00.000Z" },
  { id: 8, plan_id: 5, step_order: 2, technique: "补缺配平", material_used: "环氧树脂、矿物颜料", operator_id: 2, operator_name: "陆修复", step_status: "FINISHED", started_at: "2026-05-13T09:00:00.000Z", finished_at: "2026-05-13T16:00:00.000Z", quality_note: "通过", created_at: "2026-05-11T09:00:00.000Z", updated_at: "2026-05-13T16:00:00.000Z" }
];

export const seed = {
  "relicItem": [
    { id: 1, relic_code: "QY-001", name: "宋青釉莲瓣纹碗", era: "宋代", material: "瓷器", collection_level: "一级", storage_location: "三号库房 A-12", current_condition: "IN_RESTORATION" },
    { id: 2, relic_code: "JD-014", name: "汉代隶书竹简（一组）", era: "汉代", material: "竹木器", collection_level: "一级", storage_location: "恒温恒湿柜 B-03", current_condition: "FRAGILE" },
    { id: 3, relic_code: "SH-208", name: "明代绢本设色花鸟图轴", era: "明代", material: "丝织品", collection_level: "二级", storage_location: "书画库 C-21", current_condition: "DAMAGED" }
  ],
  "damageRecord": [
    { id: 1, relic_id: 1, damage_type: "SURFACE_DEPOSIT", position_desc: "碗内壁与底足", severity: "MEDIUM", discovered_by: "周巡查", discovered_at: "2026-06-05T09:00:00Z", image_url: "/mock/image_url-1.png", status: "OPEN" },
    { id: 2, relic_id: 2, damage_type: "WARPING", position_desc: "第 3-7 枚简牍", severity: "HIGH", discovered_by: "周巡查", discovered_at: "2026-06-06T09:00:00Z", image_url: "/mock/image_url-2.png", status: "IN_TREATMENT" },
    { id: 3, relic_id: 3, damage_type: "TEAR", position_desc: "画心左上区域", severity: "HIGH", discovered_by: "周巡查", discovered_at: "2026-06-08T09:00:00Z", image_url: "/mock/image_url-3.png", status: "OPEN" }
  ],
  restorationPlan,
  restorationStep,
  "imageVersion": [
    { id: 1, relic_id: 2, plan_id: 2, version_no: "v1", image_type: "BEFORE", file_path: "/mock/bamboo-before.jpg", capture_at: "2026-06-12T09:00:00Z", note: "脱水前现状" },
    { id: 2, relic_id: 2, plan_id: 2, version_no: "v2", image_type: "DURING", file_path: "/mock/bamboo-during.jpg", capture_at: "2026-06-14T16:00:00Z", note: "乙醇脱水后" },
    { id: 3, relic_id: 1, plan_id: 5, version_no: "v1", image_type: "AFTER", file_path: "/mock/bronze-after.jpg", capture_at: "2026-05-19T09:00:00Z", note: "补配完成，已归档" }
  ]
};

export type SeedState = typeof seed;
