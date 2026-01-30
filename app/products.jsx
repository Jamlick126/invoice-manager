import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet,TouchableOpacity,Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'product_list';

export default function Products() {
    const [modalVisible, setModalVisible] = useState(false);
    const [products, setProducts] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    // Load data from storage on startup
    useEffect(() => {
        loadProducts();
    }, []);
    // save data to storage when product list changes
    useEffect(() => {
        saveProducts(products);
    }, [products]);
    
    const addProducts = () => {
        if (name && price && stock) {
            const newProduct = {
                id: Date.now().toString(),
                name,
                price,
                initialStock: parseInt(stock),
            };
            setProducts([...products, newProduct]);
            setName('');
            setPrice('');
            setStock('');
            setModalVisible(false);
        }
    };
 

    const loadProducts = async () => {
        try {
            const saveProducts = await AsyncStorage.getItem(STORAGE_KEY);
            if (saveProducts !== null) {
                setProducts(JSON.parse(saveProducts));
            } else {
                setProducts([
                    { id: '1', name: 'KEG Black', price: '5800', initialStock: 100},
                ]);
            }
        } catch (e) {
            console.error("Failed to load products", e);
        }
    };

    const saveProducts = async (value) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error("Failed to save products", e);
        }
    };

    const deleteProduct = (id) => {
        setProducts(products.filter(item => item.id !== id));
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Products</Text>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.productCard}>
                        <View>
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productPrice}>{item.price}</Text>
                            <Text style={{fontSize: 12, color: '#64748b'}}>Base Stock: {item.initialStock}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => deleteProduct(item.id)}>
                            <Ionicons name="trash-outline" size={20}/>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Quick Add Button */}
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={30} color="white" />
                <Text style={styles.addButtonText}>Add New Product</Text>
            </TouchableOpacity>

            {/* Add Product Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalView}
                    >
                        <Text style={styles.modalTitle}>New Product</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Product Name "
                            value={name}
                            onChangeText={setName}
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Price (Ksh.)"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Starting Stock Quantity"
                            value={stock}
                            onChangeText={setStock}
                            keyboardType="numeric"
                        />  
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={addProducts}>
                                <Text style={styles.buttonText}>Save Product</Text>
                            </TouchableOpacity>
                        </View>

                    </KeyboardAvoidingView>
                </View>

            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2f4ea1' },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  productName: { fontSize: 18, fontWeight: '500' },
  productPrice: { color: '#666', marginTop: 4 },
  addButton: {
    backgroundColor: '#2f4ea1',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: { 
    color: 'white', 
    fontWeight: 'bold', marginLeft: 10 
},
fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2f4ea1',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#2f4ea1' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#999' },
  saveButton: { backgroundColor: '#2f4ea1' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});