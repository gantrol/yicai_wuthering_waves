// File: src/lib/utils/shareUtils.ts
export function encodePuzzle(
    targetColor: number,
    maxSteps: number,
    grid: number[][]
): string {
    const puzzleData = { targetColor, maxSteps, grid };
    const jsonStr = JSON.stringify(puzzleData);

    // 将 JSON 字符串转成 base64（不带 padding，有时为了安全性也可做 URL-safe 处理等）
    const base64Str = btoa(jsonStr);

    return base64Str;
}

export function decodePuzzle(code: string): {
    targetColor: number;
    maxSteps: number;
    grid: number[][];
} {
    try {
        const jsonStr = atob(code);
        const { targetColor, maxSteps, grid } = JSON.parse(jsonStr);
        return { targetColor, maxSteps, grid };
    } catch (error) {
        throw new Error("分享链接无效或解析失败");
    }
}
