import { describe, expect, it } from "vitest";

import { buildCommentaryWithMeta } from "@/lib/fortune/commentary";

const FORBIDDEN = ["第一句", "第二句", "第三句", "第四句", "这句意思是"];

const splitSentences = (text: string): string[] => {
  return text
    .split(/(?<=[。！？])/u)
    .map((item) => item.trim())
    .filter(Boolean);
};

describe("buildCommentary", () => {
  it("同一输入应生成稳定解签，避免 SSR/CSR 文本不一致", () => {
    const input = {
      motifs: ["花影", "松风", "清波"],
      season: "春朝",
      region: "江城",
      tone: "温润"
    };

    const first = buildCommentaryWithMeta(input);
    const second = buildCommentaryWithMeta(input);

    expect(first.meta.modeId).toBe(second.meta.modeId);
    expect(first.meta.text).toBe(second.meta.text);
    expect(first.commentary).toEqual(second.commentary);
  });

  it("连续生成 50 次应满足长度、意象提及、禁用词与结构分布要求", () => {
    const motifsPool = ["花影", "松风", "清波", "柳烟", "秋月", "晴岚", "夜灯", "山色", "竹露", "云溪"];
    const seasonPool = ["春朝", "夏晨", "秋晓", "冬晴", "春和", "秋明"];
    const regionPool = ["江城", "山岚", "海门", "平芜", "远岫", "桥西"];
    const tonePool = ["温润", "沉静", "澄明", "笃定", "和缓", "清朗"];

    const modeCount = new Map<string, number>();
    let totalSentences = 0;
    let youStarted = 0;

    for (let i = 0; i < 50; i += 1) {
      const motifs = [
        motifsPool[i % motifsPool.length],
        motifsPool[(i + 3) % motifsPool.length],
        motifsPool[(i + 6) % motifsPool.length]
      ];

      const { commentary, meta } = buildCommentaryWithMeta({
        motifs,
        season: seasonPool[i % seasonPool.length],
        region: regionPool[i % regionPool.length],
        tone: tonePool[i % tonePool.length]
      });

      expect(meta.totalLength).toBeGreaterThanOrEqual(120);
      expect(meta.totalLength).toBeLessThanOrEqual(240);

      const text = meta.text;
      expect(motifs.some((motif) => text.includes(motif))).toBe(true);

      for (const token of FORBIDDEN) {
        expect(text.includes(token)).toBe(false);
      }

      modeCount.set(meta.modeId, (modeCount.get(meta.modeId) ?? 0) + 1);

      const sentences = splitSentences([commentary.disposition, commentary.turningPoint, commentary.advice].join(""));
      for (const sentence of sentences) {
        totalSentences += 1;
        if (sentence.startsWith("你")) {
          youStarted += 1;
        }
      }
    }

    const ratio = totalSentences === 0 ? 0 : youStarted / totalSentences;
    expect(ratio).toBeLessThan(0.1);

    const maxModeCount = Math.max(...modeCount.values());
    expect(modeCount.size).toBeGreaterThanOrEqual(6);
    expect(maxModeCount).toBeLessThan(25);
  });
});
