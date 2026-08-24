# 技术分路选择器布局修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 701–1024px 宽度下技术分路选择项的文字挤压和重叠，同时保留现有视觉和交互。

**Architecture:** 只调整 `src/styles.css` 的响应式规则。平板断点将选择项内容固定为可收缩的编号、名称和状态列，英文副标题隐藏；底部状态说明在可用宽度不足时自然换行。手机端继续使用单列布局。

**Tech Stack:** React 19, Vite, TypeScript, CSS, Vitest。

---

### Task 1: 修复平板选择项网格与状态说明

**Files:**
- Modify: `src/styles.css:2941-3025`

- [ ] **Step 1: 调整 1024px 以下选择项的稳定布局**

在 `@media (max-width: 1024px)` 中，为 `.track-row` 增加 `min-width: 0`，将网格列调整为 `30px minmax(0, 1fr) 12px`，并让名称允许收缩；保留英文副标题隐藏和右上角“限”标签定位。

- [ ] **Step 2: 调整底部状态说明的间距和换行**

在同一断点中让 `.track-selector__note` 使用 `flex-wrap: wrap`、`row-gap` 和 `column-gap`，并让其两段文字在窄双列中能够独立换行。

- [ ] **Step 3: 保持手机端单列并防止长文本溢出**

在 `@media (max-width: 700px)` 中补充 `.track-row__name { min-width: 0; }` 和 `.track-selector__note { align-items: baseline; }`，不改变现有单列尺寸和视觉。

### Task 2: 验证布局修复

**Files:**
- Test: `src/styles.css` via build and rendered smoke checks

- [ ] **Step 1: 运行 CSS 与 TypeScript 构建验证**

运行 `npm run build`，预期 Vite 构建成功且无 TypeScript 错误。

- [ ] **Step 2: 运行现有测试**

运行 `npm test -- --run`，预期 2 个测试文件、12 个测试全部通过。

- [ ] **Step 3: 检查工作区和差异范围**

运行 `git diff --check`、`git status --short` 和 `git diff --stat`，确认只有 `src/styles.css` 与本计划文件发生预期变化。

- [ ] **Step 4: 提交修复**

运行：

```bash
git add src/styles.css docs/superpowers/plans/2026-08-24-track-selector-layout.md
git commit -m "修复技术分路平板布局重叠"
```
