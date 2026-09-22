import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";

const T0 = "2026-06-11T09:00:00.000Z";
const T1 = "2026-06-12T09:00:00.000Z";
const T2 = "2026-06-13T09:00:00.000Z";

// 本地种子：结构与后端 seed 对齐，仅在后端离线时兜底展示
export const mockData = {
  relicItem: [
    { id: 1, relic_code: "QY-001", name: "宋青釉莲瓣纹碗", era: "宋代", material: "瓷器", collection_level: "一级", storage_location: "三号库房 A-12", current_condition: "IN_RESTORATION" },
    { id: 2, relic_code: "JD-014", name: "汉代隶书竹简（一组）", era: "汉代", material: "竹木器", collection_level: "一级", storage_location: "恒温恒湿柜 B-03", current_condition: "FRAGILE" },
    { id: 3, relic_code: "SH-208", name: "明代绢本设色花鸟图轴", era: "明代", material: "丝织品", collection_level: "二级", storage_location: "书画库 C-21", current_condition: "DAMAGED" }
  ],
  damageRecord: [
    { id: 1, relic_id: 1, damage_type: "SURFACE_DEPOSIT", position_desc: "碗内壁与底足", severity: "MEDIUM", discovered_by: "周巡查", discovered_at: "2026-06-05T09:00:00Z", image_url: "/mock/image_url-1.png", status: "OPEN" },
    { id: 2, relic_id: 2, damage_type: "WARPING", position_desc: "第 3-7 枚简牍", severity: "HIGH", discovered_by: "周巡查", discovered_at: "2026-06-06T09:00:00Z", image_url: "/mock/image_url-2.png", status: "IN_TREATMENT" },
    { id: 3, relic_id: 3, damage_type: "TEAR", position_desc: "画心左上区域", severity: "HIGH", discovered_by: "周巡查", discovered_at: "2026-06-08T09:00:00Z", image_url: "/mock/image_url-3.png", status: "OPEN" }
  ],
  restorationPlan: [
    {
      id: 1, relic_id: 1, damage_record_id: 1, plan_title: "宋青瓷表面沉积物清洗方案", method: "软毛笔配合去离子水逐步清洗",
      risk_assessment: "釉面可能存在细微开片", approval_status: "SUBMITTED", owner_id: 2, owner_name: "陆修复",
      submitted_at: T0, approved_at: null, rejected_at: null, archived_at: null, rejection_reason: null, updated_at: T0,
      approval_records: [{ id: 1, plan_id: 1, action: "SUBMIT", actor_id: 2, actor_name: "陆修复", actor_role: "RESTORER", comment: "请专家审批", created_at: T0 }]
    },
    {
      id: 2, relic_id: 2, damage_record_id: 2, plan_title: "汉代竹简脱水定型方案", method: "乙醇梯度脱水后真空冷冻干燥",
      risk_assessment: "脱水过快会导致翘曲", approval_status: "APPROVED", owner_id: 2, owner_name: "陆修复",
      submitted_at: T1, approved_at: T1, rejected_at: null, archived_at: null, rejection_reason: null, updated_at: T1,
      approval_records: [
        { id: 2, plan_id: 2, action: "SUBMIT", actor_id: 2, actor_name: "陆修复", actor_role: "RESTORER", comment: "请审批", created_at: T1 },
        { id: 3, plan_id: 2, action: "APPROVE", actor_id: 3, actor_name: "沈专家", actor_role: "EXPERT", comment: "同意实施", created_at: T1 }
      ]
    },
    {
      id: 4, relic_id: 1, damage_record_id: 1, plan_title: "唐代丝织品残片加固方案", method: "蚕丝线丝网衬垫加固",
      risk_assessment: "染料遇水可能掉色", approval_status: "REJECTED", owner_id: 2, owner_name: "陆修复",
      submitted_at: T2, approved_at: null, rejected_at: T2, archived_at: null,
      rejection_reason: "风险评估缺少染料掉色试验，请补充后重新送审", updated_at: T2,
      approval_records: [
        { id: 4, plan_id: 4, action: "SUBMIT", actor_id: 2, actor_name: "陆修复", actor_role: "RESTORER", comment: "请审批", created_at: T2 },
        { id: 5, plan_id: 4, action: "REJECT", actor_id: 3, actor_name: "沈专家", actor_role: "EXPERT", comment: "风险评估缺少染料掉色试验，请补充后重新送审", created_at: T2 }
      ]
    }
  ] as RestorationPlan[],
  restorationStep: [
    { id: 1, plan_id: 2, step_order: 1, technique: "清洗除霉", material_used: "去离子水", operator_id: 2, operator_name: "陆修复", step_status: "FINISHED", started_at: T0, finished_at: T0, quality_note: "通过", created_at: T1, updated_at: T0 },
    { id: 2, plan_id: 2, step_order: 2, technique: "乙醇梯度脱水", material_used: "无水乙醇", operator_id: 2, operator_name: "陆修复", step_status: "IN_PROGRESS", started_at: T2, finished_at: null, quality_note: "", created_at: T1, updated_at: T2 },
    { id: 3, plan_id: 4, step_order: 1, technique: "丝网衬垫裁剪", material_used: "蚕丝丝网", operator_id: 2, operator_name: "陆修复", step_status: "FINISHED", started_at: T2, finished_at: T2, quality_note: "退回冻结", created_at: T2, updated_at: T2 },
    { id: 4, plan_id: 4, step_order: 2, technique: "衬垫缝合加固", material_used: "蚕丝线", operator_id: 2, operator_name: "陆修复", step_status: "PENDING", started_at: null, finished_at: null, quality_note: "", created_at: T2, updated_at: T2 }
  ] as RestorationStep[],
  imageVersion: [
    { id: 1, relic_id: 2, plan_id: 2, version_no: "v1", image_type: "BEFORE", file_path: "/mock/bamboo-before.jpg", capture_at: T1, note: "脱水前现状" },
    { id: 2, relic_id: 2, plan_id: 2, version_no: "v2", image_type: "DURING", file_path: "/mock/bamboo-during.jpg", capture_at: T2, note: "乙醇脱水后" }
  ]
};
