import fortuneData from "@/data/fortune.json";
import { buildCommentary } from "@/lib/fortune/commentary";
import { extractFortuneFeatures } from "@/lib/fortune/rules";
import {
  DISCLAIMER,
  FALLBACK_POEM,
  TAG_POOL
} from "@/lib/fortune/templates";
import type {
  FortuneCommentary,
  FortuneLibrary,
  FortuneRequest,
  FortuneResponse
} from "@/lib/fortune/types";

const toFixedFourTuple = (
  value: string[],
  fieldName: "poem" | "endings",
  fortuneId: string
): [string, string, string, string] => {
  if (value.length !== 4) {
    throw new Error(`${fieldName} for ${fortuneId} must contain exactly 4 items`);
  }

  return [value[0], value[1], value[2], value[3]];
};

const buildFortuneLibrary = (): FortuneLibrary => {
  return {
    meta: {
      generatedAt: fortuneData.meta.generatedAt,
      count: fortuneData.meta.count,
      source: fortuneData.meta.source
    },
    fortunes: fortuneData.fortunes.map((entry) => ({
      ...entry,
      poem: toFixedFourTuple(entry.poem, "poem", entry.id),
      endings: toFixedFourTuple(entry.endings, "endings", entry.id)
    }))
  };
};

const fortuneLibrary = buildFortuneLibrary();

const fnv1a = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash >>> 0;
};

const normalizeInput = (input: FortuneRequest): string => {
  return `${input.name.trim()}|${input.birthplace.trim()}|${input.birthDate}`;
};

const pickDistinctTags = (seed: number, motifs: string[]): [string, string, string] => {
  const motifTags = [...new Set(motifs)].slice(0, 3);
  const tags = [...motifTags];
  let cursor = seed;

  while (tags.length < 3) {
    tags.push(TAG_POOL[cursor % TAG_POOL.length]);
    cursor += 1;
  }

  return [tags[0], tags[1], tags[2]];
};

const buildFallback = (input: FortuneRequest): FortuneResponse => {
  const fallbackSeed = fnv1a(normalizeInput(input));
  const motifs = ["春光", "清川", "暖风"];
  const commentary: FortuneCommentary = buildCommentary({ motifs, season: "四时", region: "远岫", tone: "和缓" });

  return {
    fortuneId: `fortune_${fallbackSeed.toString(16)}`,
    poem: FALLBACK_POEM,
    commentary,
    motifs,
    interpretation: commentary,
    tags: pickDistinctTags(fallbackSeed, motifs),
    disclaimer: DISCLAIMER
  };
};

export const generateFortune = (input: FortuneRequest): FortuneResponse => {
  if (!fortuneLibrary.fortunes?.length) {
    throw new Error("fortune library is empty");
  }

  const seed = fnv1a(normalizeInput(input));
  const features = extractFortuneFeatures(input, seed);
  const entry = fortuneLibrary.fortunes[seed % fortuneLibrary.fortunes.length];

  const motifs = [...new Set(entry.motifs)].slice(0, 3);
  if (motifs.length < 2) {
    throw new Error("fortune entry motifs too small");
  }

  const commentary = buildCommentary({
    motifs,
    season: features.seasonImage,
    region: features.regionImage,
    tone: features.temperament
  });

  return {
    fortuneId: entry.id,
    poem: entry.poem,
    commentary,
    motifs,
    interpretation: commentary,
    tags: pickDistinctTags(seed, motifs),
    disclaimer: DISCLAIMER
  };
};

export const generateFortuneSafe = (input: FortuneRequest): FortuneResponse => {
  try {
    return generateFortune(input);
  } catch {
    return buildFallback(input);
  }
};
