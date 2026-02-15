import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useStore } from "../src/store";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PURCHASE_STORAGE_KEY = 'purchase_list';
const EXPENSE_STORAGE_KEY = 'expense_list';

export default function Dashboard() {
    const router = useRouter();
    const isFocused = useIsFocused();
    const invoices = useStore((state) => state.invoices);
    const [products, setProducts] = useState([]);
    const [accountsPayable, setAccountsPayable] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalPurchPayments, setTotalPurchPayments] = useState(0);
    const [personnelReceivables, setPersonnelReceivables] = useState(0);

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
            // Calculate Debt
            const totalDebt = list.reduce((sum, purchase) => {
                const totalCost = purchase.totalAmount || purchase.amount || 0;
                const paidSoFar = (purchase.payments || []).reduce((pSum, p) => pSum + p.amount, 0);
                return sum + (totalCost - paidSoFar);
            }, 0);
            setAccountsPayable(totalDebt);
            // Calculate Cost of Goods
            setTotalPurchPayments  (list.reduce((sum, purchase) => {
                return sum + (purchase.payments || []).reduce((pSum, p) => pSum + p.amount, 0);   
            }, 0));
        }
        // 3. Operating Costs
        const expenseData = await AsyncStorage.getItem(EXPENSE_STORAGE_KEY);
        if (expenseData) {
            const eList = JSON.parse(expenseData);

            const businessCosts = eList
            .filter(e => e.group === 'Expenses')
            .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

            const pRec = eList
                .filter(e => e.group === 'Payable' && e.status !== 'Cleared')
                .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

                setTotalExpenses(businessCosts);
                setPersonnelReceivables(pRec);
            }

    };

    // 1. Revenue Calculation
    const totalSales = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const pendingAmount = invoices
        .filter(inv => inv.status === 'Pending')
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidAmount = totalSales - pendingAmount;

    const netProfit = paidAmount -(totalPurchPayments + totalExpenses);

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
                    <Text style={styles.cardLabel}>Net Profit</Text>
                    <Text style={[styles.revenueValue, {color: netProfit >= 0 ? '#10b981' : '#ef4444'}]}>Ksh. {netProfit.toLocaleString()}</Text>
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
                    <View style={[styles.divider, {marginVertical: 10, backgroundColor: '#f8fafc'}]}/>

                    <View style={styles.statsRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.subLabel}>Stock Costs</Text>
                            <Text style={[styles.pendingText, { color: '#475569' }]}>
                                - {totalPurchPayments.toLocaleString()}
                            </Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.subLabel}>Expenses</Text>
                            <Text style={[styles.pendingText, { color: '#475569' }]}>
                                - {totalExpenses.toLocaleString()}
                            </Text>
                        </View> 
                    </View>
                </View>
            </View>
            {/* Low Stock Alerts */}
            <Text style={styles.sectionTitle}>Action Required</Text>
            {lowStockItems.length > 0 ? (
                lowStockItems.map(item => {
                    const totalSold = invoices.reduce((sum, invoice) => {
                        const matchingItems = invoice.items?.filter(i => i.name === item.name) || [];
                        const itemSum = matchingItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
                        return sum + itemSum;
                    }, 0);
                    const remaining = (Number(item.initialStock) || 0) - totalSold;
               
                    return (
                        <View key={item.id} style={styles.alertCard}>
                            <View style={{ flex: 1}}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="warning" size={20} color="#ef4444"/>
                                    <Text style={styles.alertText}>{item.name} is running low!</Text>
                                </View>
                                {/* -- added quantity counter --*/}
                                <Text style={{ marginLeft: 30, fontSize: 12, color: '#ef4444', fontWeight: '500'}}>
                                    Only {remaining} left in stock
                                </Text>
                            </View>

                            {/* --- NEW RESTOCK BUTTON --- */}
                            <TouchableOpacity 
                                style={styles.restockButton}
                                onPress={() => {
                                    router.push({
                                        pathname: "/purchase",
                                        params: { prefillName: item.name }
                                    });
                                }}
                            >
                                <Text style={styles.restockText}>Restock</Text>
                                <Ionicons name="chevron-forward" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    ); 
                })
            ): (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Stock levels are healthy</Text>
                </View>
            )}

            {/* Account Receivables */}
            <View style={styles.receivableCard}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={styles.cardLabel}>Account Receivables</Text>
                    <Ionicons name="trending-up" size={20} color="#1e3a8a"/>
                </View>

                <Text style={styles.pendingValue}>Ksh {(pendingAmount + personnelReceivables).toLocaleString()}</Text>

                <View style={styles.divider}/>
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.subLabel}>From Customers</Text>
                        <Text style={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                            Ksh {pendingAmount.toLocaleString()}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.subLabel}>From Payable Expenses</Text>
                        <Text style={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                            Ksh {personnelReceivables.toLocaleString()}
                        </Text>
                    </View>


                </View>
                
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
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },
    restockButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    },
    restockText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 4
    },
    stockCounter: {
    marginLeft: 30, // Aligns it under the text, past the icon
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    marginTop: 2    
    },
});