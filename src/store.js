import { create } from "zustand";

export const useStore = create((set) => ({
    invoices: [],
    clients:[],
    products:[],

    addInvoice: (newInvoice) => set((state) => ({
        invoices:[...state.invoices, { ...invoices, newInvoice}]
    })),

    addCLient: (newClient) => set((state) => ({
        clients: [...state.clients, newClient]
    })),

    addProduct: (newProduct) => set((state) => ({
        products: [...state.products, newProduct]
    }))
}));