import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLIENTS_STORAGE_KEY = 'client_list';

export default function Clients() {
    const [modalVisible, setModalVisible] = useState(false);
    const [clients, setClients] = useState([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const saved = await AsyncStorage.getItem(CLIENTS_STORAGE_KEY);
            if (saved) setClients(JSON.parse(saved));
        }
        catch (error) {
            console.error("Failed to load clients", error);
        }
    }

    const saveClients = async (newList) => {
        try {
            await AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(newList));
        }
        catch (error) {
            console.error("Failed to save clients", error);
        }
    }

    const addClient = () => {
        if (name) {
            const newClient = { id: Date.now().toString(), name, phone };
            const newList = [...clients, newClient];
            setClients(newList);
            saveClients(newList);
            setName(''); setPhone('');
            setModalVisible(false);
        }
    };

    const deleteClient = (id) => {
        const newList = clients.filter(c => c.id !== id);
        setClients(newList);
        saveClients(newList);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Clients List</Text>

            <FlatList
                data={clients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View>
                            <Text style={styles.clientName}>{item.name}</Text>
                            <Text style={styles.clientPhone}>{item.phone || 'No Phone'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => deleteClient(item.id)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="person-add" size={24} color="white" />
                <Text style={styles.addButtonText}>Add New Client</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>New Client</Text>
                        <TextInput style={styles.input} placeholder="Client Name" value={name} onChangeText={setName} />
                        <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={addClient}>
                                <Text style={{color:'white'}}>Save Client</Text>
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
    clientName: { fontSize: 18, fontWeight: '600' },
    clientPhone: { color: '#64748b' },
    addButton: { backgroundColor: '#1e3a8a', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
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