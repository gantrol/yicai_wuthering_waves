import { bfs } from './solver';
import {describe, it, expect} from "vitest";

describe('solver', () => {
    describe('bfs', () => {
        it('should find a solution within the maximum steps', () => {
            const initialMatrix = [
                [1, 1, 2],
                [1, 2, 2],
                [2, 2, 3]
            ];
            const targetColor = 3;
            const maxSteps = 4;
            const result = bfs(initialMatrix, targetColor, maxSteps);
            expect(result.type).toBe('success');
            expect(result.steps).toBeDefined();
            expect(result.steps!.length).toBeLessThanOrEqual(maxSteps);
        });

        it('should return failure if no solution within the maximum steps', () => {
            const initialMatrix = [
                [1, 1, 2],
                [1, 2, 2],
                [2, 2, 3]
            ];
            const targetColor = 4; // 假设 4 不是任何颜色
            const maxSteps = 2;
            const result = bfs(initialMatrix, targetColor, maxSteps);
            expect(result.type).toBe('failure');
            expect(result.message).toBe("在4步内无法将所有数字变成目标颜色。");
        });
    });
});
