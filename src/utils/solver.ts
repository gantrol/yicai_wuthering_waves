import { cloneMatrix, matrixToString, isAllTargetColor } from './gridUtils';

interface Step {
    A: number;
    B: number;
    position: [number, number];
}

interface Result {
    type: 'success' | 'failure';
    steps?: Step[];
    message?: string;
}

function applyOperation(matrix: number[][], A: number, x: number, y: number): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const B = matrix[x][y];
    const newMatrix = cloneMatrix(matrix);
    const queue: [number, number][] = [[x, y]];
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    visited[x][y] = true;

    while (queue.length > 0) {
        const [i, j] = queue.shift()!;
        if (newMatrix[i][j] === B) {
            newMatrix[i][j] = A;
            const directions: [number, number][] = [
                [i - 1, j],
                [i + 1, j],
                [i, j - 1],
                [i, j + 1],
            ];
            for (let [ni, nj] of directions) {
                if (
                    ni >= 0 &&
                    ni < rows &&
                    nj >= 0 &&
                    nj < cols &&
                    !visited[ni][nj] &&
                    newMatrix[ni][nj] === B
                ) {
                    queue.push([ni, nj]);
                    visited[ni][nj] = true;
                }
            }
        }
    }

    return newMatrix;
}

export function bfs(initialMatrix: number[][], targetColor: number, maxSteps: number): Result {
    const queue: { matrix: number[][]; steps: Step[]; depth: number }[] = [];
    const visited = new Set<string>();
    const availableColors = new Set(initialMatrix.flat());

    queue.push({ matrix: cloneMatrix(initialMatrix), steps: [], depth: 0 });
    visited.add(matrixToString(initialMatrix));

    while (queue.length > 0) {
        const current = queue.shift()!;
        const { matrix, steps, depth } = current;

        if (isAllTargetColor(matrix, targetColor)) {
            return { type: 'success', steps: steps };
        }

        if (depth >= maxSteps) continue;

        for (let A of availableColors) {
            for (let x = 0; x < matrix.length; x++) {
                for (let y = 0; y < matrix[0].length; y++) {
                    const B = matrix[x][y];
                    if (A === B) continue;
                    const newMatrix = applyOperation(matrix, A, x, y);
                    const matrixStr = matrixToString(newMatrix);
                    if (!visited.has(matrixStr)) {
                        visited.add(matrixStr);
                        queue.push({
                            matrix: newMatrix,
                            steps: [...steps, { A, B, position: [x, y] }],
                            depth: depth + 1,
                        });
                    }
                }
            }
        }
    }

    return { type: 'failure', message: "在4步内无法将所有数字变成目标颜色。" };
}
