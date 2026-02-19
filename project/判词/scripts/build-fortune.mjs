import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const motifsPath = path.join(root, "src", "data", "motifs.json");
const templatesPath = path.join(root, "src", "data", "line_templates.json");
const outputPath = path.join(root, "src", "data", "fortune.json");

const motifsData = JSON.parse(fs.readFileSync(motifsPath, "utf-8"));
const templatesData = JSON.parse(fs.readFileSync(templatesPath, "utf-8"));

const unique = (arr) => [...new Set(arr)];
const charArray = (text) => Array.from(text);
const hasDupChars = (text) => {
  const chars = charArray(text);
  return new Set(chars).size !== chars.length;
};

const motifPool = unique([...Object.values(motifsData.seasonal).flat(), ...Object.values(motifsData.scenes).flat()]).filter(
  (word) => charArray(word).length === 2 && !hasDupChars(word)
);

const seasonPool = motifsData.seasonTokens.filter((word) => charArray(word).length === 2 && !hasDupChars(word));
const placePool = motifsData.placeTokens.filter((word) => charArray(word).length === 2 && !hasDupChars(word));
const scenePool = motifsData.sceneTokens.filter((word) => charArray(word).length === 2 && !hasDupChars(word));

if (motifPool.length < 800) {
  throw new Error(`motif pool too small: ${motifPool.length}`);
}

const templates = templatesData.templates;
if (templates.length < 300) {
  throw new Error(`template pool too small: ${templates.length}`);
}

const rhymeGroups = [
  { id: "ang", chars: ["光", "香", "扬", "长", "昌", "康"] },
  { id: "an", chars: ["安", "欢", "宽", "澜", "端", "然"] },
  { id: "ing", chars: ["明", "清", "宁", "盈", "兴", "星"] },
  { id: "ou", chars: ["秋", "舟", "悠", "游", "收", "柔"] }
];

const nonRhymeEndings = ["和", "新", "暖", "盛", "晖", "远", "朗", "定", "盈", "宁"];

const rhymeTemplates = templates.filter((tpl) => tpl.role === "rhyme" && tpl.placeholders.includes("motif"));

const pick = (pool, seed, offset) => {
  return pool[(seed + offset) % pool.length];
};

const selectUniqueToken = ({ pool, seed, offset, usedWords, usedChars }) => {
  for (let i = 0; i < pool.length; i += 1) {
    const candidate = pool[(seed + offset + i) % pool.length];
    if (usedWords.has(candidate)) continue;

    const chars = charArray(candidate);
    if (chars.some((ch) => usedChars.has(ch))) continue;

    usedWords.add(candidate);
    chars.forEach((ch) => usedChars.add(ch));
    return candidate;
  }

  return null;
};

const selectUniqueEnding = ({ pool, seed, offset, usedChars, excluded }) => {
  for (let i = 0; i < pool.length; i += 1) {
    const candidate = pool[(seed + offset + i) % pool.length];
    if (excluded.has(candidate)) continue;
    if (usedChars.has(candidate)) continue;

    usedChars.add(candidate);
    return candidate;
  }

  return null;
};

const renderTemplate = (pattern, vars) => {
  const rendered = pattern.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
  if (/\{\w+\}/.test(rendered)) {
    return null;
  }
  return rendered;
};

const isFiveChar = (line) => charArray(line).length === 5;
const hasRepeatWord = (lines) => new Set(lines).size !== lines.length;

const buildCommentary = (motifA, motifB) => {
  return {
    disposition: `你如${motifA}般清澈，心性稳健，做事常有定力。`,
    turningPoint: `当你以${motifB}的耐心持续推进，机缘会在中后段展开。`,
    advice: "守住当下节奏，持续积累，前路会越来越明朗。"
  };
};

const buildLine = ({ template, ending, seed, offset, usedWords, usedChars }) => {
  const vars = { ending };

  for (const placeholder of template.placeholders) {
    if (placeholder === "ending") continue;

    if (placeholder === "motif") {
      vars.motif = selectUniqueToken({ pool: motifPool, seed, offset: offset + 11, usedWords, usedChars });
      if (!vars.motif) return null;
      continue;
    }

    if (placeholder === "season") {
      vars.season = selectUniqueToken({ pool: seasonPool, seed, offset: offset + 13, usedWords, usedChars });
      if (!vars.season) return null;
      continue;
    }

    if (placeholder === "place") {
      vars.place = selectUniqueToken({ pool: placePool, seed, offset: offset + 17, usedWords, usedChars });
      if (!vars.place) return null;
      continue;
    }

    if (placeholder === "scene") {
      vars.scene = selectUniqueToken({ pool: scenePool, seed, offset: offset + 19, usedWords, usedChars });
      if (!vars.scene) return null;
      continue;
    }

    return null;
  }

  const line = renderTemplate(template.pattern, vars);
  if (!line || !isFiveChar(line)) return null;
  if (hasDupChars(line)) return null;

  return {
    line,
    motif: vars.motif
  };
};

const getCount = (map, key) => map.get(key) ?? 0;
const bump = (map, key, delta = 1) => {
  map.set(key, getCount(map, key) + delta);
};

const motifUsage = new Map();
const motifPairUsage = new Map();
const rhymeUsage = new Map();
const endingUsage = new Map();
const templateUsage = new Map();
const seenPoems = new Set();

const buildCandidate = (seedBase, variation) => {
  const seed = seedBase + variation * 97 + variation * variation * 13;

  const rhymeGroup = pick(rhymeGroups, seed, 1 + variation * 3);
  const usedChars = new Set();
  const usedWords = new Set();

  const line2Ending = selectUniqueEnding({
    pool: rhymeGroup.chars,
    seed,
    offset: 3 + variation,
    usedChars,
    excluded: new Set()
  });
  if (!line2Ending) return null;

  const line4Ending = selectUniqueEnding({
    pool: rhymeGroup.chars,
    seed,
    offset: 7 + variation,
    usedChars,
    excluded: new Set([line2Ending])
  });
  if (!line4Ending) return null;

  const line1Ending = selectUniqueEnding({
    pool: nonRhymeEndings,
    seed,
    offset: 11 + variation,
    usedChars,
    excluded: new Set([line2Ending, line4Ending])
  });
  if (!line1Ending) return null;

  const line3Ending = selectUniqueEnding({
    pool: nonRhymeEndings,
    seed,
    offset: 13 + variation,
    usedChars,
    excluded: new Set([line1Ending, line2Ending, line4Ending])
  });
  if (!line3Ending) return null;

  const t1 = pick(rhymeTemplates, seed, 31 + variation * 5);
  const t2 = pick(rhymeTemplates, seed, 37 + variation * 7);
  const t3 = pick(rhymeTemplates, seed, 41 + variation * 11);
  const t4 = pick(rhymeTemplates, seed, 43 + variation * 13);

  const built1 = buildLine({ template: t1, ending: line1Ending, seed, offset: 101, usedWords, usedChars });
  const built2 = buildLine({ template: t2, ending: line2Ending, seed, offset: 151, usedWords, usedChars });
  const built3 = buildLine({ template: t3, ending: line3Ending, seed, offset: 211, usedWords, usedChars });
  const built4 = buildLine({ template: t4, ending: line4Ending, seed, offset: 251, usedWords, usedChars });

  if (!built1 || !built2 || !built3 || !built4) return null;

  const poem = [built1.line, built2.line, built3.line, built4.line];
  if (poem.some((line) => !isFiveChar(line))) return null;
  if (hasRepeatWord(poem)) return null;

  const fullChars = charArray(poem.join(""));
  if (new Set(fullChars).size !== fullChars.length) return null;

  const motifsUsed = unique([built1.motif, built2.motif, built3.motif, built4.motif].filter(Boolean));
  if (motifsUsed.length < 2) return null;

  const tail2 = poem[1].slice(-1);
  const tail4 = poem[3].slice(-1);
  if (!(rhymeGroup.chars.includes(tail2) && rhymeGroup.chars.includes(tail4))) return null;

  const poemKey = poem.join("|");
  const pair = [motifsUsed[0], motifsUsed[1]].sort();
  const motifPairKey = `${pair[0]}|${pair[1]}`;
  const templateIds = [t1.id, t2.id, t3.id, t4.id];

  const motifScore = motifsUsed.reduce((sum, motif) => sum + getCount(motifUsage, motif), 0);
  const pairScore = getCount(motifPairUsage, motifPairKey);
  const rhymeScore = getCount(rhymeUsage, rhymeGroup.id);
  const endingScore = getCount(endingUsage, tail2) + getCount(endingUsage, tail4);
  const templateScore = templateIds.reduce((sum, id) => sum + getCount(templateUsage, id), 0);

  const score = motifScore * 6 + pairScore * 8 + rhymeScore * 3 + endingScore + templateScore;

  return {
    tie: seed,
    score,
    poemKey,
    motifsUsed,
    motifPairKey,
    rhymeGroupId: rhymeGroup.id,
    tail2,
    tail4,
    templateIds,
    entry: {
      poem,
      motifs: motifsUsed.slice(0, 3),
      commentary: buildCommentary(motifsUsed[0], motifsUsed[1]),
      rhymeGroup: rhymeGroup.id,
      endings: [poem[0].slice(-1), tail2, poem[2].slice(-1), tail4]
    }
  };
};

const applyUsage = (candidate) => {
  for (const motif of candidate.motifsUsed) {
    bump(motifUsage, motif);
  }

  bump(motifPairUsage, candidate.motifPairKey);
  bump(rhymeUsage, candidate.rhymeGroupId);
  bump(endingUsage, candidate.tail2);
  bump(endingUsage, candidate.tail4);

  for (const templateId of candidate.templateIds) {
    bump(templateUsage, templateId);
  }

  seenPoems.add(candidate.poemKey);
};

const fortunes = [];
const targetCount = 22000;
const minRequired = 20000;
const candidateFanout = 14;
let cursor = 0;

while (fortunes.length < targetCount && cursor < targetCount * 520) {
  const seedBase = cursor * 17 + 29;
  let best = null;

  for (let variation = 0; variation < candidateFanout; variation += 1) {
    const candidate = buildCandidate(seedBase, variation);
    if (!candidate) continue;
    if (seenPoems.has(candidate.poemKey)) continue;

    if (!best || candidate.score < best.score || (candidate.score === best.score && candidate.tie < best.tie)) {
      best = candidate;
    }
  }

  if (!best) {
    cursor += 1;
    continue;
  }

  applyUsage(best);

  fortunes.push({
    id: `fortune_${String(fortunes.length + 1).padStart(5, "0")}`,
    ...best.entry
  });

  cursor += 1;
}

if (fortunes.length < minRequired) {
  throw new Error(`failed to build enough fortunes: ${fortunes.length}`);
}

const payload = {
  meta: {
    generatedAt: new Date().toISOString(),
    count: fortunes.length,
    source: "motifs+line_templates+low-frequency-priority",
    strategy: {
      kind: "low-frequency-priority",
      candidateFanout,
      minRequired,
      targetCount
    }
  },
  fortunes
};

fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`fortune entries: ${fortunes.length}`);
