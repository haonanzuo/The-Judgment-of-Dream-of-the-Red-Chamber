import adviceData from "@/data/commentary/advice.json";
import insightData from "@/data/commentary/insight.json";
import motifHooksData from "@/data/commentary/motif_hooks.json";
import openingData from "@/data/commentary/opening.json";
import tensionData from "@/data/commentary/tension.json";
import type { FortuneCommentary } from "@/lib/fortune/types";

type BuildCommentaryInput = {
  motifs: string[];
  season: string;
  region: string;
  tone: string;
};

type SegmentType = "opening" | "tension" | "insight" | "advice" | "motif_hook";

type StructureMode = {
  id: string;
  segments: SegmentType[];
};

type SentencePool = {
  meta: {
    total: number;
    minRequired: number;
    kind: string;
  };
  lines: string[];
};

type BuildCommentaryMeta = {
  modeId: string;
  paragraphCount: number;
  totalLength: number;
  youStartRatio: number;
  text: string;
};

type BuildCommentaryResult = {
  commentary: FortuneCommentary;
  meta: BuildCommentaryMeta;
};

const openingPool = openingData as SentencePool;
const tensionPool = tensionData as SentencePool;
const insightPool = insightData as SentencePool;
const advicePool = adviceData as SentencePool;
const motifHookPool = motifHooksData as SentencePool;

const FORBIDDEN_TOKENS = ["第一句", "第二句", "第三句", "第四句", "这句意思是"];

const MODES: StructureMode[] = [
  { id: "M1", segments: ["opening", "tension", "advice"] },
  { id: "M2", segments: ["tension", "insight"] },
  { id: "M3", segments: ["motif_hook", "insight", "tension"] },
  { id: "M4", segments: ["insight", "advice"] },
  { id: "M5", segments: ["opening", "motif_hook", "insight"] },
  { id: "M6", segments: ["motif_hook", "tension", "advice"] },
  { id: "M7", segments: ["opening", "insight"] },
  { id: "M8", segments: ["tension", "motif_hook", "advice"] },
  { id: "M9", segments: ["motif_hook"] },
  { id: "M10", segments: ["insight", "motif_hook", "advice"] }
];

const fnv1a = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash >>> 0;
};

const getPoolByType = (type: SegmentType): string[] => {
  if (type === "opening") return openingPool.lines;
  if (type === "tension") return tensionPool.lines;
  if (type === "insight") return insightPool.lines;
  if (type === "advice") return advicePool.lines;
  return motifHookPool.lines;
};

const sanitize = (sentence: string): string => {
  let out = sentence;
  for (const token of FORBIDDEN_TOKENS) {
    out = out.replaceAll(token, "");
  }
  return out;
};

const startsWithYou = (sentence: string): boolean => {
  return sentence.trim().startsWith("你");
};

const splitSentences = (paragraph: string): string[] => {
  return paragraph
    .split(/(?<=[。！？])/u)
    .map((item) => item.trim())
    .filter(Boolean);
};

const renderHook = (template: string, input: BuildCommentaryInput, motifA: string, motifB: string): string => {
  return template
    .replaceAll("{motifA}", motifA)
    .replaceAll("{motifB}", motifB)
    .replaceAll("{season}", input.season)
    .replaceAll("{region}", input.region)
    .replaceAll("{tone}", input.tone);
};

const pickSentence = (
  type: SegmentType,
  seed: number,
  offset: number,
  used: Set<string>,
  input: BuildCommentaryInput,
  motifA: string,
  motifB: string,
  previousStartsYou: boolean
): string => {
  const pool = getPoolByType(type);
  for (let i = 0; i < pool.length; i += 1) {
    const idx = (seed + offset + i) % pool.length;
    const raw = pool[idx];
    const rendered = sanitize(type === "motif_hook" ? renderHook(raw, input, motifA, motifB) : raw);
    if (!rendered) continue;
    if (used.has(rendered)) continue;
    if (previousStartsYou && startsWithYou(rendered)) continue;
    used.add(rendered);
    return rendered;
  }

  const fallbackRaw = pool[(seed + offset) % pool.length];
  return sanitize(type === "motif_hook" ? renderHook(fallbackRaw, input, motifA, motifB) : fallbackRaw);
};

const countYouStartRatio = (paragraphs: string[]): number => {
  const sentences = paragraphs.flatMap((p) => splitSentences(p));
  if (sentences.length === 0) return 0;

  let youCount = 0;
  for (const sentence of sentences) {
    if (startsWithYou(sentence)) {
      youCount += 1;
    }
  }
  return youCount / sentences.length;
};

const normalizeYouStarts = (paragraphs: string[]): string[] => {
  const out = [...paragraphs];
  const totalSentences = out.flatMap((item) => splitSentences(item)).length;
  const maxAllowed = Math.floor(totalSentences * 0.1);
  let seenYou = 0;

  for (let i = 0; i < out.length; i += 1) {
    const sentences = splitSentences(out[i]);
    const rewritten = sentences.map((sentence, idx) => {
      let current = sentence;
      const prev = idx > 0 ? sentences[idx - 1] : "";

      if (startsWithYou(current)) {
        seenYou += 1;
        if (startsWithYou(prev) || seenYou > maxAllowed) {
          current = current.replace(/^你/u, "此刻");
        }
      }

      return current;
    });

    out[i] = rewritten.join("");
  }

  return out;
};

const textLength = (paragraphs: string[]): number => {
  return paragraphs.join("").length;
};

const ensureMotifMention = (paragraphs: string[], motifA: string, motifB: string): string[] => {
  const text = paragraphs.join("");
  if (text.includes(motifA) || text.includes(motifB)) {
    return paragraphs;
  }

  const injected = `${motifA}与${motifB}在眼前交叠，像是在提醒许多事可以循着自身节拍推进。`;
  const out = [...paragraphs];
  out[0] = `${injected}${out[0]}`;
  return out;
};

const appendSentence = (
  paragraphs: string[],
  mode: StructureMode,
  input: BuildCommentaryInput,
  motifA: string,
  motifB: string,
  used: Set<string>,
  seed: number,
  round: number
): string[] => {
  const out = [...paragraphs];
  const paragraphCount = mode.segments.length;
  const maxPerParagraph = paragraphCount === 1 ? 6 : paragraphCount === 2 ? 4 : 3;

  for (let i = 0; i < paragraphCount; i += 1) {
    const sentences = splitSentences(out[i]);
    if (sentences.length >= maxPerParagraph) continue;

    const type = mode.segments[i];
    const extraType: SegmentType = type === "opening" ? "insight" : type === "tension" ? "insight" : "advice";
    const candidate = pickSentence(
      extraType,
      seed,
      500 + round * 17 + i * 13,
      used,
      input,
      motifA,
      motifB,
      startsWithYou(sentences[sentences.length - 1] ?? "")
    );

    out[i] = `${out[i]}${candidate}`;
    return out;
  }

  return out;
};

const fitLength = (
  paragraphs: string[],
  mode: StructureMode,
  input: BuildCommentaryInput,
  motifA: string,
  motifB: string,
  used: Set<string>,
  seed: number
): string[] => {
  let out = [...paragraphs];
  let round = 0;

  while (textLength(out) < 120 && round < 14) {
    out = appendSentence(out, mode, input, motifA, motifB, used, seed, round);
    round += 1;
  }

  if (textLength(out) < 120) {
    const padding = `${motifA}与${motifB}相映之间，许多念头会在缓慢推进里自然归位。`;
    const last = out.length - 1;
    out[last] = `${out[last]}${padding}`;
  }

  while (textLength(out) > 240) {
    const index = out.length - 1;
    const sentences = splitSentences(out[index]);
    if (sentences.length <= 1) {
      out[index] = out[index].slice(0, Math.max(0, 240 - textLength(out.slice(0, index))));
      break;
    }
    sentences.pop();
    out[index] = sentences.join("");
  }

  return out;
};

const toCommentary = (paragraphs: string[]): FortuneCommentary => {
  return {
    disposition: paragraphs[0] ?? "",
    turningPoint: paragraphs[1] ?? "",
    advice: paragraphs[2] ?? ""
  };
};

export const buildCommentaryWithMeta = (input: BuildCommentaryInput): BuildCommentaryResult => {
  const motifA = input.motifs[0] ?? "清风";
  const motifB = input.motifs[1] ?? input.motifs[0] ?? "明月";
  const seed = fnv1a(`${input.motifs.join("|")}|${input.season}|${input.region}|${input.tone}`);
  const mode = MODES[seed % MODES.length];

  const used = new Set<string>();
  const paragraphs = mode.segments.map((segment, idx) => {
    return pickSentence(segment, seed, 100 + idx * 31, used, input, motifA, motifB, false);
  });

  let normalized = ensureMotifMention(paragraphs, motifA, motifB);
  normalized = fitLength(normalized, mode, input, motifA, motifB, used, seed);
  normalized = normalizeYouStarts(normalized);

  const commentary = toCommentary(normalized);
  const text = [commentary.disposition, commentary.turningPoint, commentary.advice].join("");

  return {
    commentary,
    meta: {
      modeId: mode.id,
      paragraphCount: mode.segments.length,
      totalLength: text.length,
      youStartRatio: countYouStartRatio(normalized),
      text
    }
  };
};

export const buildCommentary = (input: BuildCommentaryInput): FortuneCommentary => {
  return buildCommentaryWithMeta(input).commentary;
};
