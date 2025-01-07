import { cloneMatrix, matrixToString, isAllTargetColor, colorConnectedComponent, getAllConnectedComponents } from './gridUtils';

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

        const components = getAllConnectedComponents(matrix);

        for (let A of availableColors) {
            for (const component of components) {
                const [x, y] = component[0];
                const B = matrix[x][y];
                if (A === B) continue;
                const newMatrix = colorConnectedComponent(matrix, component, A);
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

    return { type: 'failure', message: "在4步内无法将所有数字变成目标颜色。" };
}
