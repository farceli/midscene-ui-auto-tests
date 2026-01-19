## midscene-ui-auto-tests

基于 **[Midscene.js](https://midscenejs.com/zh/)** 的移动端（Android / iOS）UI 自动化测试（TypeScript）。

## 项目结构

```text
.
├─ cases/                  # 测试用例
├─ common/                 # 业务通用能力
├─ run/                    # 运行入口
├─ util/                   # 基础通用能力
├─ package.json
├─ package-lock.json
└─ tsconfig.json
```

## 快速开始

### 环境准备

#### Android 环境准备

> 提示：你也可以参考 [Midscene 官方教程](https://midscenejs.com/zh/android-getting-started.html) 进行 Android 环境准备。

* **Android SDK**：Android SDK 是 Android 开发工具包，包含 `adb` 等工具，用于连接和控制 Android 设备，是运行 Android 自动化测试的前提。
* **USB 调试**：USB 调试允许计算机通过 USB 连接控制 Android 设备，这是 `adb` 连接设备的前提条件。

**Android SDK**

**安装方式：**

通过 [Android Studio](https://developer.android.com/studio) 安装，在 SDK Manager 中勾选 **Android SDK Platform-Tools**。

**配置环境变量：**

安装完成后，需要配置环境变量，具体配置方法请参考 [Android 官方文档](https://developer.android.com/tools/variables?hl=zh-cn)。

**验证安装：**

在终端执行以下命令进行验证：

```bash
adb --version
echo $ANDROID_HOME
```

**验证结果示例：**

```bash
# adb --version 输出示例
Android Debug Bridge version 1.0.41
Version 34.0.4-10481041
Installed as /Users/username/Library/Android/sdk/platform-tools/adb

# echo $ANDROID_HOME 输出示例
/Users/username/Library/Android/sdk
```

如提示 `command not found` 或路径为空，请检查安装和环境变量配置。

**USB 调试**

1. **启用开发者选项**：在 **设置** > **关于手机** 中，连续点击 **版本号** 7 次
2. **启用 USB 调试**：在 **设置** > **开发者选项** 中开启 **USB 调试**
3. **连接设备**：使用 USB 数据线连接手机到电脑，在手机上授权 USB 调试
4. **验证连接**：执行 `adb devices`，应看到设备显示为 `device` 状态。如显示 `unauthorized`，需重新授权

#### iOS 环境准备

> 提示：你也可以参考 [Midscene 官方教程](https://midscenejs.com/zh/ios-getting-started.html) 进行 iOS 环境准备。

* **Xcode**：Xcode 是 iOS 开发的官方 IDE，提供编译工具、模拟器和设备管理功能，是运行 iOS 自动化测试的基础环境。
* **iOS 设备**：需要 iOS 真机设备用于运行测试用例。
* **WebDriverAgent（WDA）**：WebDriverAgent 是 iOS 自动化测试框架，Midscene 依赖它来控制 iOS 设备。

**Xcode**

**安装方式：**

1. 打开 **App Store**，搜索并安装 **Xcode**，安装完成后打开 Xcode 并完成初始化：在初始化时勾选 **iOS** 并安装，然后进入 **Xcode > Settings**（快捷键：`Cmd + ,`）> **Accounts**，登录你的 Apple ID（用于真机调试）
2. 安装命令行工具：执行 `xcode-select --install`
3. 接受许可协议：执行 `sudo xcodebuild -license accept`

**验证安装：**

在终端执行 `xcode-select -p`，应输出 Xcode 的路径（例如：`/Applications/Xcode.app/Contents/Developer`）。如果打印的路径和示例出入很大，建议解决一下，避免后续问题。

**iOS 设备**

1. **启用开发者模式（iOS 16+）**：在 **设置 > 隐私与安全性** 中开启 **开发者模式**，重启后确认（iOS 15 及以下版本无需此步骤）
2. **连接设备**：使用 USB 数据线连接 iPhone 到 Mac，在 iPhone 上点击 **信任**
3. **在 Xcode 中信任设备**：打开 Xcode，进入 **Window > Devices and Simulators**，选择设备并点击 **"Use for Development"**（如需要）
4. **验证连接**：执行 `xcrun xctrace list devices`，应能看到你的 iPhone 设备信息

**WebDriverAgent（WDA）**

**安装方式：**

1. 克隆仓库：`git clone https://github.com/appium/WebDriverAgent.git && cd WebDriverAgent`
2. 打开项目：`open WebDriverAgent.xcodeproj`
3. 配置签名（真机必需）：
   * 在 Xcode 左侧项目导航器中，选择 **WebDriverAgent** 项目
   * 在项目设置中选择 **WebDriverAgentRunner** target（不是 WebDriverAgentLib）
   * 进入 **Signing & Capabilities** 标签
   * 勾选 **Automatically manage signing**
   * 在 **Team** 下拉菜单中选择你的 Apple ID（如果没有，点击 **Add Account** 添加）
   * 确保 **Bundle Identifier** 是唯一的（例如：`com.yourname.WebDriverAgent`）
4. 启动 WDA：在 Xcode 中选择 **WebDriverAgentRunner** scheme 和已连接的设备，点击 **Product > Test**，解锁手机按提示输入密码，等待屏幕显示 **"Automation Running"**

**配置端口转发：**

WDA 服务运行在 iPhone 设备本机的 `localhost:8100`，Mac 无法直接访问。需要使用 `iproxy` 工具进行端口转发：

1. 安装 iproxy：`brew install ios-webkit-debug-proxy`
2. 启动转发：`iproxy 8100 8100`
3. 保持该终端窗口打开（iproxy 会持续运行）

**验证安装：**

在 Mac 浏览器中访问 `http://localhost:8100/status`，如果返回 JSON 格式的状态信息，说明 WDA 已正常运行。

**环境要求：**

* Node.js `>= 18`
* Android：`adb` 可用 + 已连接设备
* iOS：macOS + WDA 可用（默认 `localhost:8100`）

**克隆仓库：**

```bash
git clone git@github.com:farceli/midscene-ui-auto-tests.git
cd midscene-ui-auto-tests
```

**安装依赖：**

```bash
npm ci
```

**配置环境变量：**

本仓库需要你自行准备 `.env`。

```bash
cp .env.example .env
```

配置内容详见 `.env.example` 文件。

## 如何运行

确保环境已准备完成（Android 设备已连接或 iOS WDA 已启动）后，执行以下命令运行测试：

**运行单个用例：**

```bash
# Android 平台
npx tsx run/android.single.ts

# iOS 平台
npx tsx run/ios.single.ts
```

**批量运行：**

```bash
npx tsx run/batch.ts
```

> 提示：如果你本机没有 `tsx`，`npx` 会自动临时下载运行（可能受网络/镜像影响）。


## 运行效率与降低 token 消耗

- **多用代码逻辑，少用 `agent.aiXXX`**：能用传统代码逻辑（条件判断、循环、局部函数/工具函数等）解决的问题，尽量在本地代码里完成，减少对大模型 `agent.ai` 能力的依赖，从而降低调用次数、提升执行速度与稳定性。
- **多用结构化 API，少用 `aiAct`**：在需要调用 AI 能力时，优先使用结构化接口（如 `aiBoolean`、`aiString`、`aiNumber` 等），只在无法结构化表达的复杂操作时再考虑使用 `aiAct`，这样可以显著减少 token 消耗，并让断言/逻辑更可预期、可维护。