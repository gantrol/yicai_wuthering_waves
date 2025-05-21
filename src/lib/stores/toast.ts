// src/lib/stores/toast.ts
import { writable } from "svelte/store";

// Toast 类型，可自行扩展
export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration?: number; // 毫秒
    timeoutId?: number; // Store the timeout ID for potential clearing
}

function createToastStore() {
    const _store = writable<ToastItem[]>([]);
    const toastsMap = new Map<string, ToastItem>(); // For quick lookup to clear timeout

    function addToast(toast: Omit<ToastItem, "id" | "timeoutId">) {
        const id = crypto.randomUUID();
        // Create a mutable toast object to store timeoutId later
        const newToast: ToastItem = { ...toast, id };

        if (typeof newToast.duration === "number") {
            const timeoutId = setTimeout(() => {
                removeToast(id);
            }, newToast.duration);
            newToast.timeoutId = timeoutId; // Store the timeout ID
        }
        
        toastsMap.set(id, newToast);
        _store.update((list) => [...list, newToast]);
        return id;
    }

    function removeToast(id: string) {
        const toastToRemove = toastsMap.get(id);
        if (toastToRemove && typeof toastToRemove.timeoutId === 'number') {
            clearTimeout(toastToRemove.timeoutId);
        }
        toastsMap.delete(id);
        _store.update((list) => list.filter((item) => item.id !== id));
    }

    return {
        subscribe: _store.subscribe,
        addToast,
        removeToast,
    };
}

// 导出实例
export const toastStore = createToastStore();

/**
 * 为了更简洁，你也可以定义一些快捷方法，比如:
 * toast("hello") => 默认 info 类型，5s 后消失
 */
export function toast(message: string, type: ToastType = "info", durationArg?: number) {
    // Check if durationArg was explicitly passed (even if undefined) vs. omitted
    // arguments.length refers to the actual number of arguments passed to the function.
    const duration = arguments.length >= 3 ? durationArg : 5000;
    toastStore.addToast({ type, message, duration });
}
