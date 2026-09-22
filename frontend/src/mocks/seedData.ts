/**
 * 本地种子镜像（禁止第三方 API）。结构与后端 /api 响应保持一致，
 * 供离线评审与构造器参考；运行时数据以后端内存数据库为准。
 */
export const mockData = {
  relicItem: [
    {
      id: 1,
      relic_code: "QY-CIQ-0001",
      name: "青瓷莲瓣纹碗",
      era: "南朝",
      material: "瓷",
      collection_level: "一级",
      storage_location: "陶瓷库 A-12",
      current_condition: "IN_RESTORATION"
    },
    {
      id: 2,
      relic_code: "SH-JIN-0207",
      name: "鎏金铜带扣",
      era: "西晋",
      material: "铜鎏金",
      collection_level: "二级",
      storage_location: "金属库 B-03",
      current_condition: "DAMAGED"
    },
    {
      id: 3,
      relic_code: "ZH-SHU-0331",
      name: "绢地云纹经卷残片",
      era: "唐",
      material: "丝织品",
      collection_level: "一级",
      storage_location: "织物库恒温柜 C-05",
      current_condition: "FRAGILE"
    }
  ],
  damageRecord: [
    {
      id: 1,
      relic_id: 1,
      damage_type: "裂隙",
      position_desc: "碗腹外侧纵向冲线，长约 4.2cm",
      severity: "HIGH",
      discovered_by: "陆修复",
      discovered_at: "2026-08-20T09:00:00Z",
      image_url: "/mock/damage-1.png",
      status: "IN_TREATMENT"
    },
    {
      id: 2,
      relic_id: 2,
      damage_type: "鎏金层起翘",
      position_desc: "带扣正面右侧边缘，约 2cm 起翘",
      severity: "MEDIUM",
      discovered_by: "陆修复",
      discovered_at: "2026-09-02T10:30:00Z",
      image_url: "/mock/damage-2.png",
      status: "OPEN"
    },
    {
      id: 3,
      relic_id: 3,
      damage_type: "酥粉与残缺",
      position_desc: "残片下边缘绢丝粉化，缺失约 6cm²",
      severity: "CRITICAL",
      discovered_by: "陆修复",
      discovered_at: "2026-08-28T14:00:00Z",
      image_url: "/mock/damage-3.png",
      status: "IN_TREATMENT"
    }
  ],
  restorationPlan: [
    {
      id: 1,
      relic_id: 1,
      damage_record_id: 1,
      plan_title: "青瓷碗冲线清洗黏接方案",
      method: "软毛刷配合去离子水清理裂隙，环氧树脂分段黏接，随色补配。",
      risk_assessment: "中：黏接剂固化放热可控，需控制夹持力度避免二次开裂。",
      approval_status: "APPROVED",
      owner_id: 1,
      approval_version: 1,
      reject_reason: null,
      submitted_at: "2026-08-21T03:00:00Z",
      approved_at: "2026-08-22T06:10:00Z",
      archived_at: null
    },
    {
      id: 2,
      relic_id: 2,
      damage_record_id: 2,
      plan_title: "鎏金带扣起翘回贴方案",
      method: "B72 丙酮溶液缓蚀定位，鎏金层显微回贴，微晶蜡封护。",
      risk_assessment: "低：溶剂挥发快，需局部围挡防止鎏金层应力回弹。",
      approval_status: "SUBMITTED",
      owner_id: 1,
      approval_version: 1,
      reject_reason: null,
      submitted_at: "2026-09-10T08:20:00Z",
      approved_at: null,
      archived_at: null
    },
    {
      id: 3,
      relic_id: 3,
      damage_record_id: 3,
      plan_title: "唐代经卷残片托裱加固方案",
      method: "丝蛋白树脂喷涂加固，同色绢本托裱，缺损处以补绢随形。",
      risk_assessment: "高：喷涂湿度变化可能引起绢丝收缩，需先做小样试验。",
      approval_status: "REJECTED",
      owner_id: 1,
      approval_version: 1,
      reject_reason: "丝蛋白树脂浓度未给出量化配比，且缺少小样试验合格判定标准，请补充后重新送审。",
      submitted_at: "2026-09-05T07:00:00Z",
      approved_at: null,
      archived_at: null
    }
  ],
  restorationStep: [
    {
      id: 1,
      plan_id: 1,
      step_order: 1,
      technique: "裂隙清理",
      material_used: "去离子水、软毛刷",
      operator_id: 1,
      step_status: "COMPLETED",
      registered_at: "2026-08-22T07:00:00Z",
      started_at: "2026-08-23T01:00:00Z",
      finished_at: "2026-08-23T03:30:00Z"
    },
    {
      id: 2,
      plan_id: 1,
      step_order: 2,
      technique: "分段黏接",
      material_used: "环氧树脂 E-51",
      operator_id: 1,
      step_status: "IN_PROGRESS",
      registered_at: "2026-08-22T07:05:00Z",
      started_at: "2026-08-24T02:00:00Z",
      finished_at: null
    },
    {
      id: 3,
      plan_id: 1,
      step_order: 3,
      technique: "随色补配",
      material_used: "矿物颜料、仿釉树脂",
      operator_id: null,
      step_status: "PENDING",
      registered_at: "2026-08-22T07:10:00Z",
      started_at: null,
      finished_at: null
    },
    {
      id: 4,
      plan_id: 3,
      step_order: 1,
      technique: "小样试验（草案）",
      material_used: "待定",
      operator_id: null,
      step_status: "PENDING",
      registered_at: "2026-09-06T08:00:00Z",
      started_at: null,
      finished_at: null
    }
  ],
  imageVersion: [
    {
      id: 1,
      relic_id: 1,
      plan_id: 1,
      version_no: "V1",
      image_type: "BEFORE",
      file_path: "/images/relic-1-before.jpg",
      capture_at: "2026-08-20T09:30:00Z",
      note: "修复前裂隙全景"
    },
    {
      id: 2,
      relic_id: 1,
      plan_id: 1,
      version_no: "V2",
      image_type: "EVIDENCE",
      file_path: "/images/relic-1-step2.jpg",
      capture_at: "2026-08-24T04:00:00Z",
      note: "第二步分段黏接过程影像"
    },
    {
      id: 3,
      relic_id: 3,
      plan_id: 3,
      version_no: "V1",
      image_type: "BEFORE",
      file_path: "/images/relic-3-before.jpg",
      capture_at: "2026-08-28T15:00:00Z",
      note: "残片酥粉区域显微照"
    }
  ]
} as const;
