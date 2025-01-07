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

export function getAllConnectedComponents(matrix: number[][]): [number, number][][] {
    const visited = Array(matrix.length).fill(0).map(() => Array(matrix[0].length).fill(false));
    const components: [number, number][][] = [];

    for (let x = 0; x < matrix.length; x++) {
        for (let y = 0; y < matrix[0].length; y++) {
            if (!visited[x][y]) {
                const component = getConnectedComponent(matrix, x, y);
                component.forEach(([r, c]) => visited[r][c] = true);
                components.push(component);
            }
        }
    }

    return components;
}

export function colorConnectedComponent(matrix: number[][], connectedComponent: [number, number][], newColor: number): number[][] {
    const newMatrix = cloneMatrix(matrix);
    for (const [r, c] of connectedComponent) {
        newMatrix[r][c] = newColor;
    }
    return newMatrix;
}

export function floodFill(currentGrid: number[][], newColor: number, row: number, col: number): number[][] {
    const oldColor = currentGrid[row][col];
    if (oldColor === newColor) return cloneMatrix(currentGrid);

    const connectedComponent = getConnectedComponent(currentGrid, row, col);
    return colorConnectedComponent(currentGrid, connectedComponent, newColor);
}
