import { writable } from 'svelte/store';

export interface HistoryRecord {
    grid: number[][];
    timestamp: number;
}

export class EditHistory {
    private records: HistoryRecord[] = [];
    private currentIndex = -1;
    private maxRecords = 30;

    constructor(private routeId: string) {
        this.loadFromStorage();
    }

    // 添加新记录
    addRecord(grid: number[][]) {
        // 如果当前不在最新记录,删除当前之后的所有记录
        if (this.currentIndex < this.records.length - 1) {
            this.records = this.records.slice(0, this.currentIndex + 1);
        }

        const record: HistoryRecord = {
            grid: JSON.parse(JSON.stringify(grid)), // 深拷贝
            timestamp: Date.now()
        };

        this.records.push(record);
        this.currentIndex++;

        // 限制记录数量
        if (this.records.length > this.maxRecords) {
            this.records.shift();
            this.currentIndex--;
        }

        this.saveToStorage();
    }

    // 撤销
    undo(): number[][] | null {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.saveToStorage();
            return JSON.parse(JSON.stringify(this.records[this.currentIndex].grid));
        }
        return null;
    }

    // 重做
    redo(): number[][] | null {
        if (this.currentIndex < this.records.length - 1) {
            this.currentIndex++;
            this.saveToStorage();
            return JSON.parse(JSON.stringify(this.records[this.currentIndex].grid));
        }
        return null;
    }

    // 获取当前状态
    getCurrentState(): number[][] | null {
        if (this.currentIndex >= 0) {
            return JSON.parse(JSON.stringify(this.records[this.currentIndex].grid));
        }
        return null;
    }

    // 从LocalStorage加载
    private loadFromStorage() {
        const key = `edit-history-${this.routeId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            const data = JSON.parse(stored);
            this.records = data.records;
            this.currentIndex = data.currentIndex;
        }
    }

    // 保存到LocalStorage
    private saveToStorage() {
        const key = `edit-history-${this.routeId}`;
        localStorage.setItem(key, JSON.stringify({
            records: this.records,
            currentIndex: this.currentIndex
        }));
    }
}

// 创建一个store来管理不同路由的历史记录
function createHistoryStore() {
    const { subscribe, set, update } = writable<Map<string, EditHistory>>(new Map());

    return {
        subscribe,
        getHistory: (routeId: string) => {
            let history: EditHistory;
            update(histories => {
                if (!histories.has(routeId)) {
                    history = new EditHistory(routeId);
                    histories.set(routeId, history);
                } else {
                    history = histories.get(routeId)!;
                }
                return histories;
            });
            return history!;
        }
    };
}

export const historyStore = createHistoryStore();
