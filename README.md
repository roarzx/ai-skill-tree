# 🌟 星际技能图谱 (AI Skill Tree)

> 你的 AI 学习路线可视化助手

一个基于 Next.js 16 + React Flow + React Three Fiber 构建的交互式技能树可视化应用，帮助你规划和追踪 AI 学习路径。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 特性

### 核心功能
- 🌳 **技能树可视化** - 2D 星图模式 / 3D 星域模式
- 💾 **本地存储** - 自动保存学习进度
- 🔍 **节点搜索** - 快速定位技能节点
- 🗺️ **小地图导航** - 大技能树轻松导航

### 进阶功能
- 📂 **多技能树** - 创建多个不同方向的技能树
- 📥 **导入/导出** - JSON 格式备份恢复
- 🤖 **AI 助手** - 学习推荐、概念解释、资源推荐

### 酷炫效果
- ✨ 粒子背景特效
- 🌟 节点发光效果
- 🌌 星空主题 UI

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **UI**: React 19, Tailwind CSS 4
- **可视化**: React Flow (@xyflow/react), React Three Fiber
- **状态管理**: Zustand
- **本地数据库**: Dexie.js (IndexedDB)
- **AI**: Vercel AI SDK

## 🚀 快速开始

### 安装依赖

```bash
cd ai-skill-tree
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

## 📖 使用指南

### 1. 学习技能

点击技能节点 → 右侧面板设置学习状态：
- ⭕ 未开始 (not_started)
- 🔵 学习中 (learning)
- 🟢 已掌握 (mastered)
- 🌟 专家 (expert)

### 2. 搜索技能

在顶部搜索框输入关键词，快速定位技能节点。

### 3. 多技能树

点击技能树名称旁的"管理"按钮：
- ➕ 创建新技能树
- 🔄 切换技能树
- 🗑️ 删除技能树

### 4. 数据备份

在技能树管理面板：
- 📥 导出为 JSON 文件
- 📤 导入 JSON 备份

### 5. AI 助手

点击右下角 🤖 按钮，使用 AI 助手：
- 📚 学习路径推荐
- 📖 技术概念解释
- 🔗 学习资源推荐

## 🤖 AI 功能配置

在项目根目录创建 `.env.local` 文件：

```bash
# OpenAI
OPENAI_API_KEY=sk-your-key-here

# 或 Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

重启服务器后生效。

## 📂 项目结构

```
ai-skill-tree/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   └── ai-chat/       # AI 对话接口
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 主页面
│   ├── components/            # React 组件
│   │   ├── AIAssistant.tsx    # AI 助手
│   │   ├── Dashboard.tsx       # 统计面板
│   │   ├── SearchBar.tsx      # 搜索栏
│   │   ├── SkillNode.tsx      # 技能节点
│   │   ├── SkillPanel.tsx     # 技能详情面板
│   │   ├── SkillTree.tsx      # 2D 技能树
│   │   ├── SkillTree3D.tsx     # 3D 技能树
│   │   └── SkillTreeManager.tsx # 技能树管理
│   └── lib/                   # 工具库
│       ├── db.ts              # Dexie 数据库
│       ├── skills.ts          # 技能数据
│       ├── store.ts           # Zustand 状态
│       └── types.ts           # TypeScript 类型
├── public/                    # 静态资源
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🎨 技能树数据

内置 AI 学习路线：

```
AI
├── Machine Learning
│   ├── Linear Regression
│   ├── SVM
│   └── Decision Tree
├── Deep Learning
│   ├── CNN
│   ├── RNN/LSTM
│   └── Transformer
├── LLM
│   ├── Prompt Engineering
│   ├── RAG
│   ├── Agent
│   └── Fine-tuning
└── AI Infra
    ├── vLLM
    ├── Langfuse
    └── LlamaIndex
```

## 🔧 扩展开发

### 添加自定义技能树

修改 `src/lib/skills.ts` 文件，添加新的技能数据：

```typescript
{
  id: 'custom',
  name: '自定义技能',
  description: '描述',
  difficulty: 3,
  category: 'custom',
  parentId: null,
  resources: ['资源链接'],
  children: [
    // 子技能
  ],
}
```

### 添加新的 AI Provider

在 `src/app/api/ai-chat/route.ts` 中添加新的 AI 提供商支持。

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [React Flow](https://reactflow.dev) - 流程图库
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D 渲染
- [Zustand](https://zustand-demo.pmnd.rs) - 状态管理
- [Dexie.js](https://dexie.org) - IndexedDB 封装

---

Made with ❤️ by [Tony Stark](https://github.com/roarzx)
