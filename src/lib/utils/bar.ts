import {Circle, Dices, Inbox} from "lucide-svelte";

export const commonItems = [
    { title: "随机", url: "/random", icon: Circle }, // TODO: 随机加载，并可以点击“下一题”
    { title: "题库", url: "/puzzles", icon: Inbox },
    { title: "编题", url: "/edit/puzzles/1", icon: Dices },
];

export const WUTHERING_WAVES = "鸣潮"
export const GANTROL = "Gantrol"
export const Wuthering = "Wuthering"
export const SourceMap = {
    Wuthering: WUTHERING_WAVES,
    GANTROL: GANTROL
}
