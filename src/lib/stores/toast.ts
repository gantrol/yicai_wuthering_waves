// src/lib/stores/toast.ts
import { writable } from "svelte/store";

// Toast 类型，可自行扩展
export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration?: number; // 毫秒，默认 5s
}

function createToastStore() {
    const _store = writable<ToastItem[]>([]);

    function addToast(toast: Omit<ToastItem, "id">) {
        const id = crypto.randomUUID();
        const newToast = { ...toast, id };

        _store.update((list) => [...list, newToast]);

        // 如果指定了自动关闭时长，就自动删除
        if (typeof newToast.duration === "number") {
            setTimeout(() => {
                removeToast(id);
            }, newToast.duration);
        }
        return id;
    }

    function removeToast(id: string) {
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
export function toast(message: string, type: ToastType = "info", duration = 5000) {
    toastStore.addToast({ type, message, duration });
}
