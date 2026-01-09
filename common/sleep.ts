/**
 * sleep.ts
 *
 * 延时工具函数
 * 作用：
 * - 在 UI 自动化中给页面、动画、网络请求留出缓冲时间
 * - 主要用于 Midscene 场景下的“非确定性等待”
 */

/**
 * sleep
 * @param ms 需要等待的时间，单位：毫秒
 * @returns Promise<void>，用于 await
 */
export function sleep(ms: number): Promise<void> {
    // 返回一个 Promise 对象
    return new Promise((resolve) => {
        // setTimeout 在指定毫秒后执行回调
        setTimeout(() => {
            // 触发 Promise 完成
            resolve();
        }, ms);
    });
}
