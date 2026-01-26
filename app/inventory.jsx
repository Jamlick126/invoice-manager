import React, { useState, useEffect, use } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useStore } from "../src/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Inventory() {
    const [products, setProducts] = useState([]); // Assuming products are in store
    const invoices = useStore((state) => state.invoices);

    useEffect(() => {
        const loadProducts = async () => {
            const saved = await AsyncStorage.getItem('product_list');
            if (saved) setProducts(JSON.parse(saved));
        };
        loadProducts();
    }, []);

    const calculateStock = (productName) => {
        const product = products.find(p => p.name === productName);
        const initial = parseInt(product?.initialStock || 0);

        const totalSold = invoices.reduce((sum, invoice) => {
            const soldItem = invoice.items.find(i => i.name === productName);
            return sum + (soldItem ? parseInt(soldItem.quantity || 0) : 0);
        }, 0);
        return {
            initial,
            remaining: initial - totalSold
        };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Current Stock Levels</Text>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const { initial, remaining } = calculateStock(item.name);
                    return (
                        <View style={styles.card}>
                            <Text style={styles.name}>{item.name}</Text>

                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.label}>Initial Stock</Text>
                                    <Text style={styles.value}>{initial} Barrels</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.label}>Remaining:</Text>
                                    <Text style={[
                                        styles.count, 
                                        { color: remaining < 5 ? '#ef4444' : '#10b981' }
                                    ]}>
                                        {remaining} Barrels
                                    </Text> 
                                </View>
                            </View>

                        </View>
                    );
                }}
            />
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
    count: { fontWeight: 'bold', fontSize: 16 }
});