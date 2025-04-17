# Wisdom Light App

一个基于 Expo 和 React Native 开发的移动应用项目，提供智能化的用户交互体验。

## 技术栈

- **框架**: Expo (v52.0.42), React Native (v0.76.8)
- **路由**: Expo Router (v4.0.20)
- **状态管理**: React Context
- **UI 组件**:
  - NativeWind (Tailwind CSS for React Native)
  - Expo Vector Icons
  - React Native Reanimated
  - Expo Blur, Image, Video 等原生组件
- **数据存储**:
  - Async Storage
  - Secure Store
- **网络请求**: Axios

## 项目结构

```
├── api/                # API 接口定义
├── app/                # 应用路由和页面
│   ├── (auth)/        # 认证相关页面
│   └── (tabs)/        # 主要标签页面
├── assets/            # 静态资源
├── components/        # 可复用组件
├── contexts/          # React Context
├── lib/               # 工具库
├── store/             # 状态管理
├── theme/             # 主题配置
├── types/             # TypeScript 类型定义
└── utils/             # 工具函数
```

## 开发环境配置

1. **环境要求**
   - Node.js (推荐 18.x 或更高版本)
   - npm 或 pnpm
   - iOS/Android 开发环境

2. **安装依赖**
   ```bash
   # 使用 npm
   npm install
   # 或使用 pnpm
   pnpm install
   ```

## 运行项目

1. **启动开发服务器**
   ```bash
   npm start
   # 或
   pnpm start
   ```

2. **运行在特定平台**
   ```bash
   # Android
   npm run android
   # iOS
   npm run ios
   # Web
   npm run web
   ```

## 项目特性

- 支持 iOS 和 Android 平台
- 使用 TypeScript 进行类型检查
- 集成 ESLint 和 Prettier 进行代码规范
- 支持 Tailwind CSS 样式系统
- 内置图片选择、视频播放等原生功能
- 支持后台播放和画中画模式

## 开发规范

- 使用 ESLint 进行代码检查：`npm run lint`
- 使用 Prettier 格式化代码：`npm run format`

## 构建与部署

项目使用 EAS (Expo Application Services) 进行构建和部署：
- Project ID: 8e80af25-2f84-48c4-9c82-9aeba55e5f83
- Bundle Identifier (iOS): com.anjiuwenhua.chengxinwangluoapp
- Package Name (Android): com.anjiuwenhua.chengxinwangluoapp