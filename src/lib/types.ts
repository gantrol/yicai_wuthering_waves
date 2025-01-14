export interface BFSResult {
    type: 'success' | 'failure';
    steps?: Step[];
    message?: string;
}

export interface Move {
    position: [number, number];
    color: number;
    oldColor: number;
}

export interface Step {
    A: number;
    B?: number;
    position: [number, number];
}

export interface PuzzleDataType {
    grid: number[][];
    targetColor: number;
    maxSteps: number | string;
    solutionSteps?: Step[];
}

export enum GameMode {
    DEMO = 'demo',
    PLAY_SIMPLE = 'play_simple',
    PLAY_TRAVERSE = 'play_traverse',
    PLAY_RANDOM = 'play_random',
    EDIT = 'edit',
    CREATE = 'create',
    SOLUTION = 'solution',
}
