export const POEM_LEXICON = {
  line1Lead: ["晨光", "晴云", "春风", "清泉", "明月"],
  line1Mid: ["映柳", "照窗", "入怀", "临岸", "拂阶"],
  line2Lead: ["心灯", "前程", "新愿", "青云", "志行"],
  line2Mid: ["向暖", "可展", "渐阔", "自稳", "常进"],
  line3Lead: ["笃学", "静行", "善念", "温言", "恒志"],
  line3Mid: ["生慧", "成器", "聚力", "养德", "得助"],
  line4Lead: ["来日", "长路", "明朝", "此后", "他年"],
  line4Mid: ["花开", "星明", "春深", "霞满", "福至"]
} as const;

export const RHYME_GROUPS = [
  { id: "ang", chars: ["光", "香", "扬", "长", "昌", "康"] },
  { id: "an", chars: ["安", "欢", "宽", "澜", "端", "然"] },
  { id: "ing", chars: ["明", "清", "宁", "盈", "兴", "星"] },
  { id: "ou", chars: ["秋", "舟", "悠", "游", "收", "柔"] }
] as const;

export const NON_RHYME_ENDINGS = ["和", "新", "暖", "盛", "晖", "远", "朗", "定"] as const;

export const INTERPRETATION_LEXICON = {
  dispositionPrefix: [
    "你天性里有",
    "你骨子里带着",
    "你最可贵的是",
    "你行事常见",
    "你身上一直有"
  ],
  dispositionSuffix: [
    "这让你在关键处更有分寸。",
    "所以你做事常能稳步向前。",
    "因此你常在后程走得更好。",
    "这份定力会持续带来好结果。",
    "它会帮你把机会握在手里。"
  ],
  turningPrefix: [
    "你的转机多在",
    "命势变化往往在",
    "真正的上升点通常在",
    "你最容易破局的时段是",
    "人生抬升更常出现于"
  ],
  turningSuffix: [
    "之后，稳住节奏更容易见喜讯。",
    "那一段，耐心会换来更好回报。",
    "之际，沉住气就能看到新机会。",
    "以后，长期投入会放大你的优势。",
    "时，少急多定更容易收获成果。"
  ],
  advicePrefix: ["建议你", "你可以", "更适合你的策略是", "接下来宜", "最稳妥的做法是"],
  adviceSuffix: [
    "先做深再做快，让“{destinyKeyword}”落到行动里。",
    "把注意力放回长期积累，结果会慢慢站到你这边。",
    "少比速度，多比定力，后劲会成为你的胜负手。",
    "把一件小事做透，命里的势能自然会转为助力。",
    "先稳住节奏，再择机突破，往往更容易成功。"
  ]
} as const;

export const getRhymeGroupId = (char: string): string | null => {
  const hit = RHYME_GROUPS.find((group) => group.chars.includes(char));
  return hit?.id ?? null;
};
