// File: src/lib/utils/shareUtils.test.ts
import { describe, it, expect } from "vitest";
import { encodePuzzle, decodePuzzle } from "./shareUtils";

describe("shareUtils - short encoding", () => {
    it("should encode and decode puzzle data with short numeric method", () => {
        const targetColor = 1;
        const maxSteps = 3;
        const grid = [
            [3,3,3,3,3,3,3,3,3,3],
            [3,3,2,2,2,2,2,2,3,3],
            [1,1,4,4,4,4,4,4,1,1],
            [3,3,4,2,2,2,2,4,3,3],
            [3,3,4,2,2,2,2,4,3,3],
            [1,1,4,4,4,4,4,4,1,1],
            [3,3,2,2,2,2,2,2,3,3],
            [3,3,3,3,3,3,3,3,3,3]
        ];
        const code = encodePuzzle(targetColor, maxSteps, grid);
        expect(typeof code).toBe("string");

        const decoded = decodePuzzle(code);
        expect(decoded.targetColor).toBe(targetColor);
        expect(decoded.maxSteps).toBe(maxSteps);
        expect(decoded.grid).toEqual(grid);
    });

    it("should throw if digits length is invalid after base64 decode", () => {
        // 直接给个错误的 base64
        expect(() => {
            decodePuzzle("abc123");
        }).toThrow();
    });
});
