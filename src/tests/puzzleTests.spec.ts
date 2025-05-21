import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { aStarSolve } from '$lib/utils/solver';
import { cloneMatrix, floodFill, LOCKED_CELL_VALUE } from '$lib/utils/gridUtils';

// 递归或手动拼接 static/puzzles_json 路径
// 注意 __dirname 在 ESM 环境下可能不可用，可改用 import.meta.url 处理
// 这里假设是简单的 CommonJS/Vitest 默认设置
const puzzlesDir = path.resolve(__dirname, '../../static/puzzles_json');

describe('Test all puzzles in static/puzzles_json (exclude list.json)', () => {
    // 读取目录下所有文件
    const files = fs.readdirSync(puzzlesDir);

    // 过滤出 .json 并且排除 list.json
    const puzzleFiles = files.filter((f) => f.endsWith('.json') && f !== 'list.json');

    puzzleFiles.forEach((fileName) => {
        it(`should solve puzzle file: ${fileName}`, () => {
            // 读取并解析
            const filePath = path.join(puzzlesDir, fileName);
            const content = fs.readFileSync(filePath, 'utf8');
            const puzzle = JSON.parse(content);

            const { grid, targetColor, maxSteps } = puzzle;

            // 这里 maxSteps 可能是数字或字符串
            // 如果 puzzle 中没有 maxSteps，则给个默认值 5~10 都行
            const stepsLimit = parseInt(maxSteps, 10) || 10;

            // Prepare a mutable grid for the solver, potentially modifying locked cells
            let solverGrid = cloneMatrix(grid);
            const lockedCellOriginalValues = new Map<string, number>();

            if (puzzle.locked && Array.isArray(puzzle.locked)) {
                puzzle.locked.forEach((coord: [number, number]) => {
                    if (coord && coord.length === 2) {
                        const r = coord[0];
                        const c = coord[1];
                        if (r >= 0 && r < solverGrid.length && c >= 0 && c < solverGrid[0].length) {
                            lockedCellOriginalValues.set(`${r},${c}`, solverGrid[r][c]); // Store original value
                            solverGrid[r][c] = LOCKED_CELL_VALUE; // Use global LOCKED_CELL_VALUE for solver
                        }
                    }
                });
            }
            
            // 调用 A* 求解 using the potentially modified solverGrid
            const result = aStarSolve(solverGrid, targetColor, stepsLimit);

            expect(result.type).toBe('success', `Solver failed for ${fileName}: ${result.type === 'failure' ? result.message : 'unknown reason'}`);

            if (result.type === 'success') {
                const { steps } = result;
                // Apply steps to a fresh clone of the original grid, or the solverGrid if that's intended.
                // For validation against original locked values, use a fresh clone of the original grid.
                // However, steps were generated based on solverGrid (with -1 for locks).
                // So, apply steps to solverGrid, then validate against targetColor and -1.
                let currentGrid = cloneMatrix(solverGrid); 

                for (const step of steps) {
                    currentGrid = floodFill(currentGrid, step.A, step.position[0], step.position[1]);
                }

                // Verify final grid state
                for (let r = 0; r < currentGrid.length; r++) {
                    for (let c = 0; c < currentGrid[r].length; c++) {
                        const cellValue = currentGrid[r][c];
                        const cellKey = `${r},${c}`;
                        
                        if (lockedCellOriginalValues.has(cellKey)) {
                            // This cell was defined as locked by puzzle.locked.
                            // In currentGrid (based on solverGrid), it should be LOCKED_CELL_VALUE (-1).
                            expect(cellValue).toBe(LOCKED_CELL_VALUE,
                                `[${fileName}] Cell at locked coordinate [${r},${c}] is ${cellValue}, expected global LOCKED_CELL_VALUE (-1)`
                            );
                        } else {
                            // This cell is not in puzzle.locked, so it should be targetColor.
                            expect(cellValue).toBe(targetColor,
                                `[${fileName}] Non-locked cell at [${r},${c}] is ${cellValue}, expected targetColor ${targetColor}`
                            );
                        }
                    }
                }
            }
        });
    });
});
