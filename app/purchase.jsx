
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PURCHASE_STORAGE_KEY = 'purchase_list';

export default function Purchase() {
    const [modalVisible, setModalVisible] = useState(false);
    // state for payment modal
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [purchases, setPurchases] = useState([]);
    // purchase history expanded
    const [expandedId, setExpandedId] = useState(null);
    // purchase states
    const [supplier, setSupplier] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    // add payment states
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [paymentInput, setPaymentInput] = useState('');

    useEffect(() => { loadPurchases(); }, []);

    const loadPurchases = async () => {
        const saved = await AsyncStorage.getItem(PURCHASE_STORAGE_KEY);
        if (saved) setPurchases(JSON.parse(saved));
    };

    // helper to calculate total paid for a specific purchase
    const calculatePaid = (purchase) => {
        return (purchase.payments || []).reduce((sum, p) => sum + p.amount, 0);
    };

    const addPurchase = async () => {
        if (supplier && amount) {
            const newPurchase = {
                id: Date.now().toString(),
                supplier,
                totalAmount: parseInt(amount),
                payments: [],
                description,
                status: 'Unpaid', // Default for Accounts Payable
                date: new Date().toLocaleDateString(),
            };
            const newList = [newPurchase, ...purchases];
            setPurchases(newList);
            await AsyncStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(newList));
            setModalVisible(false);
            setSupplier(''); setAmount(''); setDescription('');
        }
    };
// new function to add an installment payment
    const recordPayment = async () => {
        const pAmount = parseInt(paymentInput);
        if (isNaN(pAmount) || pAmount <= 0 || !selectedPurchase) return;

        const displayTotal = selectedPurchase.totalAmount || selectedPurchase.amount || 0;
        const remaining = displayTotal - calculatePaid(selectedPurchase);

        if (pAmount > remaining) {
            Alert.alert('Error', 'Payment exceeds remaining balance.');
            return;
        }

        const newList = purchases.map(p => {
            if (p.id === selectedPurchase.id) {
                const newPayments = [...(p.payments || []), {
                    id: Date.now().toString(),
                    amount: pAmount,
                    date: new Date().toLocaleDateString(),
                }];
                return { ...p, payments: newPayments };
            }
            return p;
        });

        setPurchases(newList);
        await AsyncStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(newList));
        setPaymentModalVisible(false);
        setPaymentInput('');

    }
   
    // delete function with confirmation
    const deletePurchase = (id) => {
        Alert.alert(
            "Delete Purchase",
            "Are you sure you want to remove this record? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: 'Delete',
                    style: "destructive",
                    onPress: async () => {
                        const newList = purchases.filter(p => p.id !== id);
                        setPurchases(newList);
                        await AsyncStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(newList));
                        // Reset expanded state if we deleted the open card
                        if (expandedId === id) setExpandedId(null);
                    }
                } 
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Supplier Purchases</Text>
            <FlatList
                data={purchases}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const displayTotal = item.totalAmount || item.amount || 0;
                    const totalPaid = calculatePaid(item);
                    const balance = displayTotal - totalPaid; // dynamic balance calculation
                    const isExpanded = expandedId === item.id;

                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeaderContainer}>
                                <TouchableOpacity
                                    style={styles.cardHeader}
                                    onPress={() => setExpandedId(isExpanded ? null : item.id)}>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.supplierName}>{item.supplier}</Text>
                                    <Text style={styles.date}>{item.date} - {item.description}</Text>
                                    {/* Balanced-based status label */}
                                    <View 
                                        style={[styles.statusBadge, { backgroundColor: balance === 0 ? '#dcfce7' : '#fee2e2' }]}
                                        onPress={() => toggleStatus(item.id)}>
                                        <Text style={{ color: balance === 0 ? '#166534' : '#991b1b', fontSize: 12, fontWeight: 'bold' }}>
                                            {balance === 0 ? 'Fully Paid' : `Ksh ${balance.toLocaleString()} Due`}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.amountText}>Total: Ksh {displayTotal.toLocaleString()}</Text>
                                    {/* Button to open payment modal if balance exists */}
                                   <Ionicons 
                                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                                            size={20} 
                                            color="#64748b" 
                                            style={{ marginTop: 5 }}
                                    />
                                </View>
                                </TouchableOpacity>

                                {/* New: Delete Icon outside the main touch area */}
                                <TouchableOpacity 
                                    style={styles.deleteIconButton} 
                                    onPress={() => deletePurchase(item.id)}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            {/* History View: List of installments */}
                                {isExpanded && (
                                    <View style={styles.historySection}>
                                        <Text style={styles.historyTitle}>Payment History:</Text>
                                        {(item.payments && item.payments.length > 0) ? (
                                            item.payments.map((p) => (
                                                <View key={p.id} style={styles.historyRow}>
                                                    <Text style={styles.historyDate}>{p.date}</Text>
                                                    <Text style={styles.historyAmount}>+ Ksh {p.amount.toLocaleString()}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.noHistory}>No payments recorded yet.</Text>
                                        )}

                                        {balance > 0 && (
                                            <TouchableOpacity
                                                style={styles.payBtn}
                                                onPress={() => { setSelectedPurchase(item); setPaymentModalVisible(true); }}>
                                                    <Text style={styles.payBtnText}>Pay Installment</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                        </View>
                )}}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="cart-outline" size={24} color="white" />
                <Text style={styles.addButtonText}>Log New Purchase</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Add Purchase</Text>
                        <TextInput style={styles.input} placeholder="Supplier Name" value={supplier} onChangeText={setSupplier} />
                        <TextInput style={styles.input} placeholder="Amount (Ksh)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                        <TextInput style={styles.input} placeholder="Description (e.g. 10 Barrels)" value={description} onChangeText={setDescription} />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={addPurchase}>
                                <Text style={{color:'white'}}>Save Purchase</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* New Modal: Record Payment */}
            <Modal visible={paymentModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Record Payment</Text>
                        <Text style={styles.label}>Supplier: {selectedPurchase?.supplier}</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Amount to pay" 
                            value={paymentInput} 
                            onChangeText={setPaymentInput} 
                            keyboardType="numeric" 
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setPaymentModalVisible(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={recordPayment}>
                                <Text style={{color:'white'}}>Add Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1e3a8a' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2, overflow: 'hidden' },
    supplierName: { fontSize: 17, fontWeight: 'bold' },
    date: { color: '#64748b', fontSize: 13, marginVertical: 4 },
    amountText: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 5 },
    // History Section Styles
    historySection: { backgroundColor: '#f9fafb', padding: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    historyTitle: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    historyDate: { fontSize: 12, color: '#64748b' },
    historyAmount: { fontSize: 12, fontWeight: '600', color: '#10b981' },
    noHistory: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginBottom: 10 },
    
    addButton: { backgroundColor: '#1e3a8a', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    addButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalView: { backgroundColor: 'white', borderRadius: 20, padding: 25 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    label: { marginBottom: 10, color: '#475569' },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 15 },
    modalButtons: { flexDirection: 'row', gap: 10 },
    btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#e2e8f0' },
    saveBtn: { backgroundColor: '#1e3a8a' },
    payBtn: { backgroundColor: '#eff6ff', padding: 8, borderRadius: 6, marginTop: 8, borderWidth: 1, borderColor: '#bfdbfe' },
    payBtnText: { color: '#1e3a8a', fontWeight: 'bold', fontSize: 12 },
    cardHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardHeader: { 
        flex: 1, // Allow header to take remaining space
        padding: 15, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    deleteIconButton: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#f1f5f9'
    },
});