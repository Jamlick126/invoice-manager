import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from "react-native";
import { useStore } from "../src/store";
import { Ionicons } from "@expo/vector-icons";

export default function PendingDetails() {
    const invoices = useStore((state) => state.invoices);

    // Filter for invoices with a remaining balance
    const pendingInvoices = invoices.filter(inv => {
        const paid = (inv.payments || []).reduce((sum, p) => sum + p.amount, 0);
        return (inv.total - paid) > 0;
    });

    const totalOwed = pendingInvoices.reduce((sum, inv) => {
        const paid = (inv.payments || []).reduce((s, p) => s + p.amount, 0);
        return sum + (inv.total - paid);
    }, 0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerLabel}>Total Outstanding Debt</Text>
                <Text style={styles.headerAmount}>Ksh. {totalOwed.toLocaleString()}</Text>
            </View>

            <FlatList
                data={pendingInvoices}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => {
                    const paid = (item.payments || []).reduce((s, p) => s + p.amount, 0);
                    const balance = item.total - paid;

                    return (
                        <View style={styles.debtorCard}>
                            <View style={styles.info}>
                                <Text style={styles.clientName}>{item.clientName || "Walk-in Customer"}</Text>
                                <Text style={styles.dateText}>Issued: {item.date}</Text>
                                <Text style={styles.totalText}>Original Total: Ksh. {item.total.toLocaleString()}</Text>
                            </View>
                            <View style={styles.actionColumn}>
                                <Text style={styles.balanceAmount}>Ksh. {balance.toLocaleString()}</Text>
                                <TouchableOpacity 
                                    style={styles.remindBtn}
                                    onPress={() => Linking.openURL(`whatsapp://send?text=Hello ${item.clientName}, just a friendly reminder of your outstanding balance of Ksh. ${balance.toLocaleString()} at our shop. Thank you!`)}
                                >
                                    <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                                    <Text style={styles.btnText}>Remind</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={<Text style={styles.empty}>No pending invoices found! 🎉</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 30, backgroundColor: '#f59e0b', alignItems: 'center' },
    headerLabel: { color: '#fee2e2', fontSize: 14 },
    headerAmount: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
    debtorCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
    info: { flex: 1 },
    clientName: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
    dateText: { fontSize: 12, color: '#64748b', marginVertical: 2 },
    totalText: { fontSize: 11, color: '#94a3b8' },
    actionColumn: { alignItems: 'flex-end', justifyContent: 'center' },
    balanceAmount: { fontSize: 17, fontWeight: 'bold', color: '#ef4444', marginBottom: 8 },
    remindBtn: { flexDirection: 'row', backgroundColor: '#25D366', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
    empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});