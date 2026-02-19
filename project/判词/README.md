# 判词项目 MVP（红楼梦灵感）

一个基于 Next.js 的 Web H5：输入姓名、出生地、出生日期，前端离线生成五言判词与解签文本。

## 技术栈

- Next.js (App Router) + TypeScript
- Zod（输入校验）
- Vitest（单元/API 测试）
- Playwright（E2E）

## 离线素材库

- `src/data/motifs.json`：唐诗风格意象词库（按季节/场景分类，>=800）
- `src/data/line_templates.json`：五言句模板库（>=300，支持 `{motif}` / `{place}` / `{season}`）
- `src/data/fortune.json`：批量生成的判词库（>=2000）

### 解签语料库（全部离线）

- `src/data/commentary/opening.json`
- `src/data/commentary/tension.json`
- `src/data/commentary/insight.json`
- `src/data/commentary/advice.json`
- `src/data/commentary/motif_hooks.json`

每个文件均为 200+ 句，用于 `buildCommentary({ motifs, season, region, tone })` 随机结构拼装。

## 构建判词库

```bash
npm run build:fortune
```

## 当前生成模式

- 页面主流程为纯前端本地生成，不依赖外部 API。
- 生成结果包含 `poem` / `commentary` / `motifs`，并兼容现有 UI 字段。

## 本地运行

```bash
npm install
npm run build:fortune
npm run dev
```

## 测试命令

```bash
npm test
npm run test:e2e
```
