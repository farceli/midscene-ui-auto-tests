import { launchApp } from '@/common/launch-app';
import { selectMenu } from '@/common/navigation';
import { selectStoreTab } from '@/common/store';
import { runTest } from '@/util/fixture';

const context = 'fixture-demo';

/**
 * 一个使用 fixture 的 demo 用例：
 * - 通过 runTest 统一托管前后置逻辑 + runtime 生命周期（createRuntime / destroy）
 * - 用例内部只关注业务步骤（启动 App -> 进入商店-周边 Tab）
 */
export async function runFixtureDemoTest(platform: 'android' | 'ios') {
    await runTest(
        async ({ platform, log, agent, device }) => {
            await launchApp({ platform, device, agent }, { log });
        },
        platform,
        context,
    );
}

