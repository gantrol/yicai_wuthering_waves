/* File: src/lib/utils/solver.ts */

import {cloneMatrix, matrixToString, isAllTargetColor, LOCKED_CELL_VALUE, getCodeOfTrueColors, getColorCount} from './gridUtils';
import type { Step, BFSResult } from "$lib/types";

/**
 * 一个简单的最小堆 PriorityQueue 实现。
 * 存储结构是内部数组，每个元素含有 priority（越小越优先）和 item。
 */
class PriorityQueue<T> {
    private heap: Array<{ priority: number; item: T }> = [];

    // 返回当前队列的长度
    public get length(): number {
        return this.heap.length;
    }

    // 判断队列是否为空
    public isEmpty(): boolean {
        return this.heap.length === 0;
    }

    /**
     * 入队：将 {item, priority} 插入到堆中
     */
    public enqueue(item: T, priority: number): void {
        this.heap.push({ priority, item });
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * 出队：取出优先级最小的元素
     */
    public dequeue(): T | undefined {
        if (this.isEmpty()) return undefined;

        // 交换首尾，再 pop 最后一个
        this.swap(0, this.heap.length - 1);
        const popped = this.heap.pop();
        this.bubbleDown(0);
        return popped?.item;
    }

    private bubbleUp(index: number) {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.heap[index].priority < this.heap[parentIndex].priority) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number) {
        const length = this.heap.length;
        while (true) {
            const left = (index << 1) + 1;
            const right = (index << 1) + 2;
            let smallest = index;

            if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }
            if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }
            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }

    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
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
            // Skip visited cells and locked cells
            if (!visited[r][c] && matrix[r][c] !== LOCKED_CELL_VALUE) {
                const color = matrix[r][c];
                visited[r][c] = true;
                const queue = [[r, c]];
                const regionCoords: Array<[number, number]> = [];

                while (queue.length > 0) {
                    const [cr, cc] = queue.shift()!;
                    regionCoords.push([cr, cc]);
                    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                        const nr = cr + dr;
                        const nc = cc + dc;
                        if (
                            nr >= 0 && nr < rows &&
                            nc >= 0 && nc < cols &&
                            !visited[nr][nc] &&
                            matrix[nr][nc] !== LOCKED_CELL_VALUE && // Ensure neighbor is not locked
                            matrix[nr][nc] === color
                        ) {
                            visited[nr][nc] = true;
                            queue.push([nr, nc]);
                        }
                    }
                }

                if (!colorRegions.has(color)) {
                    colorRegions.set(color, []);
                }
                colorRegions.get(color)!.push(regionCoords);
            }
            // Mark locked cells as visited to avoid processing them
            else if (matrix[r][c] === LOCKED_CELL_VALUE) {
                visited[r][c] = true;
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
 * 3) 启发式函数 (heuristic) V1：
 *    - 使用「剩余不是目标颜色的 连通分区数」作为评估
 */
function heuristicV1(matrix: number[][], targetColor: number): number {
    const colorRegions = getAllColorRegions(matrix);
    if (isAllTargetColor(matrix, targetColor)) {
        return 0;
    }
    let count = 0;
    for (const [color, regions] of colorRegions.entries()) {
        if (color !== targetColor) {
            count += regions.length;
        }
    }
    return count;
}

/**
 * 3) 启发式函数 (heuristic) V2：
 *    - 使用「剩余非目标色的格子数」作为评估
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
    g: number;   // 已经走了多少步
    h: number;   // 启发式评估值
    steps: Step[];
}

/**
 * 4) A* 搜索主函数： 用连通分区剪枝 + 启发式 + 优先队列
 * @param initialMatrix 初始棋盘
 * @param targetColor   目标颜色
 * @param maxSteps      最大步数限制
 * @param useHeuristicV2 是否使用第二种启发式
 * @returns BFSResult
 */
export function aStarSolve(
    initialMatrix: number[][],
    targetColor: number,
    maxSteps: number,
    useHeuristicV2 = false
): BFSResult {
    // 初始化优先队列 (最小堆)
    const openSet = new PriorityQueue<AStarState>();

    // 帮助函数：往优先队列里插入状态
    function pushState(st: AStarState) {
        const priority = st.g + st.h; // f = g + h
        openSet.enqueue(st, priority);
    }

    const startH = useHeuristicV2
        ? heuristicV2(initialMatrix, targetColor)
        : heuristicV1(initialMatrix, targetColor);

    // 起始状态入队
    pushState({
        matrix: cloneMatrix(initialMatrix),
        g: 0,
        h: startH,
        steps: []
    });

    // visited: 棋盘字符串 -> 该棋盘最小的 g 值
    const visited = new Map<string, number>();
    visited.set(matrixToString(initialMatrix), 0);

    // A* 主循环
    while (!openSet.isEmpty()) {
        // 取出 f 最小的状态
        const current = openSet.dequeue()!;
        const { matrix, g, h, steps } = current;

        // 检查是否已达全目标色
        const colorCount = getColorCount(matrix, targetColor);
        if (colorCount.count === 1 && colorCount.hasTargetColor) {
            return { type: 'success', steps };
        }

        // 若已走到 maxSteps，就不再深入
        if (g >= maxSteps) {
            continue;
        }

        // 如果剩余步数不足以合并所有颜色，则剪枝
        if (g + (colorCount.count - (colorCount.hasTargetColor ? 1 : 0)) > maxSteps) {
            continue;
        }

        // 生成后继状态
        const colorRegions = getAllColorRegions(matrix);
        const allColors = Array.from(colorRegions.keys()).filter(c => c !== LOCKED_CELL_VALUE);
        for (const A of allColors) {
            for (const [B, regions] of colorRegions.entries()) {
                if (A === B) continue; // 染成一样的颜色无意义

                for (const region of regions) {
                    // 把此 region 一次性染成 A
                    const newMatrix = fillRegion(matrix, region, A);
                    const newMatrixStr = matrixToString(newMatrix);
                    const newG = g + 1;

                    // 若该棋盘出现过且之前的 g 更优，则跳过
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
 * 5) 尝试先用直接目标色搜索，若失败，再尝试中转色
 */
export function solvePuzzleWithFallback(
    grid: number[][],
    targetColor: number,
    maxSteps: number
): BFSResult {
    const directResult = aStarSolve(grid, targetColor, maxSteps);
    if (directResult.type === 'success') {
        return directResult;
    }

    // 如果直接染成目标色在 maxSteps 内失败，则尝试中转色
    for (let intermediate of getCodeOfTrueColors()) {
        if (intermediate === targetColor) continue;

        // 先在 maxSteps - 1 步内染成 intermediate 色
        const midResult = aStarSolve(grid, intermediate, maxSteps - 1, true);
        if (midResult.type === 'success' && midResult.steps) {
            // 再用 1 步把 intermediate -> targetColor
            const finalMatrix = cloneMatrix(grid);
            for (const st of midResult.steps) {
                const colorRegions = getAllColorRegions(finalMatrix);
                const region = colorRegions.get(st.B!)?.find(
                    r => r[0][0] === st.position[0] && r[0][1] === st.position[1]
                );
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
                    finalStep = {
                        A: targetColor,
                        B: intermediate,
                        position: firstRegion[0]
                    };
                    // 执行最后一步
                    for (const [r, c] of firstRegion) {
                        finalMatrix[r][c] = targetColor;
                    }
                }
            }

            if (finalStep) {
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
        message: `在 ${maxSteps} 步内，无法全部染成 ${targetColor} 色。`
    };
}
