import { cloneMatrix, floodFillWave, isGoalState, LOCKED_CELL_VALUE } from "$lib/utils/gridUtils";
import { type Move, type PuzzleDataType } from "$lib/types";

export type GameStatus = 'playing' | 'won' | 'lost';

export class GameSession {
    grid = $state<number[][]>([]);
    originalGrid = $state<number[][]>([]);
    targetColor = $state<number>(1);
    maxSteps = $state<number>(0);
    moveHistory = $state<Move[]>([]);
    status = $state<GameStatus>('playing');
    isAnimating = $state(false);

    constructor(data?: PuzzleDataType) {
        if (data) {
            this.init(data);
        }
    }

    init(data: PuzzleDataType) {
        this.grid = cloneMatrix(data.grid);
        this.originalGrid = cloneMatrix(data.grid);
        this.targetColor = +data.targetColor;
        this.maxSteps = +data.maxSteps;
        this.moveHistory = [];
        this.status = 'playing';
        this.isAnimating = false;
    }

    reset() {
        this.grid = cloneMatrix(this.originalGrid);
        this.moveHistory = [];
        this.status = 'playing';
        this.isAnimating = false;
    }

    async makeMove(row: number, col: number, newColor: number): Promise<void> {
        // Allow move if playing or if it's an automated move (we control checking isAnimating externally if needed,
        // but here we block concurrent moves)
        if (this.isAnimating) return;
        if (this.moveHistory.length >= this.maxSteps) return;

        const oldColor = this.grid[row][col];
        if (oldColor === LOCKED_CELL_VALUE || oldColor === newColor) return;

        this.isAnimating = true;

        // Add to history
        this.moveHistory = [
            ...this.moveHistory,
            {
                position: [row, col],
                color: newColor,
                oldColor
            }
        ];

        const tempGrid = cloneMatrix(this.grid);
        const waveLayers = floodFillWave(tempGrid, row, col, oldColor);

        // Animation loop
        for (let i = 0; i < waveLayers.length; i++) {
            const layer = waveLayers[i];
            // Use linear delay (80ms per layer)
            await new Promise<void>(resolve => setTimeout(() => {
                const newGrid = cloneMatrix(this.grid);
                for (const [r, c] of layer) {
                    newGrid[r][c] = newColor;
                }
                this.grid = newGrid;
                resolve();
            }, 80));
        }

        this.checkWinCondition();
        this.isAnimating = false;
    }

    private checkWinCondition() {
        if (isGoalState(this.grid, this.targetColor)) {
            this.status = 'won';
        } else if (this.moveHistory.length >= this.maxSteps) {
            this.status = 'lost';
        }
    }

    get rows() {
        return this.grid.length;
    }

    get cols() {
        return this.grid[0]?.length || 0;
    }
}
