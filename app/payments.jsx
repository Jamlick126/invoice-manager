import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useStore } from "../src/store";
import { Ionicons } from '@expo/vector-icons';

export default function Payments() {
    const invoices = useStore((state) => state.invoices);
    const [filter, setFilter] = useState('All'); // All, Cash, M-Pesa

    // Filter for paid invoices and flatten the payments into a single list
    const allPayments = invoices.flatMap(inv => 
        (inv.payments || []).map(p => ({
            ...p,
            customer: inv.customer,
            invoiceId: inv.id,
            date: inv.date 
        }))
    );


    const filteredPayments = allPayments.filter(p => 
        filter === 'All' ? true : p.method === filter
    );

    const cashTotal = allPayments
        .filter(p => p.method === 'Cash')
        .reduce((sum, p) => sum + p.amount, 0);

    const mpesaTotal = allPayments
        .filter(p => p.method === 'M-Pesa')
        .reduce((sum, p) => sum + p.amount, 0);

   

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Payment Records</Text>

            {/* Category Summary Cards */}
            <View style={styles.summaryRow}>
                <View style={[styles.card, { borderLeftColor: '#10b981' }]}>
                    <Ionicons name="cash-outline" size={20} color="#10b981" />
                    <Text style={styles.cardLabel}>Cash</Text>
                    <Text style={styles.cardValue}>Ksh {cashTotal.toLocaleString()}</Text>
                </View>
                <View style={[styles.card, { borderLeftColor: '#7c3aed' }]}>
                    <Ionicons name="phone-portrait-outline" size={20} color="#7c3aed" />
                    <Text style={styles.cardLabel}>M-Pesa</Text>
                    <Text style={styles.cardValue}>Ksh {mpesaTotal.toLocaleString()}</Text>
                </View>
            </View>

            {/* Filter Toggles */}
            <View style={styles.filterContainer}>
                {['All', 'Cash', 'M-Pesa'].map((type) => (
                    <TouchableOpacity 
                        key={type} 
                        style={[styles.filterBtn, filter === type && styles.activeFilter]}
                        onPress={() => setFilter(type)}
                    >
                        <Text style={[styles.filterText, filter === type && styles.activeFilterText]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredPayments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.paymentItem}>
                        <View>
                            <Text style={styles.customerName}>{item.customer}</Text>
                            <Text style={styles.paymentSub}>{item.date} • {item.method}</Text>
                        </View>
                        <Text style={styles.paymentAmount}>+ Ksh {item.amount.toLocaleString()}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No payments recorded yet.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 20 },
    summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    card: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 12, borderLeftWidth: 5, elevation: 2 },
    cardLabel: { fontSize: 12, color: '#64748b', marginTop: 5 },
    cardValue: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    filterContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e2e8f0' },
    activeFilter: { backgroundColor: '#1e3a8a' },
    filterText: { color: '#64748b', fontWeight: '600' },
    activeFilterText: { color: 'white' },
    paymentItem: { 
        backgroundColor: 'white', 
        padding: 15, 
        borderRadius: 12, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8
    },
    customerName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    paymentSub: { fontSize: 12, color: '#64748b' },
    paymentAmount: { fontSize: 16, fontWeight: 'bold', color: '#10b981' },
    empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});