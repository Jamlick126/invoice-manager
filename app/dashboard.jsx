import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useStore } from "../src/store";
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PURCHASE_STORAGE_KEY = 'purchase_list';

export default function Dashboard() {
    const isFocused = useIsFocused();
    const invoices = useStore((state) => state.invoices);
    const [products, setProducts] = useState([]);
    const [accountsPayable, setAccountsPayable] = useState(0);

    useEffect(() => {
        if (isFocused) {
            loadDashboardData();
        }
    }, [isFocused, invoices]);

    const loadDashboardData = async () => {
        const prodData = await AsyncStorage.getItem('product_list');
        if (prodData) setProducts(JSON.parse(prodData));

        const purchaseData = await AsyncStorage.getItem(PURCHASE_STORAGE_KEY);
        if (purchaseData) {
            const list = JSON.parse(purchaseData);
            const totalDebt = list.reduce((sum, purchase) => {
                const totalCost = purchase.totalAmount || purchase.amount || 0;
                const paidSoFar = (purchase.payments || []).reduce((pSum, p) => pSum + p.amount, 0);
                return sum + (totalCost - paidSoFar);
            }, 0);
            setAccountsPayable(totalDebt);
        }
    };

    // 1. Revenue Calculation
    const totalSales = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const pendingAmount = invoices
        .filter(inv => inv.status === 'Pending')
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidAmount = totalSales - pendingAmount;

    // 2. Low Stock Logic
    const lowStockItems = products.filter(product => {
        const totalSold = invoices.reduce((sum, invoice) => {
            const matchingItems = invoice.items?.filter(i => i.name === product.name) || [];
            const itemSum = matchingItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
            return sum + itemSum;
        }, 0 );

        const initial = Number(product.initialStock) || 0;

        if (isNaN(initial) || initial === 0) return false;

        const remaining = initial - totalSold;
        return remaining < 10; // ALert threshold
    });

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Business Overview</Text>

            {/* Cash Flow Summary */}
            <View style={styles.summaryRow}>
                <View style={[styles.mainCard, { flex: 2 }]}>
                    <Text style={styles.cardLabel}>Cash Flow</Text>
                    <Text style={styles.revenueValue}>Ksh. {totalSales.toLocaleString()}</Text>
                    <View style={styles.divider}/>
                    <View style={styles.statsRow}>
                        <View>
                            <Text style={styles.subLabel}>Received</Text>
                            <Text style={styles.paidText}>Ksh. {paidAmount.toLocaleString()}</Text>
                        </View>
                        <View>
                            <Text style={styles.subLabel}>Pending</Text>
                            <Text style={styles.pendingText}>Ksh. {pendingAmount.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>
            </View>
            {/* Low Stock Alerts */}
            <Text style={styles.sectionTitle}>Action Required</Text>
            {lowStockItems.length > 0 ? (
                lowStockItems.map(item => (
                    <View key={item.id} style={styles.alertCard}>
                        <Ionicons name="warning" size={20} color="#ef4444"/>
                        <Text style={styles.alertText}>{item.name} is running low!</Text>
                    </View>
                ))
            ): (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Stock levels are healthy</Text>
                </View>
            )}

            {/* Account Receivables */}
            <View style={styles.receivableCard}>
                <Text style={styles.cardLabel}>Account Receivables</Text>
                <Text style={styles.pendingValue}>Ksh {pendingAmount.toLocaleString()}</Text>
                <Text style={styles.subLabel}>Total outstanding from pending invoices</Text>
            </View>
            {/* Account Payables */}
            <View style={styles.receivableCard}>
                <Text style={styles.cardLabel}>Account Payables</Text>
                <Text style={styles.pendingValue}>Ksh {accountsPayable.toLocaleString()}</Text>
                <Text style={styles.subLabel}>Total outstanding from unpaid purchases</Text>
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 20 },
    mainCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 3 },
    cardLabel: { color: '#64748b', fontSize: 14, fontWeight: '600', marginBottom: 5 },
    revenueValue: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    subLabel: { fontSize: 12, color: '#94a3b8' },
    paidText: { color: '#10b981', fontWeight: 'bold', fontSize: 16 },
    pendingText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a', marginTop: 25, marginBottom: 10 },
    alertCard: { 
        backgroundColor: '#fef2f2', 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 15, 
        borderRadius: 12, 
        borderLeftWidth: 4, 
        borderLeftColor: '#ef4444',
        marginBottom: 10 
    },
    alertText: { marginLeft: 10, color: '#991b1b', fontWeight: '600' },
    receivableCard: { backgroundColor: '#eff6ff', padding: 20, borderRadius: 16, marginTop: 10, borderWidth: 1, borderColor: '#bfdbfe' },
    pendingValue: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a', marginVertical: 5 },
    emptyCard: { padding: 20, alignItems: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' }
});