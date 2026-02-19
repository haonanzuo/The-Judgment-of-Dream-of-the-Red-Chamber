import { NON_RHYME_ENDINGS, POEM_LEXICON, RHYME_GROUPS } from "@/lib/fortune/lexicon";
import type { FortuneFeatures } from "@/lib/fortune/types";

export const DISCLAIMER = "仅供娱乐与文化体验，不构成现实建议。";

export const TAG_POOL = ["向阳", "清和", "笃定", "丰盈", "顺遂", "进取", "安然", "开阔", "和畅", "回甘"] as const;

export const FALLBACK_POEM: [string, string, string, string] = ["春风照晴川", "前程向暖安", "静行生慧宁", "来日满庭欢"];

export const FALLBACK_INTERPRETATION = {
  disposition: "你心性温厚，做事有定力，越到后程越容易显出优势。",
  turningPoint: "你的机会多在持续投入之后出现，稳步推进更容易迎来好消息。",
  advice: "保持长期主义，把手上的小事做扎实，结果会朝更好的方向发展。"
};

const pick = <T>(pool: readonly T[], seed: number, offset: number): T => {
  return pool[(seed + offset) % pool.length];
};

const isFiveChar = (line: string): boolean => {
  return Array.from(line).length === 5;
};

const nextDifferentChar = (pool: readonly string[], current: string): string => {
  const idx = pool.indexOf(current);
  if (idx < 0) {
    return pool[0];
  }
  return pool[(idx + 1) % pool.length];
};

const pickNonRhymeEnding = (seed: number, offset: number, excluded: string[]): string => {
  let value = pick(NON_RHYME_ENDINGS, seed, offset);
  let cursor = 0;
  while (excluded.includes(value) && cursor < NON_RHYME_ENDINGS.length) {
    value = NON_RHYME_ENDINGS[(offset + seed + cursor + 1) % NON_RHYME_ENDINGS.length];
    cursor += 1;
  }
  return value;
};

const composeFiveCharLine = (lead: string, mid: string, ending: string): string => {
  return `${lead}${mid}${ending}`;
};

export const composePoemFromLexicon = (
  seed: number,
  _features: FortuneFeatures
): [string, string, string, string] => {
  const rhymeGroup = pick(RHYME_GROUPS, seed, 100);
  const line2Ending = pick(rhymeGroup.chars, seed, 101);

  let line4Ending = pick(rhymeGroup.chars, seed, 107);
  if (line4Ending === line2Ending) {
    line4Ending = nextDifferentChar(rhymeGroup.chars, line2Ending);
  }

  const line1Ending = pickNonRhymeEnding(seed, 1, [line2Ending, line4Ending]);
  const line3Ending = pickNonRhymeEnding(seed, 3, [line1Ending, line2Ending, line4Ending]);

  const line1 = composeFiveCharLine(
    pick(POEM_LEXICON.line1Lead, seed, 11),
    pick(POEM_LEXICON.line1Mid, seed, 12),
    line1Ending
  );
  const line2 = composeFiveCharLine(
    pick(POEM_LEXICON.line2Lead, seed, 13),
    pick(POEM_LEXICON.line2Mid, seed, 14),
    line2Ending
  );
  const line3 = composeFiveCharLine(
    pick(POEM_LEXICON.line3Lead, seed, 15),
    pick(POEM_LEXICON.line3Mid, seed, 16),
    line3Ending
  );
  const line4 = composeFiveCharLine(
    pick(POEM_LEXICON.line4Lead, seed, 17),
    pick(POEM_LEXICON.line4Mid, seed, 18),
    line4Ending
  );

  const poem: [string, string, string, string] = [line1, line2, line3, line4];
  if (!poem.every(isFiveChar)) {
    return FALLBACK_POEM;
  }

  return poem;
};
