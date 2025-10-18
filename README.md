# React Web 应用

这是一个使用 React 18 构建的现代 Web 应用程序，配备了完整的开发环境。

## 功能特性

- ⚛️ React 18 最新版本
- 📦 Webpack 5 构建工具
- 🔄 Babel 转译器
- 🔥 热重载开发服务器
- 🎨 现代化 CSS 样式
- 📱 响应式设计

## 项目结构

```
├── public/
│   └── index.html          # HTML 模板
├── src/
│   ├── App.js              # 主应用组件
│   ├── App.css             # 应用样式
│   ├── index.js            # 应用入口
│   └── index.css           # 全局样式
├── package.json            # 项目配置
├── webpack.config.js       # Webpack 配置
├── .babelrc               # Babel 配置
└── README.md              # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm start
```

或者

```bash
npm run dev
```

应用将在 http://localhost:3000 启动，并自动在浏览器中打开。

### 3. 构建生产版本

```bash
npm run build
```

构建文件将输出到 `dist` 目录。

## 开发说明

- 开发服务器支持热重载，修改代码后会自动刷新页面
- 所有 React 组件都使用函数式组件和 Hooks
- CSS 样式采用现代设计，支持响应式布局
- 项目使用 ES6+ 语法，通过 Babel 转译

## 技术栈

- **React**: 18.2.0
- **Webpack**: 5.88.0
- **Babel**: 7.22.0
- **CSS**: 现代 CSS 特性

## 浏览器支持

支持所有现代浏览器，包括：
- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT License
