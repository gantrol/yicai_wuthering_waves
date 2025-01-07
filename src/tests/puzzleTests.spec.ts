import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { solvePuzzleWithFallback } from '$lib/utils/solver';

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

            // 调用 A* 求解
            const result = solvePuzzleWithFallback(grid, targetColor, stepsLimit);

            // 如果想要断言它一定成功，就检查
            expect(result.type).toBe('success');
            // 如果失败，则会抛错
            // 你也可以把 expect 改成逻辑判断 + console.log 来查看结果
        });
    });
});
