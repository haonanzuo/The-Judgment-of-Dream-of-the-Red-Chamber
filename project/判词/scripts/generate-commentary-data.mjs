import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "src", "data", "commentary");

const unique = (arr) => [...new Set(arr)];

const buildSentences = (heads, tails, limit) => {
  const out = [];
  for (const h of heads) {
    for (const t of tails) {
      out.push(`${h}${t}`);
      if (out.length >= limit) return out;
    }
  }
  return out;
};

const expandHeads = (heads) => {
  const variants = [
    ...heads,
    ...heads.map((h) => `很多时候${h}`),
    ...heads.map((h) => `在另一些片刻，${h}`),
    ...heads.map((h) => `不经意间，${h}`),
    ...heads.map((h) => `在某个不喧哗的瞬间，${h}`),
    ...heads.map((h) => `当心绪稍微慢下来时，${h}`),
    ...heads.map((h) => `回望这段路会发现，${h}`),
    ...heads.map((h) => `一些不被注意的时刻里，${h}`)
  ];

  return unique(variants);
};

const openingHeadsBase = [
  "风声掠过窗沿，",
  "天光从云隙缓缓落下，",
  "街巷的喧哗退远后，",
  "灯影在案角轻轻晃动，",
  "晨色尚浅时，",
  "暮色初合之际，",
  "水面收住波纹后，",
  "树影在墙上慢慢延伸，",
  "雨意刚退的时刻，",
  "夜色未深时，",
  "远处钟声稀薄传来，",
  "窗外风向悄悄一换，",
  "人群散去后的几分钟里，",
  "杯中热气尚在，",
  "日光从书页边缘滑过，",
  "行人脚步渐缓之时，",
  "路灯把边界照得柔和，",
  "天边留着一点余明，",
  "四周安静下来以后，",
  "月色尚未铺满庭前，",
  "雨后石阶仍带着微凉，",
  "窗纸透进一层淡光，",
  "风穿过廊下的间隙，",
  "屋檐滴答声渐轻，",
  "树梢亮起清浅的边线，",
  "巷口的灯慢慢亮稳，",
  "远山只剩一层淡轮廓，",
  "窗台上的影子悄悄挪动，",
  "茶香在空气里停了一会儿，",
  "雨丝收尽后的几分钟，"
];

const openingTails = [
  "心绪像被轻轻按在更稳的节拍上。",
  "许多杂音忽然有了远近。",
  "原本分散的念头开始归位。",
  "许多事不必急着命名。",
  "心里出现了可供停靠的空隙。",
  "一些答案不再需要立刻给出。",
  "节奏像是被悄悄调慢一格。",
  "情绪的边缘变得柔软。",
  "眼前的次序更容易看清。",
  "注意力回到了真正重要的地方。",
  "心里的风浪先收了一层。",
  "许多感受不再互相推挤。",
  "判断开始拥有更稳定的底色。",
  "纷乱的部分像被温和地理顺。",
  "心口那点紧绷慢慢松开。",
  "很多事看起来不再那么逼仄。"
];

const tensionHeadsBase = [
  "一面想把事情做得周全，",
  "心里既愿意向前，",
  "明知不必与人比较，",
  "有时已经看见方向，",
  "想守住稳定的节拍，",
  "既希望被理解，",
  "越在意的部分越想做到最好，",
  "常会在果断与谨慎之间停一下，",
  "并不排斥变化，",
  "期待结果到来时，",
  "总想把每个细节都照顾到，",
  "既不愿放弃可能性，",
  "一边珍惜已有秩序，",
  "理性说可以再等等，",
  "偶尔会把标准抬得很高，",
  "并非不敢迈步，",
  "有些节点明明并不复杂，",
  "对自己有要求这件事，",
  "当机会靠近时，",
  "有时会同时听见两种声音，",
  "明白该放下某些包袱，",
  "想把每一步都走在把握里，",
  "看似平静的时候，",
  "有时会先照顾别人感受，",
  "知道该往前仍会短暂停顿，",
  "想维持体面与真实并行，",
  "既盼着变化又惦记稳定，",
  "面对选择时会先多看两眼，",
  "并不是没有主见，",
  "对结果越看重时，"
];

const tensionTails = [
  "另一面又担心步子太快留下遗漏。",
  "却也怕错过眼前的窗口。",
  "但心里仍会悄悄衡量得失。",
  "又会想再观察一会儿再决定。",
  "可情绪偶尔催着马上给答案。",
  "同时也在意是否被准确看见。",
  "却又不想让自己太过紧绷。",
  "所以常出现“想定又想再想”的拉扯。",
  "但熟悉感也让人舍不得轻易松手。",
  "同时会担心结果是否足够理想。",
  "于是心里会出现短暂的来回。",
  "有时会把轻微不确定放大。",
  "偶尔会在取舍前再三确认。",
  "于是节奏会在前进前先回看一下。",
  "也会担心自己是否看漏关键线索。",
  "让人想再等一个更稳妥的时机。"
];

const insightHeadsBase = [
  "很多时候真正有用的并非更快，",
  "并不是所有波动都需要对抗，",
  "节奏一旦稳住，",
  "当注意力回到可控部分，",
  "细小但连续的动作，",
  "有些转机并不喧哗，",
  "把问题拆小以后，",
  "当心里先有秩序，",
  "留白并非空转，",
  "长期投入常常晚些发亮，",
  "稳定感并不来自答案本身，",
  "并非每一步都要显著，",
  "温和并不等于退让，",
  "许多担心在推进中会自动松动，",
  "界限清楚时，",
  "先照顾好内在节拍，",
  "变化通常先从细部出现，",
  "看似缓慢的推进，",
  "当焦点不再分散，",
  "允许阶段性的模糊，",
  "把心力放回可执行之处，",
  "不急于证明自身价值时，",
  "当步骤变得简洁，",
  "先做完再评判，",
  "先稳住重心后发力，",
  "把复杂留给方法而不是情绪，",
  "多一点耐性常能换来清晰，",
  "真正的笃定往往很安静，",
  "局面并不总靠一击定音，",
  "先把脚下走稳时，"
];

const insightTails = [
  "反而更容易走到更远处。",
  "往往会在后段回到清晰。",
  "许多选择就不再那么艰难。",
  "行动会自然变得连贯。",
  "会累积出超出预期的力量。",
  "却常常最先改变方向。",
  "答案反而更快靠近。",
  "外部噪音就没那么刺耳。",
  "而是给判断留下弹性。",
  "经常比短促冲刺更可靠。",
  "而来自可重复的行动。",
  "但它们会悄悄叠加。",
  "它常常是另一种稳定的力量。",
  "于是前路会出现可走的台阶。",
  "心力就不必无谓消耗。",
  "后续步骤通常更有把握。",
  "像水位上涨般不急不迫。",
  "常比想象更扎实。",
  "结果会显得更可预期。",
  "反而让真实意图更可见。",
  "并且能减少无谓的反复。",
  "会把模糊变成可执行的清单。",
  "很多困惑会在行动里自然沉淀。",
  "局势也会慢慢长出更稳的支点。",
  "下一步常常因此变得更明白。"
];

const adviceHeadsBase = [
  "不妨把步调放在可持续的位置，",
  "可以先照顾眼前最小的一步，",
  "若暂时没有定论，",
  "不必急着证明一切，",
  "先把手边可完成的部分做好，",
  "可给自己留一段回旋，",
  "与其追求立刻完满，",
  "先稳住心气再推进，",
  "让时间参与判断，",
  "当状态起伏时，",
  "可先确认边界再投入，",
  "把复杂问题拆成短段，",
  "试着让目标更具体一点，",
  "先把注意力收回到当下，",
  "把期待放在过程里，",
  "允许自己慢半拍，",
  "愿意反复校准并不丢分，",
  "先守住节奏感，",
  "把重要的两三件事放在前面，",
  "让每次尝试都留有余地，",
  "可先完成一个小闭环，",
  "把情绪和任务分开看，",
  "允许自己先做七分确定，",
  "先照顾睡眠与体力，",
  "把节拍放回呼吸能跟上的位置，",
  "先把难题切成今天能做的份量，",
  "给自己一点缓冲和余白，",
  "先把顺序排清再发力，",
  "不妨把标准分成主次，",
  "把眼前这一步走实就好，"
];

const adviceTails = [
  "后面的路常会比预想更从容。",
  "许多答案会在行动里显形。",
  "变化会以更自然的方式到来。",
  "心里的重量也会慢慢变轻。",
  "下一步通常就会更清楚。",
  "很多顾虑会在推进中减少。",
  "于是选择会变得更稳。",
  "进展会在不显眼处持续累积。",
  "结果往往会向明亮处靠拢。",
  "真正适合的路径会逐渐浮现。",
  "过程本身会给出新的线索。",
  "很多负担会在执行后变小。",
  "行动会带来可感知的安定感。",
  "很多犹疑会在途中慢慢散开。",
  "你会更容易看见可把握的部分。",
  "节奏一稳，方向通常也会更稳。"
];

const hookHeadsBase = [
  "{motifA}掠过{region}的边缘，",
  "{season}里的一缕{motifA}，",
  "当{motifA}与{motifB}并置时，",
  "{region}的风里带着{motifA}，",
  "{motifA}沿着{season}的纹理展开，",
  "{motifB}在{region}一带回响，",
  "{season}光线落在{motifA}上，",
  "{motifA}和{motifB}互相映照，",
  "在{region}的天色下，{motifA}，",
  "{motifB}贴着{season}的气息，",
  "{motifA}穿过{region}的风向，",
  "{season}与{motifB}相遇时，",
  "{motifA}停在{region}的轮廓里，",
  "{motifB}把{season}衬得更清，",
  "{region}夜色里浮出{motifA}，",
  "{motifA}在{season}边缘轻亮，",
  "{motifB}与{region}互成背景，",
  "{season}晨光触到{motifA}，",
  "{motifA}挨着{motifB}出现，",
  "{region}静下来时有{motifA}，",
  "{motifA}落在{region}的薄雾里，",
  "{motifB}沿着{season}缓缓铺开，",
  "{motifA}与{motifB}在{region}交叠，",
  "{season}将{motifA}托起时，",
  "{region}风声里浮着{motifB}，",
  "{motifA}顺着{region}的灯影延展，",
  "{season}拂过{motifB}的边线，",
  "{motifA}与{motifB}在{season}里并肩，",
  "{region}天光里映出{motifA}，",
  "{motifB}贴着{region}的轮廓起伏，"
];

const hookTails = [
  "像是在提醒许多事可以慢慢明白。",
  "把原本紧绷的部分轻轻松开。",
  "让心里那点不安变得可安放。",
  "也让脚下的节拍更容易稳住。",
  "仿佛给判断多留了一层缓冲。",
  "使人更愿意相信循序渐进。",
  "让看似分散的念头重新聚拢。",
  "于是许多选择不再急迫。",
  "像把复杂感受梳理得更清楚。",
  "让行动与感受逐渐对齐。",
  "也给后来留出更温和的空间。",
  "像给心里点亮一盏更稳的小灯。",
  "让不确定感慢慢回到可承受范围。",
  "让原本交错的线索开始并拢。",
  "像把心绪轻轻带回能落脚的地方。",
  "让犹疑有机会转成更稳的判断。"
];

const TARGET_PER_SET = 1600;

const opening = buildSentences(expandHeads(openingHeadsBase), openingTails, TARGET_PER_SET);
const tension = buildSentences(expandHeads(tensionHeadsBase), tensionTails, TARGET_PER_SET);
const insight = buildSentences(expandHeads(insightHeadsBase), insightTails, TARGET_PER_SET);
const advice = buildSentences(expandHeads(adviceHeadsBase), adviceTails, TARGET_PER_SET);
const motifHooks = buildSentences(expandHeads(hookHeadsBase), hookTails, TARGET_PER_SET);

const write = (name, lines) => {
  const clean = unique(lines);
  const payload = {
    meta: {
      total: clean.length,
      minRequired: 200,
      kind: name
    },
    lines: clean
  };
  fs.writeFileSync(path.join(outDir, `${name}.json`), `${JSON.stringify(payload, null, 2)}\n`);
};

write("opening", opening);
write("tension", tension);
write("insight", insight);
write("advice", advice);
write("motif_hooks", motifHooks);

console.log({
  opening: opening.length,
  tension: tension.length,
  insight: insight.length,
  advice: advice.length,
  motif_hooks: motifHooks.length
});
