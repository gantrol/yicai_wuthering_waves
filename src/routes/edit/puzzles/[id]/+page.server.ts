import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
    const { id } = params;
    try {
        const response = await fetch(`/puzzles_json/${id}.json`);
        if (!response.ok) {
            throw new Error('无法加载题目数据');
        }
        const puzzleData = await response.json();
        return {
            puzzleId: id,
            puzzleData
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}
