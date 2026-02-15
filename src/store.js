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
        updateInvoiceStatus: (id, status, paymentDetails = null) =>{
           set((state) => ({
            invoices: state.invoices.map((inv) => {
            if (inv.id === id) {
                const newPayments = paymentDetails ? [...(inv.payments || []), paymentDetails] : (inv.payments || []);
                const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
                
                // Determine status based on math
                let finalStatus = 'Pending';
                if (totalPaid >= inv.total) {
                    finalStatus = 'Paid';
                } else if (totalPaid > 0) {
                    finalStatus = 'Partial';
                }

                return {
                ...inv,
                payments: newPayments,
                status: finalStatus
                };
            }
            return inv;
            }),
        }));
    },
    }),
    {
        name: "invoice-storage",
        storage: createJSONStorage(() => AsyncStorage), 
    }
    )
);