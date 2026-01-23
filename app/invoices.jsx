import React, { useState, useEffect }from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useStore} from '../src/store';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const printInvoice = async (invoice) => {

    const { profile } = useStore.getState();

    const html = `
    <html>
    <head>
        <style>
        body { padding: 20px; font-family: 'Helvetica' ,sans-serif; color:#333 }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; }
          .business-info h1 { color: #1e3a8a; marginTop: 10px; text-transform: uppercase; }
          .business-info p { margin: 2px 0; color: #64748b; }
          .invoice-details { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px;}
        th { background-color: #f8fafc; padding: 12px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .total { text-align: right; margin-top: 30px; font-size: 20px; color: #10b981; }
        .client-section {
            margin: 20px 0;
            padding: 10px;
            background-color: #f8fafc; /* Light gray background to make it pop */
            border-radius: 5px;
        }
        .client-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .client-name {
            font-size: 22px; /* Increased font size */
            font-weight: bold;
            color: #1e3a8a; /* Deep blue to match the header */
        }
        .logo-container img {
            width: 100px;
            height: 100px;
            object-fit: contain;] /* Ensures the whole logo fits without cropping */
            display: block;
            margin-bottom: 10px;
        }
        </style>
    </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${profile.logoUri ? `<img src="${profile.logoUri}" style="width: 100px; height: 100px; object-fit: contain; border-radius: 12px" />` : ''}
                </div>
                <div class="business-info">
                    <h1>${profile.businessName || 'BIZ'}</h1>
                    <p>${profile.phone || 'Contact Info Not Set'}</p>
                </div>

                <div class="invoice-details">
                    <h2>OFFICIAL RECEIPT</h2>
                    <p><strong>Date:</strong> ${invoice.date}</p>
                    <p><strong>Invoice #:</strong> ${invoice.id.slice(-6)}</p>
                </div>
            </div>

            <div class="client-section">
                <div class="client-label">Bill To:</div>
                <div class="client-name">${invoice.clientName}</div>
            </div>
            
            <hr />
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right; padding: 8px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                        <td>${item.name} (x${item.quantity || 1})</td>
                        <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">
                            Ksh. ${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}
                        </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total">
                <strong>Total Amount: Ksh. ${invoice.total.toLocaleString()}</strong>
            </div>

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
                                <Text style={styles.amount}>Ksh. {(item.total || 0).toFixed(2)}</Text>
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