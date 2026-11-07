# RTLauncher 设计规范

> 本文档是 RTLauncher 桌面端 UI 的**唯一事实来源**。任何界面改动都应先在此找到依据；
> 若确需引入新规则，请先更新本文档，再改代码。

---

## 1. 设计理念

RTLauncher 是一个 Minecraft 启动器，用户在它前面停留的时间很长：选版本、装 Mod、等下载、看日志。
因此界面追求 **安静、耐看、信息密度高而不拥挤**，而不是第一眼的视觉冲击。

三条主线：

| 关键词 | 含义 | 落地方式 |
| --- | --- | --- |
| **沉稳** | 深色为默认语境，大面积低饱和中性色 | 背景 `oklch(0.147 …)`，卡片只比背景亮一档 |
| **胶囊几何** | 交互元素统一为全圆角，容器统一为大圆角 | 按钮/徽章 `rounded-4xl`，卡片 `rounded-2xl` |
| **克制** | 动效只用于交代空间关系，不做装饰 | 位移 ≤ 16px，时长 150–300ms，缓动 easeOut |

配色上遵循 **一个中性骨架 + 一个可换的主色 + 一组资源语义色**。
主色默认接近白色（`oklch(0.923 0.003 48.717)`），保证任何用户自定义主题色都不会破坏对比度。

---

## 2. 设计令牌

### 2.1 颜色

技术栈为 **Tailwind CSS v4**，颜色全部使用 `oklch()`，令牌定义在 `app/globals.css`，
通过 `@theme inline` 映射为 Tailwind 工具类（`bg-card`、`text-muted-foreground` 等）。

**暗色（默认，`.dark`）核心值：**

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--background` | `oklch(0.147 0.004 49.25)` | 应用底色 |
| `--card` | `oklch(0.216 0.006 56.043)` | 卡片、侧栏、弹层表面 |
| `--foreground` | `oklch(0.985 0.001 106.423)` | 主文字 |
| `--muted-foreground` | `oklch(0.709 0.01 56.259)` | 次要文字、图标 |
| `--primary` | `oklch(0.923 0.003 48.717)` | 主操作、强调 |
| `--primary-foreground` | `oklch(0.216 0.006 56.043)` | 主色上的文字 |
| `--secondary` / `--muted` / `--accent` | `oklch(0.268 0.007 34.298)` | 次级填充、hover 底 |
| `--destructive` | `oklch(0.704 0.191 22.216)` | 危险操作、错误 |
| `--ring` | `oklch(0.553 0.013 58.071)` | 焦点环 |

**亮色（`:root`）** 与暗色一一对应，背景纯白、`--primary` 转为近黑（`oklch(0.216 0.006 56.043)`）。

> ⚠️ **禁止在组件里写死颜色。**
> 用户可在「设置 → 外观」中自定义主题色，`settings-provider.tsx` 的 `derivePalette()`
> 会重算整套 `--primary` / `--primary-foreground` 并写入 `document.documentElement`。
> 硬编码的十六进制色值不会跟随换肤，会直接穿帮。

### 2.2 描边：ring 而非 border

暗色下的描边**不是固定色，而是混色**：

```css
--border: color-mix(in oklch, var(--card) 90%, var(--foreground) 10%);
--input:  color-mix(in oklch, var(--card) 85%, var(--foreground) 15%);
```

原因（源码注释原话）：WebKitGTK 对**半透明 1px 描边的圆角抗锯齿较差**，会显得粗糙；
不透明色观感等价于白色叠加在卡片上，但边缘更平滑。

因此 `Card` 使用 `ring-1`（`ring-foreground/10`）而不是 `border`，
并且 `.dark [data-slot="card"]` 单独覆写 `--tw-ring-color` 为不透明混色。
弹层（dropdown / select / alert-dialog）与输入控件同理，各自有一档混色规则。

**实践建议：** 新组件优先用 `ring-1`；确实需要 `border` 时不要再叠加 `ring`，避免双线。

### 2.3 圆角

基准 `--radius: 0.625rem`（10px），派生出完整阶梯：

| 类 | 计算 | 实际 | 用于 |
| --- | --- | --- | --- |
| `rounded-lg` | `--radius` | 10px | 内嵌信息块、公告内容框 |
| `rounded-xl` | `+4px` | 14px | 快捷入口图标底、头像方块 |
| `rounded-2xl` | `+8px` | 18px | **卡片**、3D 皮肤预览框 |
| `rounded-3xl` | `+12px` | 22px | 大号头像占位 |
| `rounded-4xl` | `+16px` | 26px | **按钮、徽章**（胶囊） |

规则：**容器用 2xl，交互用 4xl，中间层用 xl。**

### 2.4 字体与字号

- 字体：系统栈（`--font-sans`），无 web font 加载，冷启动无 FOUT。
- 基准字号：由 `applyFontSizeToDom()` 写入 `body.style.fontSize`，用户可调 **12–18px**。
- 缩放机制：`globals.css` 用 `--app-font-scale` 重算所有 `text-*` 类与 `h1`–`h4`，
  并带 `!important` 保证覆盖 Tailwind。**只缩放文字，不改变组件尺寸与布局。**
- 层级：页面标题 `text-xl`，区块标题 `text-base`，正文 `text-sm`，辅助说明 `text-xs`。

---

## 3. 组件规范

### 3.1 Card

```
ring-1 ring-foreground/10 · bg-card · rounded-2xl · py-6 · gap-6 · text-sm
size="sm" → py-4 · gap-4 · 内边距 px-4
```

- 卡片是**唯一**的信息容器，页面不要用裸 `div` + border 自造卡片。
- 卡片内部纵向节奏靠 `gap-6`（sm 为 `gap-4`），不要在每个子元素上堆 `mt-*`。
- 卡片内分区用 `border-t border-border` 加一条分隔线（如首页账户卡的「预览区 / 操作区」）。

### 3.2 Button

```
rounded-4xl · text-sm font-medium · h-9 px-3 gap-1.5 · border border-transparent
```

| variant | 用途 |
| --- | --- |
| `default` | 页面唯一主操作（启动游戏） |
| `outline` | 次级操作（管理账户、查看详情） |
| `ghost` | 图标按钮、窗口控制、侧栏导航 |
| `destructive` | 删除、卸载（`bg-destructive/10` 淡底） |
| `link` | 行内跳转 |

- 一屏内**最多一个** `default` 按钮。
- 纯图标按钮必须给 `title` + `aria-label`。
- 侧栏与标题栏的图标按钮用 `size="icon"`。

### 3.3 Badge

`h-5 rounded-4xl text-xs`，与按钮同色系。用于状态标签（版本、加载器、启动状态）。
状态色固定为语义色：准备中 `text-blue-500`、启动中 `text-amber-500`、运行中 `text-green-500`、
错误 `text-destructive`、空闲/停止 `text-muted-foreground`。

### 3.4 滚动条

全局 `0.5rem` 宽、透明轨道、滑块为 `muted-foreground` 30% 混色，hover 提到 50%。
日志等密集区域用 `.custom-scrollbar`（`0.375rem`）。需要完全隐藏时用 `.no-scrollbar`。

---

## 4. 布局骨架

```
┌──────────────────────────────────────────────┐
│ TitleBar   40px  Logo · 拖拽区 · 主题 · 窗口键 │
├────┬─────────────────────────────────────────┤
│Side│ <main>  页面容器 max-w-[1600px] p-4/5    │
│bar │  页面标题区（仅 full 模式）              │
│56px│  内容网格                              │
└────┴─────────────────────────────────────────┘
```

- 侧栏固定 **56px（`w-14`）**，纯图标 + Tooltip，激活项有 `layoutId` 弹簧滑块。
- 主区 `flex-1 overflow-hidden`，**滚动发生在页面内部**（`h-full overflow-y-auto`），
  而不是 `body`——这样标题栏与侧栏始终固定。
- 页面容器统一 `mx-auto flex min-h-full max-w-[1600px] flex-col gap-4 p-4 md:p-5`。
- 背景图开启时，`body[data-app-bg="active"]` 会让卡片与侧栏变半透明 + `backdrop-blur`，
  并用 `clip-path: inset(0 round var(--radius-2xl))` 修正裁剪半径，避免切断描边。

---

## 5. 首页信息架构

首页有两种模式，由 `settings.appearance.homeMode` 控制。

### Full 模式（默认）

```
[标题区]  RTLauncher 小标 / 欢迎回来，{玩家名} / 副标题 / 检查更新 · 启动状态
┌───────────────────────────────┬──────────────┐
│ 启动主卡（min-h 280）          │ 账户与角色    │
│  徽章 · 实例名 · MC 版本        │  3D 皮肤预览  │
│  主操作 · 版本选择 · 查看详情   │  ─────────   │
├───────────────┬───────────────┤  头像/名字    │
│ 公告栏 250px  │               │  管理账户     │
├───────────────┴───────────────┤  皮肤披风     │
│ 快速入口（2 项通用 + 7 项资源）│  检查更新     │
└───────────────────────────────┴──────────────┘
```

- 栅格：`lg:grid-cols-[minmax(0,1fr)_320px]`，左侧内部 `md:grid-cols-[minmax(0,1fr)_250px]`。
- 启动主卡是全页视觉焦点：`bg-gradient-to-br from-primary/12 via-card to-card`
  + 右上角 `size-52 rounded-full bg-primary/10 blur-3xl` 光晕。
- 右侧账户卡 `lg:sticky lg:top-0`，保证滚动时账户操作始终可见。

### Simple 模式

只保留账户与角色卡（右对齐 320px），隐藏标题区、启动卡、公告、快速入口。
适合「我只想登录然后启动」的用户。

---

## 6. 动效规范

统一封装在 `lib/motion.ts`，全部是 framer-motion `Variants`，**不要在组件里内联新变体**。

| 变体 | 位移 | 时长 | 场景 |
| --- | --- | --- | --- |
| `fadeIn` | — | 200 / 150ms | 通用淡入淡出 |
| `fadeSlideUp` | `y 16→0` | 250ms easeOut | 卡片、列表项入场 |
| `fadeSlideDown` | `y -12→0` | 200ms | 下拉、向下展开 |
| `scaleIn` | `scale .95→1, y 8→0` | 200ms `[.25,1,.5,1]` | 对话框、浮层 |
| `slideInFromRight` | `x 32→0` | 250ms | 进入详情页 |
| `slideInFromLeft` | `x -32→0` | 250ms | 返回列表 |
| `slideLeftContent` | `x 24→-16` | 200 / 150ms | 公告翻页 |
| `staggerContainer` / `staggerItem` | `y 12→0` | stagger 60ms | 网格批量入场 |

**约束：**

1. 位移不超过 **16px**（详情页滑动除外），避免「弹跳感」。
2. 入场慢、退场快（200–250ms vs 150ms），符合「出现要稳、消失要利落」。
3. 页面切换由 `sidebar.tsx` 手动编排：淡出 80ms → 并行 `router.push` →
   等待新页首个 DOM mutation + 80ms 稳定窗口 → 淡入 150ms，超时兜底 1200ms。
4. **必须**尊重 `prefers-reduced-motion: reduce`，此时直接切换、不做过渡。

---

## 7. 图标与语义色

- 图标库：**lucide-react**，统一 `size-4`（导航/正文）、`size-3.5`（按钮内）、`size-5`（强调）。
- 每种游戏资源有固定语义色（`constants/index.ts`），这是全站最强的视觉记忆点：

| 资源 | 图标 | 色系 |
| --- | --- | --- |
| 下载内容 | `Download` | sky |
| 游戏管理 | `Gamepad2` | emerald |
| Mods | `Puzzle` | emerald |
| 截图 | `Camera` | cyan |
| 投影原理图 | `Map` | teal |
| 资源包 | `Palette` | blue |
| 数据包 | `Database` | fuchsia |
| 光影包 | `Sparkles` | violet |
| 世界 | `Globe` | amber |

写法固定为 `bg-{color}-500/10 text-{color}-600 dark:text-{color}-400`：
亮色模式用 600 保证对比度，暗色模式降到 400 避免刺眼。
**新增资源必须在此表登记并沿用同一写法。**

---

## 8. 无障碍与国际化

- 所有文案走 `components/i18n/locales/*.json`，`zh-CN` 与 `en-US` 必须同步。
  英文是 Crowdin 源语言，新增 key 先加 `en-US.json`。
- 交互元素最小点击区 **44px**（`LAYOUT.MIN_TOUCH_TARGET`），纯图标按钮用 `size="icon"`。
- 焦点态统一 `focus-visible:ring-[3px]`，暗色下 ring 色为不透明混色。
- 禁用态 `opacity: 0.4` + `cursor: not-allowed`，不要只靠颜色区分。
- 正文与背景对比度 ≥ 4.5:1；`muted-foreground` 仅用于辅助信息。

---

## 9. 改动检查清单

提交任何 UI 改动前逐条确认：

- [ ] 没有写死颜色，全部使用令牌或语义色
- [ ] 容器用 `Card`，圆角 `rounded-2xl`；交互元素圆角 `rounded-4xl`
- [ ] 描边用 `ring-1`，没有 border + ring 双线
- [ ] 动效复用 `lib/motion.ts`，位移 ≤ 16px，尊重 reduced-motion
- [ ] 一屏只有一个 `default` 按钮
- [ ] 新文案已加 `en-US.json` + `zh-CN.json`
- [ ] 纯图标按钮有 `title` 与 `aria-label`
- [ ] 亮色/暗色都检查过，背景图模式下卡片未失去可读性
- [ ] 12px 与 18px 两档字号下布局未溢出
