// File: src/lib/utils/shareUtils.test.ts
import { describe, it, expect } from "vitest";
import { encodePuzzle, decodePuzzle } from "./shareUtils";

describe("shareUtils", () => {
    it("should encode and decode puzzle data correctly", () => {
        const targetColor = 1;
        const maxSteps = 3;
        const grid = [
            [3, 3, 3],
            [1, 2, 4],
        ];

        const code = encodePuzzle(targetColor, maxSteps, grid);
        expect(typeof code).toBe("string");

        const decoded = decodePuzzle(code);
        expect(decoded.targetColor).toBe(targetColor);
        expect(decoded.maxSteps).toBe(maxSteps);
        expect(decoded.grid).toEqual(grid);
    });

    it("should throw error for invalid code", () => {
        expect(() => {
            decodePuzzle("%%%"); // 随意的错误字符串
        }).toThrow("分享链接无效或解析失败");
    });
});
