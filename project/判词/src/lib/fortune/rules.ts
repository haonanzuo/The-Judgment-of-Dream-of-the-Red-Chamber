import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import type { FortuneFeatures, FortuneRequest } from "@/lib/fortune/types";

dayjs.extend(customParseFormat);

const seasonByMonth = [
  "冬灯",
  "早春",
  "春潮",
  "花影",
  "薰风",
  "夏雨",
  "长夏",
  "新秋",
  "清秋",
  "霜天",
  "寒云",
  "岁暮"
] as const;

const destinyKeywords = [
  "荣枯未定",
  "先苦后甘",
  "静水深流",
  "晚景见明",
  "逆风长成",
  "前折后舒",
  "心定事成",
  "缘迟福厚"
] as const;

const temperaments = ["心性澄明", "骨相坚忍", "情深识远", "外柔内定", "敏思善断", "重义轻名"] as const;

const turningHints = ["三十后稳", "离乡见机", "遇贵得助", "慢行反快", "守拙成器", "秋冬转旺"] as const;

const regionMapping: Array<{ keywords: string[]; image: string }> = [
  { keywords: ["北京", "天津", "河北", "山西", "内蒙古"], image: "朔风" },
  { keywords: ["上海", "江苏", "浙江", "安徽", "福建", "江西", "山东"], image: "江潮" },
  { keywords: ["广东", "广西", "海南", "深圳", "珠海"], image: "海雾" },
  { keywords: ["河南", "湖北", "湖南"], image: "平芜" },
  { keywords: ["重庆", "四川", "贵州", "云南", "西藏"], image: "山岚" },
  { keywords: ["陕西", "甘肃", "青海", "宁夏", "新疆"], image: "长风" },
  { keywords: ["辽宁", "吉林", "黑龙江"], image: "雪原" }
];

export const resolveRegionImage = (birthplace: string): string => {
  const normalized = birthplace.replace(/\s+/g, "");
  const hit = regionMapping.find((item) => item.keywords.some((k) => normalized.includes(k)));
  return hit?.image ?? "远岫";
};

export const extractFortuneFeatures = (input: FortuneRequest, seed: number): FortuneFeatures => {
  const parsed = dayjs(input.birthDate, "YYYY-MM-DD", true);
  if (!parsed.isValid()) {
    throw new Error("Invalid birth date");
  }

  const monthIndex = parsed.month();
  const day = parsed.date();

  return {
    seasonImage: seasonByMonth[monthIndex],
    regionImage: resolveRegionImage(input.birthplace),
    destinyKeyword: destinyKeywords[(seed + day) % destinyKeywords.length],
    temperament: temperaments[(seed + input.name.length) % temperaments.length],
    turningPointHint: turningHints[(seed + parsed.year()) % turningHints.length]
  };
};
