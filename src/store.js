import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useStore = create(
    persist(
        (set) => ({
            invoices: [],
            clients:[],
            products:[],

        addInvoice: (newInvoice) => set((state) => ({
            invoices:[...state.invoices, newInvoice]
        })),

        deleteInvoice: (id) => set((state) => ({
            invoices: state.invoices.filter((invoice) => invoice.id !== id)
        })),
        
        addCLient: (newClient) => set((state) => ({
            clients: [...state.clients, newClient]
        })),

        addProduct: (newProduct) => set((state) => ({
            products: [...state.products, newProduct]
        }))
    }),
    {
        name: "invoice-storage",
        storage: createJSONStorage(() => AsyncStorage), 
    }
    )
);