# midscene-ui-auto-tests

基于 **Midscene** 的移动端（**Android / iOS**）UI 自动化测试项目（TypeScript）。

> 说明：本仓库不是“拉下来就能纯本地跑”的项目。UI 自动化测试需要真实设备/模拟器 + 平台工具链（Android 的 adb / iOS 的 WDA/Xcode）以及 Midscene 所需的模型/环境变量配置。

---

## Todo

1. 运行前检查设备状态
2. Fixture
3. 多设备选择
4. 完善注释
5. 优化项目结构
6. 强制结束如何释放设备？
7. 运行时 midscene 自带的日志如何处理？
8. 代码质量检测

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
│  └─ sleep.ts
├─ runners/                # 运行入口
│  ├─ android.single.ts
│  ├─ ios.single.ts
│  └─ batch.ts
├─ package.json
└─ package-lock.json
```

---

## 日志配置

本项目使用统一的 logger 输出日志，日志级别通过 `.env` 或系统环境变量 `LOG_LEVEL` 控制。

支持的级别：
- `silent`：不输出日志
- `error`：仅输出错误
- `warn`：输出警告和错误
- `info`：输出关键步骤日志（默认）
- `debug`：输出所有调试日志（包含滚动等细节）

示例：在 `.env` 中配置

```env
LOG_LEVEL=debug
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

本仓库的 `.gitignore` 已忽略 `.env`，因此**新环境拉取后你需要自行准备 `.env`**。

**配置步骤**：

1. 复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的实际配置值（API Key、Base URL 等）



### 2) Android 准备

要运行 Android 用例，需要：
- 安装 Android SDK / platform-tools（确保 `adb` 可用）
- 连接 Android 真机

本项目在 `common/runtime.ts` 中会读取已连接设备列表，并默认使用第一个设备；若没有设备会报错：`未连接安卓设备`。

#### 2.1) 安装 Android SDK / platform-tools

**步骤 1：下载 Android SDK Command Line Tools**

> **目的**：Android SDK 提供了 `adb`（Android Debug Bridge）工具，这是连接和管理 Android 设备的命令行工具，Midscene 依赖它来与 Android 设备通信。

**方式 A：通过 Android Studio 安装（推荐）**

1. 下载并安装 [Android Studio](https://developer.android.com/studio)
2. 打开 Android Studio，进入 **More Actions > SDK Manager**
3. 在 **SDK Tools** 标签页中，勾选 **Android SDK Platform-Tools**
4. 点击 **Apply** 完成安装

**方式 B：独立安装 platform-tools**

1. 访问 [Android 开发者官网](https://developer.android.com/tools/releases/platform-tools)
2. 下载对应操作系统的 platform-tools 压缩包
3. 解压到任意目录（例如：`~/android/platform-tools`）

**步骤 2：配置环境变量**

> **目的**：将 `adb` 添加到系统 PATH 中，使终端可以在任何目录下直接执行 `adb` 命令，无需输入完整路径。

**macOS / Linux：**

1. 找到 platform-tools 的安装路径：
   - Android Studio：通常在 `~/Library/Android/sdk/platform-tools`（macOS）或 `~/Android/Sdk/platform-tools`（Linux）
   - 独立安装：你解压的目录路径

2. 编辑 shell 配置文件（根据你使用的 shell 选择）：
   - **zsh**（macOS 默认）：`~/.zshrc`
   - **bash**：`~/.bashrc` 或 `~/.bash_profile`

3. 添加以下内容（替换为你的实际路径）：

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

4. 重新加载配置：

```bash
# zsh
source ~/.zshrc

# bash
source ~/.bashrc
```

**Windows：**

1. 右键 **此电脑** > **属性** > **高级系统设置** > **环境变量**
2. 在 **系统变量** 中，找到 **Path**，点击 **编辑**
3. 点击 **新建**，添加 platform-tools 的完整路径（例如：`C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools`）
4. 点击 **确定** 保存

**步骤 3：验证 adb 安装**

> **目的**：确认 `adb` 已正确安装并添加到 PATH，可以正常使用。

在终端执行：

```bash
adb version
```

应显示 adb 的版本信息（例如：`Android Debug Bridge version 1.0.41`）。

如果提示 `command not found`，请检查：
- platform-tools 是否正确安装
- 环境变量是否配置正确
- 是否重新加载了 shell 配置

#### 2.2) 准备 Android 设备

**步骤 1：启用开发者选项**

> **目的**：Android 系统默认隐藏开发者选项，需要手动启用才能进行 USB 调试和开发操作。

1. 在 Android 手机上进入 **设置**
2. 找到 **关于手机**（或 **关于设备**）
3. 连续点击 **版本号**（或 **内部版本号**）7 次
4. 系统会提示"您已成为开发者"（或类似提示）

**步骤 2：启用 USB 调试**

> **目的**：USB 调试允许计算机通过 USB 连接控制 Android 设备，这是 `adb` 连接设备的前提条件。

1. 返回 **设置**，找到 **系统** > **开发者选项**（或直接在设置中搜索"开发者选项"）
2. 开启 **USB 调试**（或 **开发者选项**）
3. 如果出现安全提示，选择 **确定** 或 **允许**

**步骤 3：连接手机到电脑**

> **目的**：建立物理连接后，`adb` 才能识别设备并进行通信。

1. 使用 USB 数据线连接 Android 手机到电脑
2. 在手机上会弹出 **"允许 USB 调试吗？"** 的对话框
3. 勾选 **"始终允许使用这台计算机进行调试"**（可选，避免每次连接都弹出）
4. 点击 **确定** 或 **允许**

**步骤 4：验证设备连接**

> **目的**：确认设备已被 `adb` 正确识别，状态为 `device` 表示已授权并可以正常通信。

在终端执行：

```bash
adb devices
```

应看到类似输出：

```
List of devices attached
ABC123XYZ    device
```

- `ABC123XYZ` 是设备的序列号
- `device` 表示设备已连接且已授权（可以正常使用）
- 如果显示 `unauthorized`，需要在手机上重新授权 USB 调试
- 如果没有任何输出，检查 USB 连接和驱动

#### 2.3) 常见问题排查

**问题 1：adb devices 显示 "unauthorized"**

- 在手机上撤销 USB 调试授权：**设置 > 开发者选项 > 撤销 USB 调试授权**
- 重新连接手机，重新授权
- 检查手机是否锁屏，某些手机需要解锁才能授权

**问题 2：adb devices 没有显示设备**

- 检查 USB 连接是否正常（尝试更换 USB 线或 USB 端口）
- 检查手机是否已启用 USB 调试
- 尝试重启 adb 服务：

```bash
adb kill-server
adb start-server
adb devices
```

- Windows 用户可能需要安装手机驱动（通常手机会自动安装，或访问手机厂商官网下载）

**问题 3：adb command not found**

- 确认 platform-tools 已正确安装
- 检查环境变量配置是否正确
- 重新加载 shell 配置：`source ~/.zshrc`（或对应的配置文件）


### 3) iOS 准备

要运行 iOS 用例，需要：
- macOS + Xcode（含命令行工具）
- iOS 真机
- WebDriverAgent（WDA）可用

本项目在 `common/runtime.ts` 中默认连接：
- `wdaHost: localhost`
- `wdaPort: 8100`

因此你需要确保 WDA 已启动且可访问（或确保你的 Midscene / iOS 环境能自动拉起 WDA）。

#### 3.1) 安装和配置 Xcode

**步骤 1：安装 Xcode**

> **目的**：Xcode 是 iOS 开发的官方 IDE，提供编译工具、模拟器和设备管理功能，是运行 iOS 自动化测试的基础环境。

打开 **App Store**，搜索并安装 **Xcode**（通常需要几 GB 空间，下载时间较长）

**步骤 2：安装命令行工具**

> **目的**：命令行工具提供 `xcodebuild`、`xcrun` 等命令，用于在终端中构建项目、管理设备，WDA 的启动和自动化脚本依赖这些工具。

打开终端，执行：

```bash
xcode-select --install
```

如果提示已安装，可忽略。验证安装：

```bash
xcode-select -p
# 应输出类似：/Applications/Xcode.app/Contents/Developer
```

**步骤 3：接受 Xcode 许可协议**

> **目的**：首次使用 Xcode 工具前必须接受许可协议，否则无法执行构建和部署操作。

首次使用需要接受许可：

```bash
sudo xcodebuild -license accept
```

**步骤 4：打开 Xcode 并完成初始化**

> **目的**：登录 Apple ID 后，Xcode 会注册你的开发者身份，这是后续在真机上安装和运行 WDA 应用的必要条件。

1. 打开 Xcode（首次打开会提示安装额外组件，等待完成）
2. 进入 **Xcode > Settings > Accounts**，登录你的 Apple ID（用于真机调试）

#### 3.2) 准备 iOS 设备

**方式 A：使用真机（推荐用于真实场景测试）**

**步骤 1：启用开发者模式（iOS 16+）**

> **目的**：iOS 16+ 系统要求启用开发者模式才能安装和运行未签名的开发者应用（如 WDA），这是安全机制的一部分。

1. 在 iPhone 上进入 **设置 > 隐私与安全性**
2. 滚动到底部，找到 **开发者模式**
3. 开启 **开发者模式**，手机会要求重启
4. 重启后，会弹出确认对话框，点击 **打开**

> 注意：iOS 15 及以下版本无需此步骤。

**步骤 2：连接 iPhone 到 Mac**

> **目的**：建立物理连接后，Mac 才能识别设备并通过 USB 进行数据传输和调试，这是后续在设备上安装 WDA 的前提。

1. 使用 USB 数据线连接 iPhone 到 Mac
2. 在 iPhone 上弹出"要信任此电脑吗？"时，点击 **信任**
3. 输入 iPhone 密码确认

**步骤 3：在 Xcode 中信任设备**

> **目的**：Xcode 需要注册设备并准备开发环境（安装支持库、创建开发者证书等），这样才能在设备上部署和调试应用。

1. 打开 Xcode
2. 进入 **Window > Devices and Simulators**（或按 `Cmd + Shift + 2`）
3. 在左侧设备列表中，选择你的 iPhone
4. 如果显示 **"This device is not registered"**，点击 **"Use for Development"** 并登录 Apple ID
5. 等待 Xcode 完成设备准备（可能需要几分钟）

**步骤 4：验证设备连接**

> **目的**：确认设备已被系统正确识别，后续 WDA 启动时会用到该设备。

在终端执行：

```bash
xcrun xctrace list devices
```

应能看到你的 iPhone 设备信息。

#### 3.3) 安装和配置 WebDriverAgent（WDA）

WebDriverAgent 是 Facebook 开源的 iOS 自动化测试框架，Midscene 依赖它来控制 iOS 设备。

**步骤 1：克隆 WebDriverAgent 仓库**

> **目的**：获取 WDA 的源代码，这是构建和运行 WDA 应用的基础。

```bash
cd ~  # 或你希望存放的目录
git clone https://github.com/appium/WebDriverAgent.git
cd WebDriverAgent
```

**步骤 2：使用 Xcode 打开项目**

> **目的**：在 Xcode 中打开项目后，才能进行代码签名配置和启动操作。

```bash
open WebDriverAgent.xcodeproj
```

**步骤 3：配置签名（真机必需）**

> **目的**：iOS 系统要求所有应用必须有有效的代码签名才能安装到真机上。配置签名后，Xcode 会自动生成开发者证书和描述文件，使 WDA 应用可以在你的设备上运行。

1. 在 Xcode 左侧项目导航器中，选择 **WebDriverAgent** 项目
2. 选择 **WebDriverAgentRunner** target（不是 WebDriverAgentLib）
3. 进入 **Signing & Capabilities** 标签
4. 勾选 **Automatically manage signing**
5. 在 **Team** 下拉菜单中选择你的 Apple ID 团队（如果没有，点击 **Add Account** 添加）
6. 确保 **Bundle Identifier** 是唯一的（例如：`com.yourname.WebDriverAgent`）

**步骤 4：启动 WDA**

> **目的**：在 Xcode 中启动 WDA 应用，使其在设备上运行并提供自动化服务，Midscene 通过该服务控制 iOS 设备。

1. 在 Xcode 顶部选择 **WebDriverAgentRunner** scheme
2. 选择已连接的 iPhone 设备
3. 点击菜单栏的 **Product > Test**（或按 `Cmd + U`）
4. 首次运行会在 iPhone 上弹出输入密码提示，输入设备密码
5. 等待 WDA 应用安装并启动
6. 在 Xcode 控制台中，当看到显示 **"Automation Running"** 时，代表 WDA 启动成功

#### 3.4) 验证 WDA 是否正常运行

**步骤 1：在 iPhone 上验证 WDA 服务**

> **目的**：确认 WDA 应用已在设备上成功启动并运行，服务监听在 8100 端口。

1. 在 iPhone 上打开 **Safari 浏览器**
2. 访问：

```
http://localhost:8100/status
```

3. 如果返回 JSON 格式的状态信息（包含设备信息），说明 WDA 已在 iPhone 上正常运行

**步骤 2：理解网络访问限制**

> **目的**：WDA 服务运行在 iPhone 设备本机上，Mac 无法直接通过 `localhost:8100` 访问。需要通过端口转发工具将 iPhone 上的服务映射到 Mac 的本地端口。

**重要说明**：WDA 应用启动后，服务运行在 iPhone 设备本机的 `localhost:8100`。由于 Mac 和 iPhone 是不同的设备，Mac 无法直接访问 iPhone 上的 `localhost`。因此需要使用 `iproxy` 工具进行端口转发，将 iPhone 上的 8100 端口映射到 Mac 的 8100 端口。

**步骤 3：安装 iproxy**

> **目的**：安装端口转发工具，使 Mac 能够访问 iPhone 上运行的 WDA 服务。

在 Mac 终端执行：

```bash
# 安装 ios-webkit-debug-proxy（需要 Homebrew）
brew install ios-webkit-debug-proxy
```

**步骤 4：启动端口转发**

> **目的**：建立 Mac 和 iPhone 之间的端口映射，使 Mac 可以通过 `localhost:8100` 访问 iPhone 上的 WDA 服务。

1. 获取设备 UDID：

```bash
xcrun xctrace list devices
```

2. 启动 iproxy 转发（将 iPhone 的 8100 端口转发到 Mac 的 8100 端口）：

```bash
iproxy 8100 8100 -u <DEVICE_UDID>
```

其中 `<DEVICE_UDID>` 是上一步获取的设备 UDID。

3. 保持该终端窗口打开（iproxy 会持续运行，关闭终端会停止转发）

**步骤 5：在 Mac 上验证 WDA 服务**

> **目的**：确认端口转发成功，Mac 可以正常访问 WDA 服务，这是 Midscene 连接 WDA 的前提条件。

1. 在 Mac 浏览器中访问：

```
http://localhost:8100/status
```

2. 如果返回 JSON 格式的状态信息（与 iPhone 上访问的结果一致），说明端口转发成功，Mac 已可以正常访问 WDA 服务

3. 此时 Midscene 可以通过 `http://localhost:8100` 连接 WDA 进行自动化测试

#### 3.5) 常见问题排查

**问题 1：什么是 Homebrew？如何安装？**

> **目的**：Homebrew 是 macOS 的包管理器，用于安装命令行工具和软件包。安装 `iproxy` 需要先安装 Homebrew。

**Homebrew 简介**：
- Homebrew 是 macOS 上最流行的包管理器，类似于 Linux 的 `apt` 或 `yum`
- 通过 Homebrew 可以方便地安装各种开发工具和命令行程序
- 本项目中需要使用 Homebrew 安装 `ios-webkit-debug-proxy`（包含 `iproxy` 工具）

**安装 Homebrew**：

1. 打开终端，访问 [Homebrew 官网](https://brew.sh/) 获取最新安装命令
2. 安装过程中会提示输入 Mac 密码，按提示完成安装
3. 安装完成后，验证是否安装成功：

```bash
brew --version
```


**问题 2：Xcode 构建失败 - "Code Signing Error"**

- 确保已在 Xcode 中配置了正确的签名（见 3.3 步骤 3）
- 确保 Apple ID 已登录且团队可用
- 对于真机，确保设备已在 Xcode 中信任

**问题 3：真机无法安装 WDA - "Untrusted Developer"**

1. 在 iPhone 上进入 **设置 > 通用 > VPN 与设备管理**（或 **描述文件与设备管理**）
2. 找到你的开发者证书，点击并选择 **信任**

**问题 4：WDA 启动后立即崩溃**

- 检查设备系统版本是否与 WDA 兼容
- 查看 Xcode 控制台的错误日志
- 尝试重新构建项目：`Product > Clean Build Folder`（`Cmd + Shift + K`），然后重新构建

**问题 5：无法通过 localhost:8100 访问 WDA**

- 真机：WDA 运行在设备上，需要通过 `iproxy` 转发端口（见 3.4 步骤 4）
- 检查防火墙设置
- 确认 Xcode 控制台显示 **"Automatically"**，表示 WDA 已成功启动
- 确认 `iproxy` 正在运行（终端窗口保持打开状态）

---

## App 启动配置（必填 env）

跨平台 App 启动配置在：
- `common/app-config.ts`

其中：
- Android：使用 `packageName`（这里统一叫 `appId`）
- iOS：使用 `bundleId`（这里统一叫 `appId`）

本项目**不提供默认值**：启动 App 所需的 `appId` 必须从环境变量读取；如果未配置会直接报错。

### 需要配置的环境变量

在 `.env`（或 CI 环境变量）中配置：

```env
# Android 包名（packageName）
APP_ID_ANDROID=com.xxx.yyy

# iOS BundleId
APP_ID_IOS=com.xxx.yyy
```

### 行为说明

- 优先读取运行时环境变量（`process.env`）
- 若对应平台的环境变量缺失或为空字符串，会抛错：提示缺少 `APP_ID_ANDROID` / `APP_ID_IOS`

---

## 如何运行

### 运行命令

```bash
npx tsx runners/android.single.ts
npx tsx runners/ios.single.ts
npx tsx runners/batch.ts
```

如果你本机没有 `tsx`，`npx` 会自动临时下载运行（可能受网络/镜像影响）。

---

## 运行产物

运行日志/报告会输出到：
- `midscene_run/`


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

