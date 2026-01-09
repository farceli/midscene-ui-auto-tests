# midscene-ui-auto-tests

基于 **Midscene** 的移动端（**Android / iOS**）UI 自动化测试项目（TypeScript）。

> 说明：本仓库不是“拉下来就能纯本地跑”的那种项目。UI 自动化测试需要真实设备/模拟器 + 平台工具链（Android 的 adb / iOS 的 WDA/Xcode）以及 Midscene 所需的模型/环境变量配置。

---

## 项目结构

```text
.
├─ cases/                  # 测试用例
│  ├─ store/
│  │  └─ car-page.smoke.ts
│  └─ profile/
├─ common/                 # 通用能力
│  ├─ app-config.ts        # App 启动配置（包名/bundleId）
│  ├─ runtime.ts           # Midscene runtime：创建 device + agent
│  ├─ scroll.ts            # 滚动相关封装
│  ├─ scroll-query.ts
│  └─ sleep.ts
├─ runners/                # 运行入口
│  ├─ android.single.ts
│  ├─ ios.single.ts
│  └─ batch.ts
├─ package.json
└─ package-lock.json
```

---

## 环境要求

### Node.js
- 建议 Node.js：**>= 18**
- 包管理器：npm

安装依赖：

```bash
npm ci
# 或：npm install
```

---

## 运行前准备（关键）

### 1) Midscene / AI 配置

Midscene 在执行 `aiAct / aiQuery` 时通常需要模型服务配置（例如 API Key、Base URL 等）。

本仓库的 `.gitignore` 已忽略 `.env`，因此**新环境拉取后你需要自行准备 `.env`（或在系统环境变量中配置）**。

> 你可以在本仓库自行补充一个 `.env.example`（仅提供变量名，不提交密钥），以便其他同学开箱。


### 2) Android 准备

要运行 Android 用例，需要：
- 安装 Android SDK / platform-tools（确保 `adb` 可用）
- 连接 Android 真机或启动模拟器

检查设备是否连接成功：

```bash
adb devices
```

至少需要看到 1 台设备且状态为 `device`。

> `common/runtime.ts` 中会读取已连接设备列表，并默认使用第一个设备；若没有设备会报错：`未连接安卓设备`。


### 3) iOS 准备

要运行 iOS 用例，需要：
- macOS + Xcode（含命令行工具）
- iOS 真机或模拟器
- WebDriverAgent（WDA）可用

本项目在 `common/runtime.ts` 中默认连接：
- `wdaHost: localhost`
- `wdaPort: 8100`

因此你需要确保 WDA 已启动且可访问（或确保你的 Midscene / iOS 环境能自动拉起 WDA）。

---

## App 启动配置

跨平台 App 启动配置在：
- `common/app-config.ts`

其中：
- Android：使用 `packageName`（这里统一叫 `appId`）
- iOS：使用 `bundleId`（这里统一叫 `appId`）

你需要按实际被测 App 修改：

```ts
export const APP_LAUNCH_CONFIG = {
  android: {
    appId: 'com.xxx.yyy',
  },
  ios: {
    appId: 'com.xxx.yyy',
  },
};
```

---

## 如何运行

### 当前情况（重要）

当前 `package.json` 里 **没有** 配置可直接运行的 `scripts`，因此你需要通过 TS 运行器启动（例如 `tsx` 或 `ts-node`）。

推荐使用 `tsx`（更轻量、体验更好）。

### 方式 A：使用 tsx（推荐）

```bash
npx tsx runners/android.single.ts
npx tsx runners/ios.single.ts
npx tsx runners/batch.ts
```

如果你本机没有 `tsx`，`npx` 会自动临时下载运行（可能受网络/镜像影响）。

### 方式 B：使用 ts-node

```bash
npx ts-node runners/android.single.ts
npx ts-node runners/ios.single.ts
```

> 如果执行报错提示缺少 `typescript/ts-node`，请在项目中补充 devDependencies（见下方“建议完善”）。

---

## 运行产物

运行日志/报告会输出到：
- `midscene_run/`

该目录已在 `.gitignore` 中忽略，不会提交到 Git。

---

## 常见问题（Troubleshooting）

### Android：报错“未连接安卓设备”
- 执行 `adb devices` 看是否识别到设备
- 检查手机是否弹出授权窗口并点击允许
- 重启 adb：

```bash
adb kill-server
adb start-server
```

### iOS：无法连接 WDA（localhost:8100）
- 确认 WDA 正在运行且端口可访问
- 确认端口 8100 未被占用
- 真机需要正确的开发者签名/信任设置（取决于你的 WDA 部署方式）

---

## 建议完善（让新环境更容易跑起来）

建议补充：
1. `.env.example`：提供必要环境变量名称（不提交真实密钥）
2. `package.json` scripts：
   - `test:android` / `test:ios` / `test:batch`
3. `devDependencies`（如你希望开箱即用地运行 TS）：
   - `typescript`
   - `tsx`（推荐）或 `ts-node`

---

## License

UNLICENSED

