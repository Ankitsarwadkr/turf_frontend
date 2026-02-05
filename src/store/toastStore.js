import { create } from "zustand";
export const useToastStore = create((set) => ({
    toasts: [],
    push: (type, message) => set(s => ({
        toasts: [...s.toasts, { id: crypto.randomUUID(), type, message }]
    })),
    remove: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
}));
