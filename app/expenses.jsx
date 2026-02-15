import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSE_STORAGE_KEY = 'expense_list';

const EXPENSE_CATEGORIES = [
    { label: 'Transport', group: 'Expenses'},
    { label: 'Labor', group: 'Expenses'},
    { label: 'Shosh', group: 'Payable'},
    { label: 'Brian', group: 'Payable'},
    { label: 'Gabriel', group: 'Payable'}
];


export default function Expenses() {
    const [modalVisible, setModalVisible] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0].label);

    useEffect(() => { loadExpenses(); }, []);

    const loadExpenses = async () => {
        const saved = await AsyncStorage.getItem(EXPENSE_STORAGE_KEY);
        if (saved) setExpenses(JSON.parse(saved));
    };

    const addExpense = async () => {
        if (title && amount) {
            const categoryInfo = EXPENSE_CATEGORIES.find(c => c.label === selectedCategory);

            const newExpense = {
                id: Date.now().toString(),
                title,
                amount: parseInt(amount),
                category: selectedCategory,
                group: categoryInfo.group,
                date: new Date().toLocaleDateString(),
                status: categoryInfo.group === 'Payable' ? 'Unpaid' : 'Cleared'
            };
            const newList = [newExpense, ...expenses];
            setExpenses(newList);
            await AsyncStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(newList));
            
            // Reset and close
            setModalVisible(false);
            setTitle(''); setAmount(''); setCategory('');
        } else {
            Alert.alert("Error", "Please fill in the title and amount");
        }
    };

    const deleteExpense = (id) => {
        Alert.alert("Delete", "Remove this expense?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                const newList = expenses.filter(e => e.id !== id);
                setExpenses(newList);
                await AsyncStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(newList));
            }}
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Business Expenses</Text>
            
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.expenseCard}>
                        <View>
                            <Text style={styles.expenseTitle}>{item.title}</Text>
                            <Text style={styles.expenseSub}>{item.date} • {item.category || 'General'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.expenseAmount}>Ksh {item.amount.toLocaleString()}</Text>
                            <TouchableOpacity onPress={() => deleteExpense(item.id)} style={{ marginLeft: 15 }}>
                                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalHeader}>Log Expense</Text>
                        <TextInput style={styles.input} placeholder="What was this for? (e.g. Electricity)" value={title} onChangeText={setTitle} />
                        <TextInput style={styles.input} placeholder="Amount (Ksh)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                        
                        {/* Category Selector Logic */}
                        <Text style={styles.label}>Select Category:</Text>
                        <View style={styles.categoryPicker}>
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <TouchableOpacity 
                                    key={cat.label}
                                    style={[
                                        styles.catBtn, 
                                        selectedCategory === cat.label && styles.catBtnActive
                                    ]}
                                    onPress={() => setSelectedCategory(cat.label)}
                                >
                                    <Text style={{ color: selectedCategory === cat.label ? 'white' : '#1e3a8a' }}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={addExpense}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Expense</Text>
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
    header: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 20 },
    expenseCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
    expenseTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    expenseSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
    expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' },
    fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#1e3a8a', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalView: { backgroundColor: 'white', borderRadius: 20, padding: 25 },
    modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 15 },
    modalButtons: { flexDirection: 'row', gap: 10 },
    btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#e2e8f0' },
    saveBtn: { backgroundColor: '#1e3a8a' },
    categoryPicker: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 8, 
        marginBottom: 20 
    },
    catBtn: { 
        paddingVertical: 6, 
        paddingHorizontal: 12, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: '#1e3a8a' 
    },
    catBtnActive: { 
        backgroundColor: '#1e3a8a' 
    },
    label: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        marginBottom: 10, 
        color: '#64748b' 
    }
});