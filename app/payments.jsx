import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useStore } from "../src/store";
import { Ionicons } from '@expo/vector-icons';

export default function Payments() {
    const invoices = useStore((state) => state.invoices);
    const [filter, setFilter] = useState('All'); // All, Cash, M-Pesa
    const [timeframe, setTimeframe] = useState('This Month');

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter for paid invoices and flatten the payments into a single list
    const allPayments = invoices.flatMap(inv => 
        (inv.payments || []).map(p => ({
            ...p,
            customer: inv.clientName,
            invoiceId: inv.id,
            date: p.date 
        }))
    ).filter(p => {
        if (timeframe === 'All Time') return true;

        const pDate = new Date(p.date);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });


    const filteredPayments = allPayments.filter(p => 
        filter === 'All' ? true : p.method === filter
    );

    const cashTotal = allPayments
        .filter(p => p.method === 'Cash')
        .reduce((sum, p) => sum + p.amount, 0);

    const mpesaTotal = allPayments
        .filter(p => p.method === 'M-Pesa')
        .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPayments = cashTotal + mpesaTotal;

   

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Payment Records</Text>
                {/* Timeframe Toggle */}
                <TouchableOpacity 
                    style={styles.timeframeToggle} 
                    onPress={() => setTimeframe(timeframe === 'This Month' ? 'All Time' : 'This Month')}
                >
                    <Ionicons name="calendar-outline" size={16} color="#1e3a8a" />
                    <Text style={styles.timeframeText}>{timeframe}</Text>
                </TouchableOpacity>
            </View>

            {/* MAIN TOTAL CARD */}
            <View style={styles.mainTotalCard}>
                <Text style={styles.mainLabel}>Total Collections</Text>
                <Text style={styles.mainValue}>Ksh {totalPayments.toLocaleString()}</Text>
            </View>

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
    empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' },
    mainTotalCard: {
    backgroundColor: '#1e3a8a', // Deep blue
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    },
    mainLabel: {
        color: '#bfdbfe',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    mainValue: {
        color: 'white',
        fontSize: 32,
        fontWeight: '800',
        marginTop: 8,
    },
    headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
    },
    timeframeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dbeafe',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 5
    },
    timeframeText: {
        color: '#1e3a8a',
        fontWeight: '700',
        fontSize: 12
    },
});