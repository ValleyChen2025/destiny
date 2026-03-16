# CLAUDE.md - 命理咨询网站项目说明

## 项目概述

- **项目名称**: destiny - 中英文双语命理咨询服务平台
- **技术栈**: Next.js 14+, React 19, Tailwind CSS, TypeScript
- **部署**: Vercel
- **数据存储**: Google Sheets (通过 Google Apps Script)

## 项目结构

```
destiny/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 首页
│   │   ├── quote/page.tsx    # 询价页
│   │   ├── orders/page.tsx   # 订单管理后台
│   │   └── api/
│   ├── components/
│   │   ├── QuoteForm.tsx     # 询价表单
│   │   ├── LanguageContext.tsx  # 多语言上下文
│   │   └── ...
│   ├── lib/
│   │   ├── i18n.ts           # 国际化配置
│   │   └── utils.ts
│   └── utils/
│       └── baziEngine.ts     # 八字计算引擎
├── package.json
└── next.config.ts
```

## 核心功能

1. **双语支持**: 中文/英文，首屏强制语言选择
2. **询价表单**: 收集客户姓名、联系方式、出生信息
3. **八字排盘**: 后台自动计算（不显示给客户）
4. **Google Sheets 集成**: 表单数据发送到表格存储

## 命理计算特殊规则

### 真太阳时修正
- 基准经度: 120°E（北京时区）
- 公式: 真太阳时 = 平太阳时 + (经度 - 120) × 4 分钟

### 早晚子时处理
- 23:00 - 23:59（晚子时）: 使用当天日期计算日柱
- 00:00 - 00:59（早子时）: 使用次日日期计算日柱
- 日柱切换基于真太阳时计算后判断

### 南半球月令对冲
若用户在南半球出生，月支需要进行六冲对冲：
- 寅 → 申（正月→七月）
- 卯 → 酉（二月→八月）
- 辰 → 戌（三月→九月）
- 巳 → 亥（四月→十月）
- 午 → 子（五月→十一月）
- 未 → 丑（六月→十二月）

### 数据流向规则
1. 用户提交表单 → 前端不显示任何排盘结果
2. 后台计算完整八字（年、月、日、时柱 + 节气）
3. 将"干支排盘"字符串作为隐藏字段 `bazi` 发送到 Google Sheets

## 关键文件

| 文件 | 说明 |
|------|------|
| `src/components/QuoteForm.tsx` | 询价表单，包含出生信息输入 |
| `src/utils/baziEngine.ts` | 八字计算引擎 |
| `src/lib/i18n.ts` | 中英文翻译 |
| `src/components/LanguageContext.tsx` | 语言状态管理 |

## 开发命令

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器
npm run build        # 生产构建
```
