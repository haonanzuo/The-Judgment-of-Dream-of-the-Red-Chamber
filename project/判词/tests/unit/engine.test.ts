import { describe, expect, it } from "vitest";

import { generateFortune, generateFortuneSafe } from "@/lib/fortune/engine";
import { getRhymeGroupId } from "@/lib/fortune/lexicon";

const hasDuplicateChars = (poem: [string, string, string, string]): boolean => {
  const chars = Array.from(poem.join(""));
  return new Set(chars).size !== chars.length;
};

describe("generateFortune", () => {
  it("同一输入应保持判词与意象稳定", () => {
    const input = {
      name: "林黛玉",
      birthplace: "苏州",
      birthDate: "1998-03-02"
    };

    const first = generateFortune(input);
    const second = generateFortune(input);

    expect(first.poem).toEqual(second.poem);
    expect(first.motifs).toEqual(second.motifs);
    expect(first.fortuneId).toEqual(second.fortuneId);
    expect(first.poem).toHaveLength(4);
    expect(first.tags).toHaveLength(3);
  });

  it("判词应为五言绝句，且第2、4句同韵部并无重复字词", () => {
    const result = generateFortune({
      name: "贾宝玉",
      birthplace: "北京",
      birthDate: "2000-11-25"
    });

    for (const line of result.poem) {
      expect(Array.from(line).length).toBe(5);
    }

    const tail2 = result.poem[1].slice(-1);
    const tail4 = result.poem[3].slice(-1);

    expect(getRhymeGroupId(tail2)).toBeTruthy();
    expect(getRhymeGroupId(tail2)).toBe(getRhymeGroupId(tail4));

    expect(result.motifs.length).toBeGreaterThanOrEqual(2);
    const commentaryText = `${result.commentary.disposition}${result.commentary.turningPoint}${result.commentary.advice}`;
    expect(commentaryText.length).toBeGreaterThanOrEqual(120);
    expect(commentaryText.length).toBeLessThanOrEqual(240);

    expect(new Set(result.poem).size).toBe(4);
    expect(hasDuplicateChars(result.poem)).toBe(false);
  });

  it("规则异常时走积极兜底输出", () => {
    const result = generateFortuneSafe({
      name: "王熙凤",
      birthplace: "金陵",
      birthDate: "not-a-date"
    });

    expect(result.poem).toEqual(["春风照晴川", "前程向暖安", "静行生慧宁", "来日满庭欢"]);
    expect(result.motifs.length).toBeGreaterThanOrEqual(2);
    expect(result.disclaimer).toContain("仅供娱乐");
    expect(hasDuplicateChars(result.poem)).toBe(false);
  });
});
