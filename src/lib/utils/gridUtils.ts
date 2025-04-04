/* File: src/lib/utils/gridUtils.ts */
import type {ColorCount, Step} from "$lib/types";

export const LOCKED_CELL_VALUE = -1;

const colorsValue = ['#ffffff', '#4980b9', '#d2463e', '#f5db82', '#59a68d', '#333333'];
const colorsName = ['空', '蓝', '红', '黄', '绿', '锁'];


export function cloneMatrix(matrix: number[][]): number[][] {
    return matrix.map(row => [...row]);
}

export function matrixToString(matrix: number[][]): string {
    return matrix.map(row => row.join(',')).join(';');
}

export function isGoalState(matrix: number[][], targetColor: number): boolean {
    return matrix.every(row => row.every(cell => cell === LOCKED_CELL_VALUE || cell === targetColor));
}

export function isAllTargetColor(matrix: number[][], targetColor: number): boolean {
    return isGoalState(matrix, targetColor);
}

export function getColorCount(matrix: number[][], targetColor: number): ColorCount {
    const colorCount: ColorCount = { count: 0, hasTargetColor: false };
    const colorSet = new Set<number>();
    for (const row of matrix) {
        for (const cell of row) {
            if (cell === LOCKED_CELL_VALUE) {
                continue;
            }
            colorSet.add(cell);
            if (cell === targetColor) {
                colorCount.hasTargetColor = true;
            }
        }
    }
    colorCount.count = colorSet.size;
    return colorCount;
}


export function floodFill(currentGrid: number[][], newColor: number, row: number, col: number): number[][] {
    const rows = currentGrid.length;
    const cols = currentGrid[0].length;

    if (row < 0 || row >= rows || col < 0 || col >= cols) return currentGrid;

    const oldColor = currentGrid[row][col];
    if (oldColor === LOCKED_CELL_VALUE || oldColor === newColor) return currentGrid;

    const gridCopy = cloneMatrix(currentGrid);
    const queue: [number, number][] = [[row, col]];
    const visited = Array(rows).fill(0).map(() => Array(cols).fill(false));
    visited[row][col] = true;

    while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        gridCopy[r][c] = newColor;

        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const newR = r + dr;
            const newC = c + dc;

            if (
                newR >= 0 &&
                newR < rows &&
                newC >= 0 &&
                newC < cols &&
                !visited[newR][newC] &&
                gridCopy[newR][newC] !== LOCKED_CELL_VALUE &&
                gridCopy[newR][newC] === oldColor
            ) {
                queue.push([newR, newC]);
                visited[newR][newC] = true;
            }
        }
    }

    return gridCopy;
}
export function floodFillWave(
    currentGrid: number[][],
    row: number,
    col: number,
    oldColor: number
): Array<Array<[number, number]>> {
    const rowCount = currentGrid.length;
    const colCount = currentGrid[0].length;

    if (row < 0 || row >= rowCount || col < 0 || col >= colCount || currentGrid[row][col] === LOCKED_CELL_VALUE || currentGrid[row][col] !== oldColor) {
        return [];
    }

    const visited = Array.from({ length: rowCount }, () => Array(colCount).fill(false));
    const queue: [number, number, number][] = []; // [row, col, distance]
    const waveLayers: Array<Array<[number, number]>> = [];

    visited[row][col] = true;
    queue.push([row, col, 0]);

    let head = 0;
    while (head < queue.length) {
        const [r, c, dist] = queue[head++];
        if (!waveLayers[dist]) {
            waveLayers[dist] = [];
        }
        waveLayers[dist].push([r, c]);

        const dirs: [number, number][] = [[1,0],[-1,0],[0,1],[0,-1]];
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (
                nr >= 0 && nr < rowCount &&
                nc >= 0 && nc < colCount &&
                !visited[nr][nc] &&
                currentGrid[nr][nc] !== LOCKED_CELL_VALUE &&
                currentGrid[nr][nc] === oldColor
            ) {
                visited[nr][nc] = true;
                queue.push([nr, nc, dist + 1]);
            }
        }
    }
    return waveLayers;
}


export function getColors(): string[] {
    return colorsValue;
}

export function getColorName(index: number): string {
    if (index === LOCKED_CELL_VALUE) {
        return colorsName[5]; // 'Locked'
    }
    if (index >= 0 && index < 5) {
        return colorsName[index];
    }
    return 'Unknown';
}

export function getColorsForPicker(includeLocked = false): string[] {
    const baseColors = colorsValue.slice(1, 5); // 1-Blue, 2-Red, 3-Yellow, 4-Green
    if (includeLocked) {
        // Add the visual style for locked, which is index 5
        return [...baseColors, colorsValue[5]];
    }
    return baseColors;
}

export function getCodeOfTrueColors(): number[] {
    return [1, 2, 3, 4];
}

export function getDescriptionForSolutionStep(step: Step) {
    return `选${getColorName(step.A)}色(${step.A}号)，点击${getColorName(step.B)}方格(${step.position[0] + 1}, ${step.position[1] + 1})`
}


export function getDescriptionObjectForSolutionStep(step: Step, index: number) {
    const colorNameA = getColorName(step.A);
    const originalColorName = step.B !== undefined ? getColorName(step.B) : 'Unknown';
    return {
        step: index + 1,
        colorName: colorNameA,
        colorIndex: step.A,
        originalColorName: originalColorName, // The color being replaced
        positionRow: step.position[0] + 1,
        positionCol: step.position[1] + 1,
    }
}
