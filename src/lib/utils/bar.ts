import {Circle, Dices, Inbox} from "lucide-svelte";

export const commonItems = [
    { title: "common.random", url: "/random", icon: Circle },
    { title: "common.puzzles", url: "/puzzles", icon: Inbox },
    { title: "common.edit", url: "/edit/puzzles/1", icon: Dices },
];

export const WUTHERING_WAVES = "Wuthering"  // 鸣潮
export const GANTROL = "Gantrol"
export const SourceMap = {
    Wuthering: WUTHERING_WAVES,
    GANTROL: GANTROL
}
