import React from 'react';
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity} from "react-native";
import { useStore } from "../src/store";
import { Ionicons } from '@expo/vector-icons';

export default function Reports() {
    const invoices = useStore((state) => state.invoices);
    const today = new Date().toLocaleDateString();
    const router = useRouter();

    // filter payments for today
    const todayPayments = invoices.flatMap(inv => 
    (inv.payments || []).map(p =>({ ...p, customer: inv.clientName }))

    ).filter(p => p.date === today);

    //totals logic
    const cashToday = todayPayments
        .filter(p => p.method === 'Cash')
        .reduce((sum, p) => sum + p.amount, 0);

    const mpesaToday = todayPayments
        .filter(p => {
            if (!p.method) return false;

            const method = p.method.toLowerCase();
            return method.includes('mpesa') || method.includes('m-pesa');
        })
        .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPending = invoices.reduce((sum, inv) => {
        const paid = (inv.payments || []).reduce((pSum, p) => pSum + p.amount, 0);
        return sum + (inv.total - paid);
    }, 0);

    const pendingInvoices = invoices.filter(inv => {
        const paid = (inv.payments || []).reduce((pSum, p) => pSum + p.amount, 0);
        return (inv.total - paid) > 0;
    })

    const totalToday = cashToday + mpesaToday;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
            <Text style={styles.dateLabel}>Reports for Today</Text>
            <Text style={styles.dateText}>{today}</Text>
        </View>

        {/* Total Sales Card*/}
        <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.push('/payments')} 
            style={styles.mainCard}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.cardLabel}>Total Collections Today</Text>
                <Ionicons name="chevron-forward" size={14} color="#bfdbfe" style={{ marginLeft: 5 }} />
            </View>
            <Text style={styles.mainAmount}>Ksh. {totalToday.toLocaleString()}</Text>
            <Text style={{ color: '#bfdbfe', fontSize: 11, marginTop: 5 }}>Tap to view transaction history</Text>
           
        </TouchableOpacity>
        

        {/* Breakdown Section */}
        <View style={styles.row}>
            <View style={[styles.subCard, { borderLeftColor: '#10b981'}]}>
                <Ionicons name="cash-outline" size={24} color={"#10b981"}/>
                <Text style={styles.subLabel}>Cash Bankings</Text>
                <Text style={styles.subAmount}>Ksh. {cashToday.toLocaleString()}</Text>
            </View>

            <View style={[styles.subCard, { borderLeftColor: '#2f4ea1' }]}>
                <Ionicons name="phone-portrait-outline" size={24} color="#2f4ea1"/>
                <Text style={styles.subLabel}>M-Pesa Bankings</Text>
                <Text style={styles.subAmount}>Ksh. {mpesaToday.toLocaleString()}</Text>
            </View>
        </View>

        {/* Pending Money Card */}
        <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push('/pending')}
                style={[styles.mainCard, { backgroundColor: '#f59e0b', marginTop: 24 }]}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.cardLabel}>Total Outstanding (Unpaid)</Text>
                <Ionicons name="chevron-forward" size={16} color="#fee2e2" style={{ marginLeft: 5 }} />
            </View>
            <Text style={styles.mainAmount}>Ksh. {totalPending.toLocaleString()}</Text>
            <Text style={{ color: '#fff', fontSize: 11, marginTop: 5, opacity: 0.8 }}>Tap to view details</Text>
            
        </TouchableOpacity>

        </ScrollView>
        
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    dateLabel: { fontSize: 14, color: '#64748b' },
    dateText: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' },
    mainCard: { margin: 20, padding: 25, backgroundColor: '#1e3a8a', borderRadius: 15, alignItems: 'center' },
    cardLabel: { color: '#bfdbfe', fontSize: 14 },
    mainAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
    row: { flexDirection: 'row', paddingHorizontal: 15, justifyContent: 'space-between' },
    subCard: { backgroundColor: '#fff', width: '47%', padding: 15, borderRadius: 12, borderLeftWidth: 5, elevation: 2 },
    subLabel: { color: '#64748b', fontSize: 12, marginTop: 5 },
    subAmount: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
    debtorSection: {
    padding: 20,
    marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 15,
    },
    debtorCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444', // Red indicator for debt
        elevation: 2,
    },
    clientName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    dateText: {
        fontSize: 12,
        color: '#64748b',
    },
    balanceAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    dueText: {
        fontSize: 10,
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 20,
        fontStyle: 'italic',
    }
});