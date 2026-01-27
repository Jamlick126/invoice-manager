import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useStore = create(
    persist(
        (set) => ({
            invoices: [],
            clients:[],
            products:[],
            profile: {
                businessName: '',
                phone: '',
                logoUri: null,
            },

        addInvoice: (newInvoice) => set((state) => ({
            invoices:[...state.invoices, newInvoice]
        })),

        updateProfile: (newData) => set((state) => ({
            profile: { ...state.profile, ...newData}
        })),

        deleteInvoice: (id) => set((state) => ({
            invoices: state.invoices.filter((invoice) => invoice.id !== id)
        })),
        
        addCLient: (newClient) => set((state) => ({
            clients: [...state.clients, newClient]
        })),

        addProduct: (newProduct) => set((state) => ({
            products: [...state.products, newProduct]
        })),
        updateInvoiceStatus: (id, status) => set((state) => ({
            invoices: state.invoices.map((inv) => 
                inv.id === id ? { ...inv, status } : inv
            )
        })),
    }),
    {
        name: "invoice-storage",
        storage: createJSONStorage(() => AsyncStorage), 
    }
    )
);