export function cloneMatrix(matrix: number[][]): number[][] {
    return matrix.map(row => [...row]);
}

export function matrixToString(matrix: number[][]): string {
    return matrix.map(row => row.join(',')).join(';');
}

export function isGoalState(matrix: number[][], targetColor: number): boolean {
    return matrix.every(row => row.every(cell => cell === targetColor));
}

export function isAllTargetColor(matrix: number[][], targetColor: number): boolean {
    return isGoalState(matrix, targetColor);
}

export function floodFill(currentGrid: number[][], newColor: number, row: number, col: number): number[][] {
    const oldColor = currentGrid[row][col];
    if (oldColor === newColor) return currentGrid;

    const queue: [number, number][] = [[row, col]];
    const visited = Array(currentGrid.length).fill(0).map(() => Array(currentGrid[0].length).fill(false));
    visited[row][col] = true;

    while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        currentGrid[r][c] = newColor;

        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const newR = r + dr;
            const newC = c + dc;

            if (
                newR >= 0 &&
                newR < currentGrid.length &&
                newC >= 0 &&
                newC < currentGrid[0].length &&
                !visited[newR][newC] &&
                currentGrid[newR][newC] === oldColor
            ) {
                queue.push([newR, newC]);
                visited[newR][newC] = true;
            }
        }
    }

    return currentGrid;
}
