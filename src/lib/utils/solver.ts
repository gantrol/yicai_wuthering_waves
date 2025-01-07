/* File: src/lib/utils/solver.ts */
import { cloneMatrix, matrixToString, isAllTargetColor } from './gridUtils';

// 如果你项目里已定义过 Step / BFSResult，这里可以复用，或改名为 AStarResult
export interface Step {
    A: number;         // 要染成的新颜色
    B?: number;        // 原先的颜色
    position: [number, number]; // 任意记录一下这次点击或染色对应的坐标
}

export interface BFSResult {
    type: 'success' | 'failure';
    steps?: Step[];
    message?: string;
}

/**
 * 1) 获取当前棋盘 matrix 中，所有颜色的连通分区
 *    返回一个 Map：color -> [若干个分区]，每个分区是坐标数组
 */
function getAllColorRegions(matrix: number[][]): Map<number, Array<Array<[number, number]>>> {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const colorRegions = new Map<number, Array<Array<[number, number]>>>();

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!visited[r][c]) {
                // 当前格子的颜色
                const color = matrix[r][c];
                visited[r][c] = true;
                // BFS/DFS 收集所有同色连通格子
                const queue = [[r, c]];
                const regionCoords: Array<[number, number]> = [];

                while (queue.length > 0) {
                    const [cr, cc] = queue.shift()!;
                    regionCoords.push([cr, cc]);
                    // 四方向
                    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                        const nr = cr + dr;
                        const nc = cc + dc;
                        if (
                            nr >= 0 && nr < rows &&
                            nc >= 0 && nc < cols &&
                            !visited[nr][nc] &&
                            matrix[nr][nc] === color
                        ) {
                            visited[nr][nc] = true;
                            queue.push([nr, nc]);
                        }
                    }
                }

                // 把这一整片连通分区挂到 colorRegions[color]
                if (!colorRegions.has(color)) {
                    colorRegions.set(color, []);
                }
                colorRegions.get(color)!.push(regionCoords);
            }
        }
    }
    return colorRegions;
}

/**
 * 2) 对同一颜色的一个连通分区一次性染成新颜色 A
 */
function fillRegion(matrix: number[][], region: Array<[number, number]>, A: number): number[][] {
    const newMatrix = cloneMatrix(matrix);
    for (const [r, c] of region) {
        newMatrix[r][c] = A;
    }
    return newMatrix;
}

/**
 * 3) 启发式函数 (heuristic)：
 *    这里用「剩余不是目标颜色的 连通分区数」作为估算。
 *    返回值越小，代表离目标越近。
 *    - 如果你对游戏机制更熟悉，可尝试别的启发式，比如「剩余非目标色格子数 / 每次能影响的格子数」等。
 */
function heuristic(matrix: number[][], targetColor: number): number {
    const colorRegions = getAllColorRegions(matrix);
    // 如果棋盘全是目标色，启发值=0
    if (isAllTargetColor(matrix, targetColor)) {
        return 0;
    }
    // 统计所有「非目标色」的分区总数
    let count = 0;
    for (const [color, regions] of colorRegions.entries()) {
        if (color !== targetColor) {
            count += regions.length;
        }
    }
    return count;
}

/**
 * AStarState：存储 A* 搜索过程中的节点信息
 */
interface AStarState {
    matrix: number[][]; // 当前棋盘
    g: number;          // 已经走了多少步
    h: number;          // 启发式估计值
    steps: Step[];      // 走到这里的操作序列
}

/**
 * 4) A* 搜索主函数： 用连通分区剪枝 + 启发式
 * @param initialMatrix 初始棋盘
 * @param targetColor   目标颜色
 * @param maxSteps      最大步数限制
 * @returns BFSResult (兼容之前的接口)
 */
export function aStarSolve(
    initialMatrix: number[][],
    targetColor: number,
    maxSteps: number
): BFSResult {
    // 1) 初始化 openSet (优先队列), visited
    //    这里用一个简单的“最小堆”或第三方库 PriorityQueue
    //    如果你没有库，可以自己实现一个小顶堆或用数组手动 sort
    const openSet: AStarState[] = [];
    // pushState 函数帮助我们往 openSet 里插入并保持排序
    function pushState(st: AStarState) {
        openSet.push(st);
        // 每次 push 后做个 sort，让 f = g+h 最小的在前面
        openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
    }

    const startH = heuristic(initialMatrix, targetColor);
    pushState({
        matrix: cloneMatrix(initialMatrix),
        g: 0,
        h: startH,
        steps: []
    });

    // visited 用来存储：某个棋盘字符串 -> 该棋盘最小的 g 值
    // 若再次遇到相同棋盘，但 g 没有更优，就不再扩展
    const visited = new Map<string, number>();
    visited.set(matrixToString(initialMatrix), 0);

    // 2) A* 主循环
    while (openSet.length > 0) {
        // 取出 f = g+h 最小的状态
        const current = openSet.shift()!;
        const { matrix, g, h, steps } = current;

        // 2.1) 检查是否已达成全目标色
        if (isAllTargetColor(matrix, targetColor)) {
            return { type: 'success', steps };
        }
        // 2.2) 若已走到 maxSteps，就不再深入
        if (g >= maxSteps) {
            continue;
        }

        // 2.3) 生成后继状态
        const colorRegions = getAllColorRegions(matrix);
        const allColors = Array.from(colorRegions.keys());
        for (const A of allColors) {
            // 遍历“待染色”的片区所对应的颜色 B
            for (const [B, regions] of colorRegions.entries()) {
                if (A === B) continue; // 染成一样的颜色无意义

                for (const region of regions) {
                    // 把此 region 一次性染成 A
                    const newMatrix = fillRegion(matrix, region, A);
                    const newMatrixStr = matrixToString(newMatrix);

                    const newG = g + 1;
                    // 若已经访问过，且之前的 g 更优，则跳过
                    if (visited.has(newMatrixStr) && visited.get(newMatrixStr)! <= newG) {
                        continue;
                    }

                    // 计算新的启发值
                    const newH = heuristic(newMatrix, targetColor);
                    visited.set(newMatrixStr, newG);

                    // 加入 openSet
                    pushState({
                        matrix: newMatrix,
                        g: newG,
                        h: newH,
                        steps: [...steps, { A, B, position: region[0] }]
                    });
                }
            }
        }
    }

    // 如果整个 openSet 都空了，还没找到解
    return { type: 'failure', message: `在 ${maxSteps} 步内无法将所有数字变成目标颜色。` };
}
