# 溢彩画高手 | 鸣潮 | 解题工具

溢彩画是一款鸣潮小游戏的编辑与解题工具，帮助玩家在目标步数内完成染色挑战。支持编辑模式和自动解题模式，助您轻松掌握游戏技巧。

## 功能

- **编辑题目**: 自定义游戏棋盘，设置目标颜色和最大步数。
- **自动解题**: 自动计算并展示在目标步数内完成染色的解决方案。
- **手动游玩**: 玩家可以在游戏模式下进行染色操作，实时更新步数。

## 使用说明

### 编辑题目

1. **切换到编辑模式**（目前默认编辑模式）
   - 勾选“编辑题目”复选框进入编辑模式。

2. **选择颜色**
   - 在“选择颜色”面板中选择您想要填充的颜色。

3. **自定义棋盘**
   - 点击棋盘上的方格更改其颜色。
   - 设置目标颜色和最大步数。

4. **保存题目**
   - 创建的新题目会自动保存到本地存储中。

### 自动解题

1. **加载题目**
   - 在编辑模式下创建或加载一个已有的题目。

2. **启动自动解题**
   - 点击“自动解题”按钮，工具将计算出在目标步数内完成染色的步骤。

3. **查看解题步骤**
   - 解题成功后，点击“查看解题步骤”按钮，逐步执行每一步操作。

### 手动游玩

1. **切换到游戏模式**
   - 取消勾选“编辑题目”复选框进入游戏模式。

2. **进行染色操作**
   - 点击棋盘上的方格进行染色，实时显示当前步数。

3. **完成挑战**
   - 达到目标步数或完成染色后，系统会提示结果。

### 提交问题

如果您发现任何问题或有改进建议，请在 [Issues](https://github.com/yourusername/溢彩画高手/issues) 中提交。


## 开发

确保您已经安装了 [Node.js](https://nodejs.org/) 和 [npm](https://www.npmjs.com/)。

1. **克隆仓库**

   ```bash
   git clone https://github.com/yourusername/溢彩画高手.git
   cd 溢彩画高手
   ```

2. **安装依赖**

   ```bash
   npm install
   # 或者使用 pnpm/yarn
   ```

## 开发

启动开发服务器：

```bash
npm run dev
```

或者启动服务器并在新标签页中打开应用：

```bash
npm run dev -- --open
```

开发过程中，代码的修改将会实时热更新。

## 构建

构建生产版本：

```bash
npm run build
```

预览生产版本：

```bash
npm run preview
```

## 部署

为了部署您的应用，您可能需要为目标环境安装一个 [adapter](https://kit.svelte.dev/docs/adapters)。部署到vercel则无需更改

[//]: # (TODO：vercel部署按钮)

