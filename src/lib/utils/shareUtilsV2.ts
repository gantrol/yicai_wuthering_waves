// src/lib/utils/shareUtilsV2.ts
import { LOCKED_CELL_VALUE } from './gridUtils';

const CHARSET_64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";

/**
 * V2 Encoding:
 *   targetColor(1~4) -> 2 bits (0-3)
 *   maxSteps(1~64) -> 6 bits (0-63)
 *   grid(8x10=80 cells)
 *      - Colors 1-4 -> 0-3 (3 bits each)
 *      - Locked (-1) -> 4 (3 bits each)
 *      Total Grid bits = 80 * 3 = 240 bits
 *   Total Bits = 2 + 6 + 240 = 248 bits
 *   Encoded Length = ceil(248 / 6) = 42 chars
 */

function mapGridValueToBits(value: number): number {
    if (value === LOCKED_CELL_VALUE) {
        return 4; // Map -1 to 4
    }
    if (value >= 1 && value <= 4) {
        return value - 1; // Map 1-4 to 0-3
    }
    throw new Error(`Invalid grid value for V2 encoding: ${value}`);
}

function mapBitsToGridValue(bits: number): number {
    if (bits === 4) {
        return LOCKED_CELL_VALUE; // Map 4 back to -1
    }
    if (bits >= 0 && bits <= 3) {
        return bits + 1; // Map 0-3 back to 1-4
    }
    throw new Error(`Invalid bits for V2 decoding: ${bits}`);
}


export function encodePuzzleV2(
    targetColor: number,    // 1~4
    maxSteps: number,       // 1~64
    grid: number[][]        // 8x10, values 1~4 or -1
): string {
    const bits: number[] = [];

    function pushBits(value: number, bitCount: number) {
        for (let i = bitCount - 1; i >= 0; i--) {
            const bit = (value >> i) & 1;
            bits.push(bit);
        }
    }

    // 1. Target Color (2 bits)
    pushBits(targetColor - 1, 2);

    // 2. Max Steps (6 bits)
    pushBits(maxSteps - 1, 6);

    // 3. Grid (80 * 3 = 240 bits)
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 10; c++) {
            const cellValue = grid[r]?.[c];
            if (cellValue === undefined) throw new Error(`Grid dimensions incorrect at ${r},${c}`);
            const bitValue = mapGridValueToBits(cellValue);
            pushBits(bitValue, 3);
        }
    }

    // Total bits should be 248
    if (bits.length !== 248) {
        console.error("V2 Encoding: Expected 248 bits, got", bits.length);
        throw new Error("Internal encoding error: Incorrect bit length.");
    }

    // 4. Encode bits to 42 Base64URL chars
    let result = "";
    let idx = 0;
    for (let i = 0; i < 42; i++) { // Exactly 42 characters
        let val = 0;
        for (let j = 0; j < 6; j++) {
            val = (val << 1);
            if (idx < bits.length) { // Read up to 248 bits
                val |= bits[idx];
            }
            // For the last char, remaining bits will be 0 (padding)
            idx++;
        }
        result += CHARSET_64[val];
    }

    return result;
}

/**
 * V2 Decoding:
 *  42 chars -> 252 bits (last 4 bits are padding)
 *  Read 248 bits:
 *    2 bits => targetColor (0-3)
 *    6 bits => maxSteps (0-63)
 *    240 bits => grid (80 cells * 3 bits)
 */
export function decodePuzzleV2(code: string): {
    targetColor: number;
    maxSteps: number;
    grid: number[][];
} {
    if (code.length !== 42) {
        throw new Error(`V2 encoding string must be 42 characters long, received ${code.length}`);
    }

    const bits: number[] = [];
    for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        const val = CHARSET_64.indexOf(ch);
        if (val < 0) {
            throw new Error("Invalid character in V2 encoding string: " + ch);
        }
        for (let b = 5; b >= 0; b--) {
            bits.push((val >> b) & 1);
        }
    }
    // bits.length = 252

    let readIndex = 0;
    function readBits(count: number): number {
        let out = 0;
        if (readIndex + count > 248) { // Only read the first 248 bits
            console.warn("Attempting to read beyond 248 bits in V2 decoding");
            count = 248 - readIndex; // Adjust count if near the end
        }
        for (let i = 0; i < count; i++) {
            out = (out << 1) | bits[readIndex];
            readIndex++;
        }
        return out;
    }

    // 1. Read Target Color (2 bits)
    const tcBits = readBits(2);
    const targetColor = tcBits + 1;

    // 2. Read Max Steps (6 bits)
    const msBits = readBits(6);
    const maxSteps = msBits + 1;

    // 3. Read Grid (240 bits)
    const grid: number[][] = [];
    for (let r = 0; r < 8; r++) {
        const row: number[] = [];
        for (let c = 0; c < 10; c++) {
            const cellBits = readBits(3);
            row.push(mapBitsToGridValue(cellBits));
        }
        grid.push(row);
    }

    if (readIndex !== 248) {
        console.error("V2 Decoding: Expected to read 248 bits, read", readIndex);
        throw new Error("Internal decoding error: Incorrect number of bits read.");
    }

    return { targetColor, maxSteps, grid };
}
