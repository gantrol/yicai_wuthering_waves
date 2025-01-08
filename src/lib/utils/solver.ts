/* File: src/lib/utils/solver.ts */
import { cloneMatrix, matrixToString, isAllTargetColor } from './gridUtils';
import type {Step, BFSResult} from "$lib/types";
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
 *    - 还可以尝试别的启发式，比如「剩余非目标色格子数 / 每次能影响的格子数」等。
 */
function heuristicV1(matrix: number[][], targetColor: number): number {
    const colorRegions = getAllColorRegions(matrix);
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
 * 新启发式：示例为简单的“剩余非目标色格子数”
 * （亦可自行扩展为：非目标色格子数 / 平均可染色区域大小）
 */
function heuristicV2(matrix: number[][], targetColor: number): number {
    let nonTargetCount = 0;
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[0].length; c++) {
            if (matrix[r][c] !== targetColor) {
                nonTargetCount++;
            }
        }
    }
    return nonTargetCount;
}


/**
 * AStarState：存储 A* 搜索过程中的节点信息
 */
interface AStarState {
    matrix: number[][];
    g: number; // 已经走了多少步
    h: number; // 启发式评估值
    steps: Step[];
}

/**
 * 4) A* 搜索主函数： 用连通分区剪枝 + 启发式
 * @param initialMatrix 初始棋盘
 * @param targetColor   目标颜色
 * @param maxSteps      最大步数限制
 * @param useHeuristicV2 第二种启发式
 * @returns BFSResult
 */
export function aStarSolve(
    initialMatrix: number[][],
    targetColor: number,
    maxSteps: number,
    useHeuristicV2 = false
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

    const startH = useHeuristicV2
        ? heuristicV2(initialMatrix, targetColor)
        : heuristicV1(initialMatrix, targetColor);

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

                    const newH = useHeuristicV2
                        ? heuristicV2(newMatrix, targetColor)
                        : heuristicV1(newMatrix, targetColor);

                    visited.set(newMatrixStr, newG);
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
    return { type: 'failure', message: `在 ${maxSteps} 步内无法将所有数字变成目标颜色。` };
}

/**
 * 尝试先用直接目标色搜索，若失败，再尝试中转色
 * @param grid 初始矩阵
 * @param targetColor 目标颜色
 * @param maxSteps 允许步数
 */
export function solvePuzzleWithFallback(
    grid: number[][],
    targetColor: number,
    maxSteps: number
): BFSResult {
    // 先用新的启发式 V2 直接 A* 搜索
    const directResult = aStarSolve(grid, targetColor, maxSteps);
    if (directResult.type === 'success') {
        return directResult;
    }

    // 如果直接染成目标色在 maxSteps 内失败，则尝试中转色
    // 这里假设颜色只有 1 ~ 4, 并排除目标色本身
    for (let intermediate = 1; intermediate <= 4; intermediate++) {
        if (intermediate === targetColor) continue;

        // 先在 maxSteps - 1 步内染成 intermediate 色
        const midResult = aStarSolve(grid, intermediate, maxSteps - 1, true);
        if (midResult.type === 'success' && midResult.steps) {
            // 再看最后是否可以用 1 步把 intermediate -> targetColor
            // 简化处理：认为所有 intermediate 色可以一次性填充
            // 做法：只要找到一个 intermediate 色的连通分量，做一次 fillRegion
            // 由于不一定连通，这里只是演示，可以自行扩展多步
            // 这里把第一个 region 当作“染色点击点”，忽略可能的多个散开的 region
            const finalMatrix = cloneMatrix(grid);
            // 先执行 midResult 的 steps
            for (const st of midResult.steps) {
                const colorRegions = getAllColorRegions(finalMatrix);
                const region = colorRegions.get(st.B!)?.find(r => r[0][0] === st.position[0] && r[0][1] === st.position[1]);
                if (region) {
                    for (const [rr, cc] of region) {
                        finalMatrix[rr][cc] = st.A;
                    }
                }
            }
            // 最后一步：填充成 targetColor
            let finalStep: Step | undefined;
            const colorRegionsAfter = getAllColorRegions(finalMatrix);
            if (colorRegionsAfter.has(intermediate)) {
                const regionsOfInter = colorRegionsAfter.get(intermediate)!;
                if (regionsOfInter.length > 0) {
                    const firstRegion = regionsOfInter[0];
                    const newMat = fillRegion(finalMatrix, firstRegion, targetColor);
                    finalStep = {
                        A: targetColor,
                        B: intermediate,
                        position: firstRegion[0]
                    };
                }
            }

            if (finalStep) {
                // 拼接所有操作
                const stepsAll = [...midResult.steps, finalStep];
                if (stepsAll.length <= maxSteps) {
                    return {
                        type: 'success',
                        steps: stepsAll
                    };
                }
            }
        }
    }

    return {
        type: 'failure',
        message: `在 ${maxSteps} 步内，无法全部染成 ${targetColor} 色`
    };
}
