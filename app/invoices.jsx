import React, { useState, useEffect }from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useStore} from '../src/store';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const printInvoice = async (invoice) => {
    const html = `
    <html>
    <head>
        <style>
        body { padding: 20px; font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f8fafc; padding: 10px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        </style>
    </head>
        <body style="font-family: Arial; padding: 20px;">
            <h1 style="color: #1e3a8a;">Invoice</h1>
            <p><strong>Client:</strong> ${invoice.clientName}</p>
            <p><strong>Date:</strong> ${invoice.date}</p>
            <hr />
            <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f1f5f9;">
                <th style="text-align: left; padding: 8px;">Item</th>
                <th style="text-align: right; padding: 8px;">Subtotal</th>
            </tr>
            ${invoice.items.map(item => `
                <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${item.name} (x${item.quantity || 1})
                </td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">
                    Ksh. ${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}
                </td>
                </tr>
            `).join('')}
            </table>
            <h3 style="text-align: right; color: #10b981;">Total: Ksh. ${invoice.total.toFixed(2)}</h3>

        </body>
    </html>`;

    try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf'});
    } catch (error) {
        console.error("PDF Error:", error);
        Alert.alert("Error", "Could not generate PDF.");
    }
};

export default function Invoices() {
    const router = useRouter();
    const invoices = useStore((state) => state.invoices);
    const [isReady, setIsReady] = useState(false);
    const deleteInvoice = useStore((state) => state.deleteInvoice);

    useEffect(() => {
        setIsReady(true);
    }, []);

    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>Loading History...</Text>
            </View>
        )
    }

    const handleDelete = (id) => {
        // Check if on web or mobile
        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete this invoice?")) {
                deleteInvoice(id);
            }
        } else {
            Alert.alert(
                "Delete Invoice",
                "Are you sure you want to remove this record?",
                [
                    {text: "Cancel", style: "cancel"},
                    {text: "Delete", style: "destructive", onPress: () => deleteInvoice(id)}
                ]
            );
        }
       
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Recent Invoices</Text>
           
                <FlatList 
                    data={invoices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.invoiceCard}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.clientName}>{item.clientName || "Walk-in Customer"}</Text>
                                <Text style={styles.dateText}>{item.date}</Text>
                                <Text style={styles.itemCount}>{item.items?.length || 0} Items</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <Text style={styles.amount}>Ksh. {item.total.toFixed(2)}</Text>
                                <View style={{ flexDirection: 'row', gap: 12}}>
                                    {/* PRINT BUTTON */}
                                    <TouchableOpacity 
                                        onPress={() => printInvoice(item)} 
                                        style={styles.printBtn}
                                    >
                                        <Ionicons name="print-outline" size={22} color="#3b82f6" />
                                    </TouchableOpacity>
                                     <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        style={styles.deleteBtn}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ef4444"/>
                                    </TouchableOpacity>

                                </View>
                               
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={80} color="#cbd5e1"/>
                            <Text style={styles.emptyText}>No invoices found</Text>
                        </View>}
                />
            {/* Floating Action Button*/}
            <TouchableOpacity style={styles.fab}
                onPress={() => router.push('/create-invoice')}>
                    <Ionicons name="add" size={30} color="#fff"/>
            </TouchableOpacity>
           
        </View>
    );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        margin: 20,
        color: '#2f4ea1'
    },
    clientName: {
        fontSize: 17,
        fontWeight: '700', 
        color: '#334155',
        marginBottom: 4
    }, 
    emptyContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 100
    },
    emptyText: { 
        color: '#94a3b8',
        fontSize: 16, 
        marginTop: 10 },
    fab: {
        position: 'absolute', bottom: 30, right: 30,
        backgroundColor: '#1e3a8a', width: 64, height: 64,
        borderRadius: 32, justifyContent: 'center', alignItems: 'center',
        elevation: 5,
        shadowColor: '#1e3a8a', shadowOpacity: 0.3, shadowRadius: 10
    },
    invoiceCard: {
        backgroundColor: '#ffffff', 
        padding: 16, 
        marginHorizontal: 20,
        marginBottom: 12, 
        borderRadius: 16, 
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    cardInfo: {
        flex: 1
    },
    dateText: { fontSize: 13, color: '#64748b', marginBottom: 2 },
    cardActions: { alignItems: 'flex-end' },
    itemCount: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

    amount: { 
        fontSize: 18,
        color: '#10b981', 
        fontWeight: '800',
        marginBottom: 8 
    },
    printBtn: {
        padding: 8,
        backgroundColor: '#eff6ff', // Light blue background
        borderRadius: 8,
    },
    deleteBtn: {
        padding: 8,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
    }
});