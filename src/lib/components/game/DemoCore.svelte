<!--/* File: src/lib/components/game/DemoCore.svelte */-->
<script lang="ts">
    import type { Move, PuzzleDataType, Step } from "$lib/types";
    import {
        cloneMatrix,
        getColors,
        getColorsForPicker,
    } from "$lib/utils/gridUtils";
    import {t} from "$lib/translations";
    import { GameSession } from '$lib/game/GameSession.svelte';
    import UnifiedGameControl from "$lib/components/game/UnifiedGameControl.svelte";

    interface Props {
        currentStep: number;
        puzzleData: PuzzleDataType;
        isAutoPlay?: boolean;
    }

    let { currentStep, puzzleData, isAutoPlay = true }: Props = $props();

    const gameSession = new GameSession(puzzleData);
    let selectedColor = $state(1);
    let solvingSteps: Step[] = $state([]);

    export function executeNextStep() {
        if (!solvingSteps || currentStep >= solvingSteps.length)
            return;

        const step = solvingSteps[currentStep];
        const [row, col] = step.position;
        selectedColor = step.A;

        // We ignore the promise here as the interval controls the flow
        gameSession.makeMove(row, col, step.A);
    }

    export function resetDemo() {
        gameSession.reset();
        // No need to clear moveHistory as reset does it
    }

    $effect(() => {
        if (puzzleData) {
            gameSession.init(puzzleData);
            if (puzzleData.solutionSteps && puzzleData.solutionSteps.length > 0) {
                solvingSteps = puzzleData.solutionSteps;
            } else {
                solvingSteps = [];
            }
            selectedColor = 1;
        }
    });

</script>

<div
        class="flex flex-col md:flex-row gap-4 mt-5"
        class:pointer-events-none={isAutoPlay}
        role="none"
>
    <UnifiedGameControl
        {gameSession}
        bind:selectedColor
        onColorSelect={(c) => selectedColor = c}
    />
</div>
