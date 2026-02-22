import React, { useState, useEffect, use } from "react";
import { View, Text, FlatList, StyleSheet, Modal, TextInput, Alert, TouchableOpacity,  } from "react-native";
import { useStore } from "../src/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); 
    const [restockAmount, setRestockAmount] = useState('');
    const invoices = useStore((state) => state.invoices);

    useEffect(() => {
        const loadProducts = async () => {
            const saved = await AsyncStorage.getItem('product_list');
            if (saved) setProducts(JSON.parse(saved));
        };
        loadProducts();
    }, []);

    const handleRestockSave = async () => {
        const additional = parseInt(restockAmount);
        if (isNaN(additional) || additional <= 0) {
            Alert.alert("Invalid Input", "Please enter a valid number of barrels.");
            return;
        }

        const newBatch = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            amount: additional,
        };

        const updatedProducts = products.map(p => {
            if (p.name === selectedProduct.name) {
                return {
                    ...p,
                    batches: [...(p.batches || []), newBatch]
                };
            }
            return p;
        });

        await AsyncStorage.setItem('product_list', JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
        setModalVisible(false);
        setRestockAmount('');
        Alert.alert("Stock Updated", `Added ${additional} barrels to ${selectedProduct.name}`);
    };

  
    const calculateStock = (productName) => {
        const product = products.find(p => p.name === productName);

        const totalRestocked = (product?.batches || []).reduce((sum, b) => sum + b.amount, 0);

        const totalSold = invoices.reduce((sum, invoice) => {
            const soldItem = invoice.items.find(i => i.name === productName);
            return sum + (soldItem ? parseInt(soldItem.quantity || 0) : 0);
        }, 0);
        return {
            totalRestocked,
            remaining: totalRestocked - totalSold
        };
    };

    const deleteBatch = async (productName, batchId) => {
        Alert.alert(
            "Delete Batch",
            "Are you sure you want to remove this stock entry? This will change your remaining balance.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        const updatedProducts = products.map(p => {
                            if (p.name === productName) {
                                return {
                                    ...p,
                                    batches: p.batches.filter(b => b.id !== batchId)
                                };
                            }
                            return p;
                        });

                        await AsyncStorage.setItem('product_list', JSON.stringify(updatedProducts));
                        setProducts(updatedProducts);
                    } 
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Current Stock Levels</Text>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const { totalRestocked, remaining } = calculateStock(item.name);
                    return (
                        <View style={styles.card}>
                            <Text style={styles.name}>{item.name}</Text>

                            <View style={styles.summaryBox}>
                                <Text style={styles.totalLabel}>Total Remaining: </Text>
                                <Text style={[styles.mainCount, { color: remaining < 5 ? '#ef4444' : '#10b981' }]}>
                                    {remaining} Barrels
                                </Text>
                            </View>

                            <Text style={styles.batchHeader}>Purchase History (Batches):</Text>
                            {(item.batches || []).length === 0 ? (
                                <Text style={styles.noBatchesText}>No stock added yet.</Text>
                            ) : (
                                item.batches.map((batch) => (
                                    <View key={batch.id} style={styles.batchRow}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                            <Text style={styles.batchDate}>{batch.date}</Text>
                                        </View>
                                        
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                            <Text style={styles.batchAmount}>+{batch.amount} Barrels</Text>
                                            
                                            {/* DELETE BATCH BUTTON */}
                                            <TouchableOpacity onPress={() => deleteBatch(item.name, batch.id)}>
                                                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}

                        <TouchableOpacity 
                            style={styles.restockBtn} 
                            onPress={() => {
                                setSelectedProduct(item);
                                setModalVisible(true);
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={20} color="#1e3a8a" />
                            <Text style={styles.restockText}>Restock Barrels</Text>
                        </TouchableOpacity>

      

                        </View>
                    );
                }}
            />
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Restock {selectedProduct?.name}</Text>
                        <Text style={styles.modalLabel}>Enter number of barrels to add:</Text>
                        
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. 10"
                            keyboardType="numeric"
                            value={restockAmount}
                            onChangeText={setRestockAmount}
                            autoFocus={true}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.btn, styles.cancelBtn]} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.btn, styles.confirmBtn]} 
                                onPress={handleRestockSave}
                            >
                                <Text style={styles.confirmBtnText}>Add Barrels</Text>
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
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1e3a8a' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
    name: { fontSize: 18, fontWeight: '600', color: '#334155' },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    detailItem: {
        alignItems: 'flex-start',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    label: { color: '#64748b' },
    count: { fontWeight: 'bold', fontSize: 16 },
    restockBtn: {
    marginTop: 15,
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    restockText: {
        color: '#1e3a8a',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalView: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        elevation: 10,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 10 },
    modalLabel: { color: '#64748b', marginBottom: 15 },
    modalInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 15,
        fontSize: 18,
        marginBottom: 20,
    },
    modalButtons: { flexDirection: 'row', gap: 10 },
    btn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#f1f5f9' },
    confirmBtn: { backgroundColor: '#1e3a8a' },
    cancelBtnText: { color: '#64748b', fontWeight: 'bold' },
    confirmBtnText: { color: 'white', fontWeight: 'bold' },
    
    restockBtn: {
        marginTop: 15,
        backgroundColor: '#eff6ff',
        padding: 12,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    restockText: { color: '#1e3a8a', fontWeight: 'bold' },
    summaryBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 10,
    },
    mainCount: {
        fontSize: 22,
        fontWeight: '800',
    },
    totalLabel: {
        fontSize: 14,
        color: '#64748b'
    },
    batchHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginTop: 10,
        marginBottom: 5,
    },
    batchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8, // Increased padding for easier tapping
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center'
    },
    noBatchesText: {
        fontSize: 12,
        color: '#94a3b8',
        fontStyle: 'italic',
        marginBottom: 10
    },
    batchDate: {
        fontSize: 14,
        color: '#475569',
    },
    batchAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e3a8a',
    },
});