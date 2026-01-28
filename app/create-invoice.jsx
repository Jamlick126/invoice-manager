import React, { useState, useEffect} from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, Platform, FlatList, ScrollView, Alert, View, Modal } from "react-native";
import { useStore } from "../src/store";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


// --- HELPER FUNCTION FOR LONG DATE ---
const getLongDate = () => {
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());
};


export default function CreateInvoice() {
    const router = useRouter()
    const [allProducts, setAllProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [clientName, setClientName] = useState('');
    const [clients, setClients] = useState([]);
    const [clientModalVisible, setClientModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const addInvoice = useStore((state) => state.addInvoice);

    // Load clients from storage
    useEffect(() => {
        const loadClients = async () => {
            const saved = await AsyncStorage.getItem('client_list');
            if (saved) setClients(JSON.parse(saved));
        };
        loadClients();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            const saved = await AsyncStorage.getItem('product_list');
            if (saved) setAllProducts(JSON.parse(saved));
        };
        loadProducts();
    }, []);

    useEffect(() => {
        const newTotal = selectedItems.reduce((sum, item) => { 
            const itemPrice = parseFloat(item.price || 0);
            const itemQty = item.quantity || 1;
            return sum + (itemPrice * itemQty);
        }, 0)
        setTotal(newTotal);
    }, [selectedItems]);

    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.phone && client.phone.includes(searchQuery))
    );

    const handleSelectClient = (client) => {
        setClientName(client.name);
        setClientModalVisible(false);
    };

    const addItem = (product) => {
        const existingItemIndex = selectedItems.findIndex(item => item.id === product.id)

        if (existingItemIndex > -1) {

            const updatedItems = [...selectedItems];
            const currentQty = updatedItems[existingItemIndex].quantity || 1;
            updatedItems[existingItemIndex].quantity = currentQty + 1;
            setSelectedItems(updatedItems);
        } else {
             setSelectedItems([...selectedItems, { 
                ...product,
                quantity: 1,
                tempId: Math.random().toString()
            }]); 
        }
    };

    const removeItem = (id) => {
        const existingItemIndex = selectedItems.findIndex(item => item.id === id);

        if (existingItemIndex > -1) {
            const updatedItems = [...selectedItems];
            const currentQty = updatedItems[existingItemIndex].quantity || 1;

            if (currentQty > 1) {
                // If more than one, just reduce quantity
                updatedItems[existingItemIndex].quantity = currentQty - 1;
                setSelectedItems(updatedItems);
            } else {
                // If only one left, remove the item from the list
                setSelectedItems(selectedItems.filter(item => item.id !== id));
            }
        }
            
    };

    const saveInvoice = () => {
        if (selectedItems.length === 0) {
            Alert.alert("Error", "Please add at least one item");
            return;
        }
        try {
                // final invoice object
            const newInvoice = {
                id: Date.now().toString(),
                clientName: clientName || "Walk-in Customer",
                items: selectedItems,
                total: total,
                date: getLongDate(),
                status: 'Pending', //Default status
            };

            addInvoice(newInvoice);

            if (Platform.OS === 'web') {
                Alert.alert("Success: Invoice generated");
                router.push('/invoices');
            } else {
                Alert.alert(
                "Success", "Invoice generated!",
            [
                { text: "OK", onPress: () => router.push('/invoices')}
            ]);

            }
            
        } catch (error) {
            console.error("Failed to save invoice.", error);
            Alert.alert("Error", "Could not save invoice.")
        }
      
    };

    return (
        <View style={{flex: 1, backgroundColor: '#fff'}}>
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={styles.label}>Bill To:</Text>
                <TouchableOpacity 
                    style={styles.clientSelector} 
                    onPress={() => setClientModalVisible(true)}
                >
                    <Text style={clientName ? styles.clientSelected : styles.clientPlaceholder}>
                        {clientName || "Select a Client"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>

                {/* Client Selection Modal */}
                <Modal visible={clientModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Select Client</Text>
                                            {/* Search Bar Input */}
                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={20} color="#94a3b8" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search by name or phone..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close-circle" size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <FlatList
                                data={filteredClients}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={styles.clientItem} 
                                        onPress={() => handleSelectClient(item)}
                                    >
                                        <Text style={styles.clientItemName}>{item.name}</Text>
                                        <Text style={styles.clientItemPhone}>{item.phone}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>No clients found. Add them in the Clients page.</Text>
                                }
                            />
                            <TouchableOpacity 
                                style={styles.closeBtn} 
                                onPress={() => setClientModalVisible(false)}
                            >
                                <Text style={styles.closeBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Text style={styles.sectionTitle}>Selected Items</Text>
                {selectedItems.map((item) => (
                    <View key={item.tempId} style={styles.itemRow}>
                        <View>
                            <Text style={styles.itemName}>
                                {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                            </Text>
                            <Text style={styles.itemName}>
                                Ksh. {(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}
                            </Text>
                        </View>
                        
                        <TouchableOpacity onPress={() => removeItem(item.id)}>
                            <Ionicons name="remove-circle" size={24} color="red"/>
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>Ksh. {total.toFixed(2)}</Text>
                </View>

                <Text style={styles.sectionTitle}>Tap to Add Product</Text>
                <View style={styles.productList}>
                    {allProducts.map((product) => (
                        <TouchableOpacity 
                            key={product.id}
                            style={styles.productBadge}
                            onPress={() => addItem(product)}
                        >
                            <Text style={styles.badgeText}>{product.name}</Text>
                            <Ionicons name="add-circle" size={18} color="white"/>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={saveInvoice}
                    activeOpacity={0.7}>
                    <Text style={styles.saveButtonText}>Generate Invoice</Text>
                </TouchableOpacity>
            </View>
            
        </View>
    ) 
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff' },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18, 
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#3f4ea1'
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8
  },
  itemName: {
    flex: 1,
    fontSize: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  itemPrice: { fontWeight: 'bold', marginRight: 15},
  totalBox: {
    backgroundColor: '#2f4ea1',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  totalLabel: { color: '#fff', fontSize: 18 },
  totalValue: { color: '#fff', fontSize: 22, fontWeight: 'bold'},
  productList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  productBadge: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  badgeText: { color: '#fff'},
  saveButton: {
    backgroundColor: '#28a745',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center'
  },
  saveButtonText: {
    color:'#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Handle notch area
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 20,
    zIndex: 9999,
},
clientSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 20
},
clientPlaceholder: { color: '#94a3b8' },
clientSelected: { color: '#1e293b', fontWeight: '500' },
clientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
},
clientItemName: { fontSize: 16, fontWeight: '600' },
clientItemPhone: { fontSize: 12, color: '#64748b' },
modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
modalView: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
closeBtn: { marginTop: 10, padding: 15, alignItems: 'center' },
closeBtnText: { color: '#ef4444', fontWeight: 'bold' },
searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
},
searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#1e293b',
},
emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 20,
    fontSize: 14,
},
});