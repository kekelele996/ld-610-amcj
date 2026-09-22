export const ImageType = ["BEFORE", "EVIDENCE", "AFTER"] as const;
export type ImageType = (typeof ImageType)[number];

export const ImageTypeText: Record<ImageType, string> = {
  BEFORE: "修复前",
  EVIDENCE: "过程影像",
  AFTER: "修复后"
};
