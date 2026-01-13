# midscene-ui-auto-tests

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

**环境要求：**

* Node.js `>= 18`
* Android：`adb` 可用 + 已连接设备
* iOS：macOS + WDA 可用（默认 `localhost:8100`）

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

### 环境准备

#### Android 环境准备

* **`ADB`**：`ADB` 是 Android 开发工具，用于连接和控制 Android 设备，是运行 Android 自动化测试的前提。
* **USB 调试**：USB 调试允许计算机通过 USB 连接控制 Android 设备，这是 `adb` 连接设备的前提条件。

**ADB**

**安装方式：**

* **方式 A（推荐）**：通过 [Android Studio](https://developer.android.com/studio) 安装，在 SDK Manager 中勾选 **Android SDK Platform-Tools**
* **方式 B**：从 [Android 开发者官网](https://developer.android.com/tools/releases/platform-tools) 独立下载 platform-tools 压缩包并解压

安装完成后，需要将 `adb` 添加到系统 PATH 环境变量中，使终端可以在任何目录下直接执行 `adb` 命令。

**验证安装：**

在终端执行 `adb version`，应显示 adb 的版本信息。如提示 `command not found`，请检查安装和环境变量配置。

**USB 调试**

1. **启用开发者选项**：在 **设置** > **关于手机** 中，连续点击 **版本号** 7 次
2. **启用 USB 调试**：在 **设置** > **开发者选项** 中开启 **USB 调试**
3. **连接设备**：使用 USB 数据线连接手机到电脑，在手机上授权 USB 调试
4. **验证连接**：执行 `adb devices`，应看到设备显示为 `device` 状态。如显示 `unauthorized`，需重新授权

#### iOS 环境准备

* **Xcode**：Xcode 是 iOS 开发的官方 IDE，提供编译工具、模拟器和设备管理功能，是运行 iOS 自动化测试的基础环境。
* **iOS 设备**：需要 iOS 真机设备用于运行测试用例。
* **WebDriverAgent（WDA）**：WebDriverAgent 是 iOS 自动化测试框架，Midscene 依赖它来控制 iOS 设备。

**Xcode**

**安装方式：**

1. 打开 **App Store**，搜索并安装 **Xcode**
2. 安装命令行工具：执行 `xcode-select --install`（如已安装可忽略）
3. 接受许可协议：执行 `sudo xcodebuild -license accept`
4. 打开 Xcode 并完成初始化：进入 **Xcode > Settings > Accounts**，登录你的 Apple ID（用于真机调试）

**验证安装：**

在终端执行 `xcode-select -p`，应输出 Xcode 的路径（例如：`/Applications/Xcode.app/Contents/Developer`）。

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
