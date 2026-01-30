import { createRuntime, type Platform } from '@/util/runtime';
import createLogger from '@/util/logger';

// ==================== 对外暴露的运行时上下文 / 用例类型 ====================

export interface RuntimeContext {
    platform: Platform;
    context: string;
    log: ReturnType<typeof createLogger>;
    agent: any;
    device: any;
}

export type TestCase = (ctx: RuntimeContext) => Promise<void>;

/**
 * 统一的测试运行入口，提供类似 pytest fixture 的前后置能力。
 *
 * - 不支持通过参数自定义 hooks，所有用例共享一套默认 before/after/afterSuccess/afterFailure
 * - 用例只需要传入测试逻辑本身（testCase），其它生命周期由此函数托管
 */
export async function runTest(
    testCase: TestCase,
    platform: Platform,
    context: string,
): Promise<void> {
    const log = createLogger(`${context}:${platform}`);

    // 运行时对象，仅在前置阶段创建，在后置阶段销毁
    let agent: any | undefined;
    let device: any | undefined;

    // 默认前后置实现（内部函数，外部不可配置）
    const before = async () => {
        log.debug('==================== 前置操作 ====================');
        const runtime = await createRuntime(platform, context);
        agent = runtime.agent;
        device = runtime.device;
    };

    const after = async () => {
        log.debug('==================== 后置操作 ====================');
        if (device) {
            try {
                await device.destroy();
            } catch (e) {
                log.error('销毁 device 时出现异常', e);
            }
        }
    };

    const afterSuccess = async () => {
        log.debug('==================== 测试通过 ====================');
    };

    const afterFailure = async (error: Error) => {
        log.error('==================== 测试失败 ====================', error);
    };

    try {
        // 前置：创建 runtime
        await before();

        if (!agent || !device) {
            throw new Error('前置阶段未正确创建 runtime');
        }

        // 将完整的运行时上下文传递给用例
        await testCase({ platform, context, log, agent, device });

        // 成功钩子
        await afterSuccess();
    } catch (e) {
        // 失败钩子
        await afterFailure(e as Error);
        throw e;
    } finally {
        // 统一后置：销毁 runtime
        await after();
    }
}

