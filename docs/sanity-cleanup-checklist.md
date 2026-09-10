# Sanity 遗留数据清理清单

> 数据快照日期：2026-09-10（Sanity 项目 `06ixdv8f`，dataset `production`，公开 API 只读查询）

## 操作入口

1. 打开 <https://www.chenyunsheep.top/studio>（嵌入式 Studio，与生产环境同一个数据集）
2. 登录 Sanity 账号
3. 在左侧 Content 树中选择对应类型（Articles / Categories / Projects / Settings）

## 零、现状核对（重要，先读）

本清单按"实际查询结果"生成，**与此前预期不同**：预期中的模板遗留数据
（图形学 / 文学 / 外语 / 委屈坚持的冬天 等约 14 个模板分类、20+ 个原神相关模板项目）
**在当前数据集中已不存在**——分类只剩 3 个、项目只剩 1 个，且全部被真实内容使用。
推测此前已清理过一轮。因此：

- **没有需要删除的分类，也没有需要删除的项目。**
- 请勿按旧印象手动批量删除；下面第一~四节均为空清单，第五节列出了必须保留的内容。

当前数据集全景（公开查询，无草稿）：

| 类型 | 数量 | 明细 |
| --- | --- | --- |
| category 分类 | 3 | OpenClaw7天教程、claude code、开发实践 |
| project 项目 | 1 | 哈尔斯带级认证学习系统 |
| post 已发布文章 | 11 | 10 篇有分类，1 篇无分类 |
| settings 站点设置 | 1 | 单例，引用 1 个项目 |
| 图片资源 | 126 | 其中 5 张未被任何文档引用（见"补充"） |

## 一、可直接删除的分类（已发布文章数 = 0 的模板遗留分类）

**无。** 当前 3 个分类均有已发布文章在使用，不存在空分类。

## 二、需先处理文章再删的分类（有文章但属于模板遗留）

**无。** 3 个分类均对应站主自己发布的内容（OpenClaw 教程、Claude Code 教程、开发实践），不属于模板遗留。

## 三、建议保留的分类

| 分类名 | slug | 已发布文章数 | 说明 |
| --- | --- | --- | --- |
| OpenClaw7天教程 | `openclaw` | 7 | OpenClaw 7 天系列教程（Day 1–7） |
| claude code | `claude-code` | 1 | 《Claude Code 保姆级教程》 |
| 开发实践 | `开发实践` | 2 | AI 操作手册 Agent、哈尔斯培训考试系统实践 |

## 四、项目删除清单（未被 settings 引用的模板项目）

**无。** 数据集中仅有 1 个项目，且被 settings 引用（见下表）。站长的其他真实项目
（企业知识平台、MTC、LIMS、WMS 等）不在 Sanity 中，而是仓库内的静态页面
（`app/(main)/projects/knowledge-platform/` 等），不受 Studio 删除操作影响。

| 项目名 | URL | 被 settings 引用？ | 处理建议 |
| --- | --- | --- | --- |
| 哈尔斯带级认证学习系统 | <https://levelcertification.pages.dev> | 是（首页项目位） | 保留 |

## 五、不要动的（误删会导致线上页面空缺）

- **Settings 站点设置单例**：被首页 / 全站引用，删除会导致站点标题与项目位失效。
- **项目「哈尔斯带级认证学习系统」**：settings 正在引用，且是 /projects 页面的线上数据来源。
- **全部 11 篇已发布文章**（当前全部为真实内容）：
  1. AI 操作手册生成 Agent（`ai-agent`，开发实践）
  2. Claude Code 保姆级教程（`claude-code`，claude code）
  3. Nano Banana Pro玩法大全+免费入口汇总（`nano-banana-pro`，无分类）
  4. OpenClaw 7天教程 - Day 1: 初识 OpenClaw（`openclaw-7-day-1-openclaw`）
  5. Openclaw7天教程-Day 2: 10 分钟，搭建你的助手（`day-2`）
  6. Openclaw7天教程-Day 3: 给助手一个灵魂（`openclaw7-day-3`）
  7. Openclaw7天教程-Day 4: 接入你的数字生活（`day-4`）
  8. Openclaw7天教程-Day 5: 解锁技能树（`openclaw7-day-5`）
  9. Openclaw7天教程-Day 6: 让助手主动工作（`openclaw7-day-6`）
  10. Openclaw7天教材-Day 7: 进阶玩法（`openclaw7-day-7`）
  11. 哈尔斯智能化培训考试系统：AI出题与技能认证全流程数字化实践（`ai`，开发实践）

## 补充：可选的小清理（非必须，不影响页面）

1. **5 张未引用图片**（上传后未插入文章，可留可删）：
   `Gemini_Generated_Image_bdymurbdymurbdym.png` × 1、`image.png` × 4。
   删除路径：<https://www.sanity.io/manage> → 项目 `06ixdv8f` → dataset `production` → Assets，
   按文件名找到后删除（其余 121 张均被文章引用，不要动）。
2. **《Nano Banana Pro玩法大全+免费入口汇总》没有分类**：
   建议在 Studio → Articles 中打开它，补一个分类（如「开发实践」），便于博客分类页聚合。仅是建议，不是删除项。

## 附：操作后如何验证

在浏览器（建议无痕窗口，避开缓存）复查：

- <https://www.chenyunsheep.top/blog> —— 文章列表应仍有 11 篇，分类筛选可用
- <https://www.chenyunsheep.top/projects> —— 「哈尔斯带级认证学习系统」及各静态项目卡片正常展示
- <https://www.chenyunsheep.top/> —— 首页项目位、最新文章正常
- 若做了"补充"里的清理：确认文章配图仍正常显示（正文图片均来自被引用资源，不受影响）

### 附：本清单依据的原始查询结果（公开数据）

分类（title | slug | 已发布文章数）：

```
OpenClaw7天教程 | openclaw | 7
claude code     | claude-code | 1
开发实践        | 开发实践 | 2
```

项目（name | url | referencedBySettings）：

```
哈尔斯带级认证学习系统 | https://levelcertification.pages.dev | 1
```

settings 单例 projects 数组：`["哈尔斯带级认证学习系统"]`
