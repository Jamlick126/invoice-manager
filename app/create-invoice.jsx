import React, { useState, useEffect} from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, Platform, FlatList, ScrollView, Alert, View } from "react-native";
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
    

    const addInvoice = useStore((state) => state.addInvoice);


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
                <TextInput
                    style={styles.input}
                    placeholder="Enter Client Name"
                    value={clientName}
                    onChangeText={setClientName}
                />
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
});