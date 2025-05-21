import { writable } from 'svelte/store';

export interface HistoryRecord {
    grid: number[][];
    timestamp: number;
}

export class EditHistory {
    private records: HistoryRecord[] = [];
    private currentIndex = -1;
    private maxRecords: number; // Made dynamic

    constructor(private routeId: string, maxRecords = 30, initialGrid?: number[][]) {
        this.maxRecords = maxRecords;
        this.loadFromStorage();

        if (this.records.length === 0 && initialGrid) {
            // If storage is empty and an initial grid is provided, add it.
            this.addRecordInternal(initialGrid, false); // Don't save to storage yet, constructor will handle it if needed
        }
    }
    
    // Internal addRecord to control saving, to avoid double save on init
    private addRecordInternal(grid: number[][], performSave: boolean) {
        if (this.currentIndex < this.records.length - 1) {
            this.records = this.records.slice(0, this.currentIndex + 1);
        }

        const record: HistoryRecord = {
            grid: JSON.parse(JSON.stringify(grid)), // Deep copy
            timestamp: Date.now()
        };

        this.records.push(record);
        this.currentIndex++;

        if (this.records.length > this.maxRecords) {
            this.records.shift(); // Remove the oldest record
            // Only decrement currentIndex if it was pointing to the removed record (i.e., it was 0 and shifted)
            // and it's now effectively -1 because the list was smaller than or equal to maxRecords.
            // More simply, if records were shifted, the effective index of all subsequent items decreases by 1.
            // So, if currentIndex was > 0, it should be decremented. If it was 0, it remains 0 unless list becomes empty.
            // The current this.currentIndex points to the new latest record.
            // The critical part is that `this.currentIndex` should already be correct due to `push` and `++`.
            // If `shift` occurs, it means `this.records.length` was `maxRecords + 1`.
            // `this.currentIndex` was `maxRecords`. After shift, `this.records.length` is `maxRecords`.
            // `this.currentIndex` should now be `maxRecords - 1`.
            // The previous `this.currentIndex--` was correct.
            // Let's re-evaluate:
            // Before push: records.length = N, currentIndex = N-1
            // Push: records.length = N+1, record added at N, currentIndex = N
            // If N+1 > maxRecords:
            //   shift(): records.length = N (becomes maxRecords)
            //   currentIndex was N (pointing to last element). After shift, it should point to maxRecords-1
            //   So, currentIndex = N-1 (or maxRecords-1)
            //   The original this.currentIndex-- was correct.
            this.currentIndex--; // Correctly adjusts current index after shift
        }
        
        if (performSave) {
            this.saveToStorage();
        }
    }

    // 添加新记录
    addRecord(grid: number[][]) {
        this.addRecordInternal(grid, true);
    }

    // 撤销
    undo(): number[][] | null {
        if (this.currentIndex >= 0) { // Can undo if pointing to a valid record
            const gridToReturn = JSON.parse(JSON.stringify(this.records[this.currentIndex].grid));
            this.currentIndex--; // Move pointer first
            this.saveToStorage();
            // If after undo, currentIndex is -1, it means we "undid" the first record.
            // The state returned is the one at the previous currentIndex.
            // If currentIndex was 0, it becomes -1. We return records[0].grid.
            // This seems slightly off. Let's rethink:
            // If currentIndex is 0 (first record), undo means go to "before first record" state.
            // So, currentIndex becomes -1. The returned grid is records[0].
            // If currentIndex is > 0, then it's fine.
            if (this.currentIndex + 1 >= 0 && this.currentIndex + 1 < this.records.length) {
                 // This returns the state we were at before undoing.
                return JSON.parse(JSON.stringify(this.records[this.currentIndex + 1].grid));
            }
            // This case needs to be robust. If current index is 0, we want to return current state and then move index to -1.
            // If currentIndex is already -1 (or becomes -1), we should return null.
            // The original logic: `if (this.currentIndex > 0)` meant you couldn't undo the first action to reach index 0.
            // Corrected logic for undo:
            if (this.records.length > 0 && this.currentIndex >= 0) {
                // If currentIndex is 0, we return current state (records[0]) and set currentIndex to -1
                // If currentIndex > 0, we set currentIndex to currentIndex-1 and return records[currentIndex] (new)
                if (this.currentIndex > 0) {
                    this.currentIndex--;
                    this.saveToStorage();
                    return JSON.parse(JSON.stringify(this.records[this.currentIndex].grid));
                } else if (this.currentIndex === 0) { // We are at the first record
                    this.currentIndex--; // Go to -1
                    this.saveToStorage();
                    return JSON.parse(JSON.stringify(this.records[0].grid)); // Return the first record's state
                }
            }
        }
        return null; // No records or already at the beginning
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
        if (this.currentIndex >= 0 && this.currentIndex < this.records.length) {
            return JSON.parse(JSON.stringify(this.records[this.currentIndex].grid));
        }
        return null;
    }

    // 从LocalStorage加载
    loadFromStorage() { // Made public for spy access in tests, can be reverted to private
        const key = `edit-history-${this.routeId}`;
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const data = JSON.parse(stored);
                // Basic validation
                if (data && Array.isArray(data.records) && typeof data.currentIndex === 'number') {
                    this.records = data.records;
                    this.currentIndex = data.currentIndex;
                } else {
                    this.records = [];
                    this.currentIndex = -1;
                }
            } else {
                this.records = [];
                this.currentIndex = -1;
            }
        } catch (error) {
            console.error("Failed to load history from localStorage:", error);
            this.records = [];
            this.currentIndex = -1;
        }
    }

    // 保存到LocalStorage
    saveToStorage() { // Made public for spy access in tests, can be reverted to private
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
        getHistory: (routeId: string, maxRecords?: number, initialGrid?: number[][]) => {
            let historyInstance: EditHistory;
            update(histories => {
                if (!histories.has(routeId)) {
                    // Pass maxRecords and initialGrid to constructor if provided
                    historyInstance = new EditHistory(routeId, maxRecords, initialGrid);
                    histories.set(routeId, historyInstance);
                } else {
                    historyInstance = histories.get(routeId)!;
                    // Potentially update maxRecords if needed, though this example doesn't
                }
                return histories;
            });
            return historyInstance!;
        }
    };
}

export const historyStore = createHistoryStore();
