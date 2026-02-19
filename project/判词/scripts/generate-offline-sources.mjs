import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "src", "data");

const unique = (arr) => [...new Set(arr)];

const expandPairs = (prefixes, suffixes, limit) => {
  const out = [];
  for (const p of prefixes) {
    for (const s of suffixes) {
      if (out.length >= limit) return out;
      out.push(`${p}${s}`);
    }
  }
  return out;
};

const buildCategory = (prefixes, suffixes, rawLimit, take) => {
  return unique(expandPairs(prefixes, suffixes, rawLimit)).slice(0, take);
};

const seasonal = {
  spring: buildCategory(
    [
      "春", "柳", "花", "莺", "晴", "暖", "芳", "新", "锦", "晓", "柔", "青", "碧", "和", "晨", "轻", "烟", "桃", "杏", "燕", "兰", "陌", "汀", "溪"
    ],
    [
      "烟", "光", "风", "雨", "枝", "色", "晖", "影", "声", "波", "岚", "意", "姿", "韵", "涛", "华", "露", "香", "心", "梦", "痕", "潮", "霞", "天"
    ],
    960,
    820
  ),
  summer: buildCategory(
    [
      "夏", "荷", "蝉", "晴", "碧", "云", "炎", "翠", "晚", "微", "清", "长", "澄", "晨", "海", "松", "兰", "蒲", "荷", "池", "槐", "岚", "汀", "湾"
    ],
    [
      "影", "声", "光", "风", "雨", "波", "岚", "涛", "色", "意", "辉", "梦", "香", "露", "华", "澜", "吟", "姿", "潮", "心", "天", "痕", "野", "晚"
    ],
    960,
    820
  ),
  autumn: buildCategory(
    [
      "秋", "枫", "霜", "桂", "雁", "清", "寒", "晓", "明", "高", "澄", "素", "远", "丹", "疏", "长", "碧", "露", "庭", "山", "月", "云", "江", "渚"
    ],
    [
      "月", "光", "声", "影", "色", "风", "波", "天", "云", "意", "香", "晖", "露", "岚", "姿", "华", "涛", "吟", "痕", "潮", "心", "霁", "野", "晚"
    ],
    960,
    820
  ),
  winter: buildCategory(
    [
      "冬", "雪", "梅", "寒", "冰", "晓", "朔", "银", "素", "清", "长", "玉", "霁", "远", "疏", "松", "竹", "岭", "关", "庭", "檐", "川", "野", "港"
    ],
    [
      "光", "影", "风", "声", "月", "色", "天", "霜", "云", "辉", "梦", "意", "韵", "姿", "华", "吟", "露", "香", "潮", "痕", "心", "夜", "岚", "野"
    ],
    960,
    820
  )
};

const scenes = {
  mountain_water: buildCategory(
    [
      "山", "江", "溪", "泉", "峰", "岚", "石", "林", "涧", "川", "渚", "松", "岭", "壑", "崖", "岩", "滩", "汀", "瀑", "潭", "峡", "岫", "浦", "洲"
    ],
    [
      "色", "影", "声", "光", "风", "雨", "月", "烟", "波", "岫", "意", "涛", "姿", "华", "韵", "吟", "露", "香", "潮", "痕", "野", "天", "梦", "心"
    ],
    760,
    560
  ),
  night: buildCategory(
    [
      "夜", "月", "星", "灯", "霜", "宵", "更", "清", "静", "微", "素", "明", "河", "窗", "梦", "庭", "晓", "寒", "檐", "街", "巷", "桥", "钟", "砧"
    ],
    [
      "色", "影", "声", "光", "风", "雨", "意", "梦", "辉", "河", "波", "庭", "吟", "露", "香", "韵", "华", "岚", "潮", "心", "痕", "天", "野", "霁"
    ],
    760,
    560
  ),
  farewell: buildCategory(
    [
      "别", "离", "送", "折", "长", "远", "归", "怀", "留", "青", "故", "临", "亭", "桥", "舟", "关", "驿", "渡", "客", "门", "岸", "堤", "陌", "云"
    ],
    [
      "柳", "舟", "帆", "歌", "路", "桥", "云", "潮", "梦", "天", "影", "心", "声", "雨", "风", "月", "光", "意", "痕", "尘", "野", "霁", "华", "岚"
    ],
    760,
    560
  ),
  journey: buildCategory(
    [
      "行", "征", "旅", "客", "驿", "长", "远", "轻", "高", "平", "晨", "晓", "途", "边", "尘", "关", "川", "岭", "桥", "陌", "亭", "野", "港", "渡"
    ],
    [
      "路", "程", "云", "风", "帆", "马", "桥", "月", "光", "歌", "尘", "岚", "影", "雨", "声", "意", "色", "潮", "痕", "天", "梦", "心", "野", "霁"
    ],
    760,
    560
  ),
  riverside_city: buildCategory(
    [
      "城", "楼", "巷", "桥", "市", "津", "渡", "台", "陌", "庭", "坊", "街", "埠", "栏", "窗", "堤", "亭", "港", "阙", "郭", "门", "街", "岸", "岸"
    ],
    [
      "灯", "影", "声", "雨", "风", "月", "霞", "潮", "烟", "梦", "歌", "色", "光", "意", "韵", "华", "吟", "香", "痕", "天", "野", "心", "霁", "岚"
    ],
    760,
    560
  ),
  garden: buildCategory(
    [
      "园", "亭", "台", "榭", "栏", "径", "池", "花", "柳", "竹", "兰", "荷", "梅", "石", "窗", "桥", "岸", "廊", "槛", "阁", "堂", "篱", "堤", "汀"
    ],
    [
      "影", "香", "风", "雨", "月", "光", "声", "露", "色", "意", "晖", "梦", "华", "韵", "姿", "吟", "烟", "波", "痕", "心", "潮", "天", "野", "霁"
    ],
    760,
    560
  ),
  frontier: buildCategory(
    [
      "塞", "关", "边", "戍", "烽", "旌", "沙", "漠", "胡", "朔", "雁", "铁", "霜", "月", "寒", "长", "孤", "天", "戈", "垒", "陇", "碛", "营", "驼"
    ],
    [
      "风", "月", "云", "沙", "雪", "声", "影", "光", "色", "意", "歌", "路", "尘", "潮", "烟", "岚", "韵", "吟", "痕", "天", "野", "心", "梦", "霁"
    ],
    760,
    560
  ),
  pastoral: buildCategory(
    [
      "田", "畴", "陌", "桑", "稻", "麦", "篱", "牧", "村", "舍", "垄", "笠", "犁", "野", "炊", "井", "溪", "庐", "桥", "堰", "圃", "坡", "岭", "坞"
    ],
    [
      "烟", "风", "雨", "月", "光", "声", "影", "色", "香", "歌", "梦", "意", "波", "露", "晖", "岚", "韵", "华", "痕", "心", "潮", "天", "野", "霁"
    ],
    760,
    560
  ),
  river_lake: buildCategory(
    [
      "湖", "浦", "汀", "洲", "渚", "湾", "港", "渡", "津", "堤", "桥", "舟", "棹", "帆", "潮", "浪", "波", "滨", "岸", "浜", "溪", "潭", "泓", "沙"
    ],
    [
      "风", "月", "云", "雨", "光", "影", "声", "色", "烟", "波", "意", "梦", "潮", "华", "韵", "吟", "痕", "心", "野", "天", "霁", "岚", "露", "香"
    ],
    760,
    560
  ),
  temple: buildCategory(
    [
      "寺", "钟", "塔", "斋", "禅", "庭", "廊", "檐", "松", "石", "碑", "经", "灯", "香", "磬", "门", "院", "林", "坛", "台", "阶", "窗", "阁", "庵"
    ],
    [
      "声", "影", "光", "风", "雨", "月", "色", "烟", "云", "意", "梦", "华", "韵", "吟", "露", "香", "岚", "心", "痕", "野", "天", "潮", "霁", "波"
    ],
    760,
    560
  ),
  dawn_dusk: buildCategory(
    [
      "晨", "晓", "暮", "昏", "夕", "曦", "暝", "霞", "霁", "晴", "阴", "云", "风", "灯", "钟", "桥", "巷", "城", "山", "江", "渚", "汀", "岸", "岭"
    ],
    [
      "光", "影", "声", "色", "风", "雨", "云", "烟", "意", "梦", "波", "岚", "华", "韵", "吟", "露", "香", "潮", "痕", "心", "野", "天", "霁", "月"
    ],
    760,
    560
  ),
  study: buildCategory(
    [
      "书", "卷", "砚", "墨", "笺", "窗", "案", "灯", "笔", "琴", "棋", "帖", "纸", "香", "帘", "几", "架", "庭", "廊", "斋", "阁", "台", "堂", "榻"
    ],
    [
      "影", "光", "声", "风", "雨", "月", "色", "烟", "意", "梦", "心", "痕", "韵", "华", "吟", "露", "香", "潮", "岚", "野", "天", "霁", "波", "云"
    ],
    760,
    560
  )
};

const seasonTokens = [
  "春朝", "春晖", "春和", "春霁", "春岚", "春汀", "春陌", "春澜", "夏晨", "夏清", "夏岚", "夏霁", "夏汀", "夏港", "夏川", "夏湾",
  "秋晓", "秋明", "秋澄", "秋霁", "秋汀", "秋渚", "秋湾", "秋岫", "冬晴", "冬霁", "冬清", "冬晓", "冬岭", "冬港", "冬川", "冬陌"
];

const placeTokens = [
  "江城", "山城", "柳岸", "松冈", "云岭", "清川", "海门", "桥西", "竹坞", "兰渚", "花洲", "玉关", "长亭", "平沙", "霞浦", "春台",
  "石湾", "烟浦", "云汀", "枫桥", "月堤", "青陌", "寒关", "澄湾", "霁港", "远岫", "晴汀", "沧洲", "雪岭", "松坞", "溪桥", "花港",
  "潮津", "云桥", "鹤汀", "竹溪", "兰湾", "星渡", "晴坂", "青渚", "柳堤", "霜岭", "月港", "松涧", "烟堤", "云港", "石汀", "湖亭"
];

const sceneTokens = [
  "山水", "夜月", "行旅", "离亭", "江天", "云岫", "松风", "花径", "竹影", "清波", "秋声", "春色", "边塞", "田园", "楼阁", "烟雨",
  "湖港", "晨昏", "寺钟", "书斋", "汀洲", "桥市", "渔歌", "林泉", "月庭", "霁野", "云潮", "风岚", "沙关", "柳堤", "荷池", "梅窗"
];

const allMotifs = unique([...Object.values(seasonal).flat(), ...Object.values(scenes).flat()]);

const motifs = {
  meta: {
    style: "tang-poetry-inspired",
    total: allMotifs.length,
    minRequired: 800
  },
  seasonal,
  scenes,
  seasonTokens,
  placeTokens,
  sceneTokens
};

const patternFamilies = [
  { pattern: "{season}{motif}{ending}", role: "rhyme" },
  { pattern: "{place}{motif}{ending}", role: "rhyme" },
  { pattern: "{scene}{motif}{ending}", role: "rhyme" },
  { pattern: "{motif}{season}{ending}", role: "rhyme" },
  { pattern: "{motif}{place}{ending}", role: "rhyme" },
  { pattern: "{motif}{scene}{ending}", role: "rhyme" },
  { pattern: "{season}{place}{ending}", role: "rhyme" },
  { pattern: "{place}{scene}{ending}", role: "rhyme" },
  { pattern: "{scene}{season}{ending}", role: "rhyme" },
  { pattern: "{place}{season}{ending}", role: "rhyme" },
  { pattern: "{scene}{place}{ending}", role: "rhyme" },
  { pattern: "{season}{scene}{ending}", role: "rhyme" },
  { pattern: "{motif}映{season}", role: "free" },
  { pattern: "{motif}照{place}", role: "free" },
  { pattern: "{season}伴{motif}", role: "free" },
  { pattern: "{place}拥{motif}", role: "free" },
  { pattern: "{scene}含{motif}", role: "free" },
  { pattern: "{motif}临{scene}", role: "free" },
  { pattern: "{season}映{place}", role: "free" },
  { pattern: "{place}入{season}", role: "free" },
  { pattern: "{scene}照{season}", role: "free" },
  { pattern: "{motif}连{place}", role: "free" },
  { pattern: "{motif}随{season}", role: "free" },
  { pattern: "{scene}过{place}", role: "free" },
  { pattern: "{season}接{scene}", role: "free" },
  { pattern: "{place}起{motif}", role: "free" },
  { pattern: "{scene}入{motif}", role: "free" },
  { pattern: "{season}和{motif}", role: "free" },
  { pattern: "{place}衔{scene}", role: "free" },
  { pattern: "{season}拥{place}", role: "free" },
  { pattern: "{scene}映{motif}", role: "free" },
  { pattern: "{motif}向{place}", role: "free" },
  { pattern: "{motif}与{scene}", role: "free" },
  { pattern: "{season}拂{motif}", role: "free" },
  { pattern: "{place}伴{season}", role: "free" },
  { pattern: "{scene}承{place}", role: "free" },
  { pattern: "{motif}过{season}", role: "free" },
  { pattern: "{season}入{motif}", role: "free" },
  { pattern: "{place}向{season}", role: "free" },
  { pattern: "{scene}拂{motif}", role: "free" }
];

const styles = [
  "清雅", "明朗", "旷达", "温润", "挺拔", "疏阔", "澄明", "和煦", "高远", "宁和", "俊逸", "淡远", "雅正", "沉静", "空灵", "俊爽", "苍润", "明净", "朗阔", "深婉",
  "清峻", "爽朗", "静穆", "宏阔", "温厚", "凝练", "舒展", "雅淡", "清宕", "遒劲", "疏秀", "沉稳"
];

const templates = [];
for (let i = 0; i < 2400; i += 1) {
  const family = patternFamilies[i % patternFamilies.length];
  const style = styles[i % styles.length];
  templates.push({
    id: `TPL_${String(i + 1).padStart(4, "0")}`,
    pattern: family.pattern,
    role: family.role,
    style,
    placeholders: unique(Array.from(family.pattern.matchAll(/\{(\w+)\}/g)).map((m) => m[1]))
  });
}

const lineTemplates = {
  meta: {
    total: templates.length,
    minRequired: 300,
    meter: "five-char"
  },
  templates
};

if (motifs.meta.total < 800) {
  throw new Error(`motifs too small: ${motifs.meta.total}`);
}
if (lineTemplates.meta.total < 300) {
  throw new Error(`templates too small: ${lineTemplates.meta.total}`);
}

fs.writeFileSync(path.join(dataDir, "motifs.json"), `${JSON.stringify(motifs, null, 2)}\n`);
fs.writeFileSync(path.join(dataDir, "line_templates.json"), `${JSON.stringify(lineTemplates, null, 2)}\n`);

console.log(`motifs: ${motifs.meta.total}`);
console.log(`templates: ${lineTemplates.meta.total}`);
