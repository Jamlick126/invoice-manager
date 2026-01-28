
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PURCHASE_STORAGE_KEY = 'purchase_list';

export default function Purchase() {
    const [modalVisible, setModalVisible] = useState(false);
    const [purchases, setPurchases] = useState([]);
    const [supplier, setSupplier] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => { loadPurchases(); }, []);

    const loadPurchases = async () => {
        const saved = await AsyncStorage.getItem(PURCHASE_STORAGE_KEY);
        if (saved) setPurchases(JSON.parse(saved));
    };

    const addPurchase = async () => {
        if (supplier && amount) {
            const newPurchase = {
                id: Date.now().toString(),
                supplier,
                amount: parseInt(amount),
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

    const toggleStatus = async (id) => {
        const newList = purchases.map(p => 
            p.id === id ? { ...p, status: p.status === 'Unpaid' ? 'Paid' : 'Unpaid' } : p
        );
        setPurchases(newList);
        await AsyncStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(newList));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Supplier Purchases</Text>
            <FlatList
                data={purchases}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.supplierName}>{item.supplier}</Text>
                            <Text style={styles.date}>{item.date} - {item.description}</Text>
                            <TouchableOpacity 
                                style={[styles.statusBadge, { backgroundColor: item.status === 'Paid' ? '#dcfce7' : '#fee2e2' }]}
                                onPress={() => toggleStatus(item.id)}
                            >
                                <Text style={{ color: item.status === 'Paid' ? '#166534' : '#991b1b', fontSize: 12, fontWeight: 'bold' }}>
                                    {item.status}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.amountText}>Ksh {item.amount.toLocaleString()}</Text>
                    </View>
                )}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1e3a8a' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
    supplierName: { fontSize: 17, fontWeight: 'bold' },
    date: { color: '#64748b', fontSize: 13, marginVertical: 4 },
    amountText: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 5 },
    addButton: { backgroundColor: '#1e3a8a', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    addButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalView: { backgroundColor: 'white', borderRadius: 20, padding: 25 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 15 },
    modalButtons: { flexDirection: 'row', gap: 10 },
    btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#e2e8f0' },
    saveBtn: { backgroundColor: '#1e3a8a' }
});