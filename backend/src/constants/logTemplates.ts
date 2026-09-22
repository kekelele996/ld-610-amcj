export const LOG_TEMPLATES = {
  RelicItem: ["RelicItem.create", "RelicItem.update", "RelicItem.status", "RelicItem.export", "RelicItem.archiveView"],
  DamageRecord: ["DamageRecord.create", "DamageRecord.update", "DamageRecord.status", "DamageRecord.export"],
  RestorationPlan: [
    "RestorationPlan.create",
    "RestorationPlan.update",
    "RestorationPlan.status",
    "RestorationPlan.export",
    "RestorationPlan.submit:{actor} submitted plan#{id} for approval v{version}",
    "RestorationPlan.approve:expert {actor} approved plan#{id} v{version}",
    "RestorationPlan.reject:expert {actor} rejected plan#{id} v{version}, reason: {reason}",
    "RestorationPlan.archive:{actor} archived plan#{id}"
  ],
  RestorationStep: [
    "RestorationStep.create",
    "RestorationStep.update",
    "RestorationStep.status",
    "RestorationStep.export",
    "RestorationStep.register:{actor} registered step#{id} on plan#{planId}",
    "RestorationStep.execute:{actor} moved step#{id} from {from} to {to}"
  ],
  ImageVersion: ["ImageVersion.create", "ImageVersion.update", "ImageVersion.status", "ImageVersion.export"],
  Auth: ["Auth.login:{actor} signed in as {role}", "Auth.denied:{path} blocked for role {role}"]
};
