// 自定义 64 字符表：0..9(10) + a..z(26) + A..Z(26) + - _ (2) = 64
const CHARSET_64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
/**
 * 编码:
 *  targetColor(1~4) -> 2 bits
 *  grid(8x10=80cells, each 1~4) -> 80*2=160 bits
 *  maxSteps(1~4) -> 2 bits
 *  => 共 164 bits => 28 个 6-bit 分组(最后几位补0)
 */
export function encodePuzzle(
    targetColor: number,
    maxSteps: number,
    grid: number[][]
): string {
    // 1) 构建一个 bit-array（boolean[] 或 number[]），容量至少 164 位
    const bits: number[] = [];

    // 小工具函数：往 bits 数组后面塞 n 位
    function pushBits(value: number, bitCount: number) {
        // 从高位到低位依次写入
        for (let i = bitCount - 1; i >= 0; i--) {
            // 取第 i 位(0 or 1)
            const bit = (value >> i) & 1;
            bits.push(bit);
        }
    }

    // 2) targetColor (1~4) => (0~3)
    pushBits(targetColor - 1, 2);

    // 3) grid 8 行 10 列，每格 (1~4)->(0~3)
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 10; c++) {
            pushBits(grid[r][c] - 1, 2);
        }
    }

    // 4) maxSteps (1~4)->(0~3)
    pushBits(maxSteps - 1, 2);

    // bits.length 应该是 164
    // 5) 每 6 bits 一个字符 => 28 个字符
    //    多余的 bits 不足 6 位时补 0
    const totalGroups = Math.ceil(bits.length / 6); //= 28
    let result = "";
    let idx = 0;
    for (let g = 0; g < totalGroups; g++) {
        let val = 0;
        for (let i = 0; i < 6; i++) {
            val = (val << 1);
            if (idx < bits.length) {
                val |= bits[idx];
            }
            idx++;
        }
        // val ∈ [0..63]
        result += CHARSET_64[val];
    }

    return result; // 28 chars
}

/**
 * 解码:
 *  28字符 -> 28*6=168 bits，最后的 4 bits 可能是 padding
 *  依次读取:
 *   2 bits => targetColor(0~3)
 *   160 bits => grid(80 cells * 2 bits)
 *   2 bits => maxSteps(0~3)
 */
export function decodePuzzle(code: string): {
    targetColor: number;
    maxSteps: number;
    grid: number[][];
} {
    if (code.length !== 28) {
        throw new Error(`编码串长度必须是 28，实际是 ${code.length}`);
    }

    // 1) 把 28 个字符 => 168 bits
    const bits: number[] = [];
    for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        const val = CHARSET_64.indexOf(ch);
        if (val < 0) {
            throw new Error("编码串中含无效字符: " + ch);
        }
        // 把 val(0..63) 转成 6 bits
        for (let b = 5; b >= 0; b--) {
            const bit = (val >> b) & 1;
            bits.push(bit);
        }
    }
    // bits.length = 168 (最后 4 位是补的 0 或真实信息)

    // 2) 先取 2 bits => targetColor(0~3)
    let readIndex = 0;
    function readBits(count: number) {
        let out = 0;
        for (let i = 0; i < count; i++) {
            out = (out << 1) | bits[readIndex];
            readIndex++;
        }
        return out;
    }

    const tc = readBits(2); // 0~3
    // 3) 读 80 * 2 = 160 bits => grid
    const g: number[][] = [];
    for (let r = 0; r < 8; r++) {
        const row: number[] = [];
        for (let c = 0; c < 10; c++) {
            const cellVal = readBits(2); // 0~3
            row.push(cellVal + 1);
        }
        g.push(row);
    }
    // 4) 读 2 bits => maxSteps(0~3)
    const ms = readBits(2);

    return {
        targetColor: tc + 1,
        maxSteps: ms + 1,
        grid: g,
    };
}
