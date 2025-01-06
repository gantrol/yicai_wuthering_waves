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

export function getConnectedComponent(matrix: number[][], row: number, col: number): [number, number][] {
    const targetColor = matrix[row][col];
    const connectedComponent: [number, number][] = [];
    const queue: [number, number][] = [[row, col]];
    const visited = Array(matrix.length).fill(0).map(() => Array(matrix[0].length).fill(false));
    visited[row][col] = true;

    while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        connectedComponent.push([r, c]);

        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const newR = r + dr;
            const newC = c + dc;

            if (
                newR >= 0 &&
                newR < matrix.length &&
                newC >= 0 &&
                newC < matrix[0].length &&
                !visited[newR][newC] &&
                matrix[newR][newC] === targetColor
            ) {
                queue.push([newR, newC]);
                visited[newR][newC] = true;
            }
        }
    }

    return connectedComponent;
}

export function floodFill(currentGrid: number[][], newColor: number, row: number, col: number): number[][] {
    const newGrid = cloneMatrix(currentGrid);
    const oldColor = newGrid[row][col];
    if (oldColor === newColor) return newGrid;

    const connectedComponent = getConnectedComponent(newGrid, row, col);
    for (const [r, c] of connectedComponent) {
        newGrid[r][c] = newColor;
    }

    return newGrid;
}
