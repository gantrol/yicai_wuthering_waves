/* File: src/lib/utils/solverWorker.ts */
import { aStarSolve } from './solver';
import type { BFSResult } from '$lib/types';

self.addEventListener('message', async (e) => {
    const { grid, targetColor, maxSteps } = e.data as {
        grid: number[][];
        targetColor: number;
        maxSteps: number;
    };

    let result: BFSResult;
    try {
        result = aStarSolve(grid, targetColor, maxSteps);
    } catch (err) {
        result = {
            type: 'failure',
            message: (err as Error).message
        };
    }

    // 把结果发回主线程
    // 注意：如果 result 内含不可序列化对象(如函数)，需要先处理一下
    postMessage(result);
});

export {}; // 空导出避免跟 Worker 环境的默认冲突
