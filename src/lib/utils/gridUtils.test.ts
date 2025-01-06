import { cloneMatrix, isGoalState, floodFill } from './gridUtils';
import {describe, it, expect} from "vitest";

describe('gridUtils', () => {
    describe('cloneMatrix', () => {
        it('should create a deep copy of the matrix', () => {
            const original = [[1, 2], [3, 4]];
            const copy = cloneMatrix(original);
            expect(copy).toEqual(original);
            expect(copy).not.toBe(original);
        });
    });

    describe('isGoalState', () => {
        it('should return true if all cells match the target color', () => {
            const grid = [
                [1, 1],
                [1, 1]
            ];
            expect(isGoalState(grid, 1)).toBe(true);
        });

        it('should return false if any cell does not match the target color', () => {
            const grid = [
                [1, 2],
                [1, 1]
            ];
            expect(isGoalState(grid, 1)).toBe(false);
        });
    });

    describe('floodFill', () => {
        it('should fill connected cells with the new color', () => {
            const grid = [
                [1, 1, 2],
                [1, 2, 2],
                [2, 2, 3]
            ];
            const result = floodFill(grid, 4, 0, 0);
            const expected = [
                [4, 4, 2],
                [4, 2, 2],
                [2, 2, 3]
            ];
            expect(result).toEqual(expected);
        });

        it('should not change the grid if the new color is the same as the old color', () => {
            const grid = [
                [1, 1],
                [1, 1]
            ];
            const result = floodFill(grid, 1, 0, 0);
            expect(result).toEqual(grid); // Should return a same matrix
            expect(result).not.toBe(grid); // But not the same reference
        });
    });
});
