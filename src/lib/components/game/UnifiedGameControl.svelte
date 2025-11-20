<script lang="ts">
    import { Card, CardContent } from '$lib/components/ui/card';
    import ColorPicker from "$lib/components/ColorPicker.svelte";
    import StepCounter from "$lib/components/game/StepCounter.svelte";
    import Grid from "$lib/components/Grid.svelte";
    import TargetColorButton from "$lib/components/TargetColorButton.svelte";
    import { getColorsForPicker } from '$lib/utils/gridUtils';
    import { t } from "$lib/translations";
    import type { GameSession } from '$lib/game/GameSession.svelte';

    interface Props {
        gameSession: GameSession;
        children?: any; // For the buttons slot
        selectedColor?: number;
        onColorSelect: (color: number) => void;
    }

    let { gameSession, children, selectedColor = $bindable(1), onColorSelect }: Props = $props();

    function handleMouseDown(row: number, col: number) {
        if (selectedColor !== undefined) {
            gameSession.makeMove(row, col, selectedColor);
        }
    }
</script>

<div class="flex flex-col md:flex-row gap-4 mt-5" role="none">
    <div class="flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        <Card>
            <CardContent>
                <StepCounter
                        maxSteps={gameSession.maxSteps}
                        moveHistory={gameSession.moveHistory}
                >
                    {@render children?.()}
                </StepCounter>

                <div class="flex flex-col justify-between sm:flex-row gap-4">
                    <ColorPicker
                            colors={getColorsForPicker()}
                            label={$t('common.select_color')}
                            select={onColorSelect}
                            {selectedColor}
                    />
                    <div class="flex items-center gap-4">
                        <span class="text-sm font-medium leading-none">{$t('common.target_color')}</span>
                        <TargetColorButton
                                index={gameSession.targetColor}
                        ></TargetColorButton>
                    </div>
                </div>

                <Grid
                        cols={gameSession.cols}
                        grid={gameSession.grid}
                        mousedown={(e) => handleMouseDown(e.row, e.col)}
                        rows={gameSession.rows}
                        readonly={gameSession.isAnimating}
                />
            </CardContent>
        </Card>
    </div>
</div>
