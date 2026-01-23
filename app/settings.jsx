import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useStore } from '../src/store';
import { useRouter } from 'expo-router';

export default function Settings() {
    const { profile, updateProfile } = useStore();
    const [businessName, setBusinessName] = useState(profile.businessName);
    const [phone, setPhone] = useState(profile.phone);
    const router = useRouter();

    const handleSave = () => {
        updateProfile({ businessName, phone });
        Alert.alert("Success", "Profile updated successfully!");
        router.back();
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Company Profile</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Name</Text>
                <TextInput 
                    style={styles.input} 
                    value={businessName} 
                    onChangeText={setBusinessName}
                    placeholder="e.g. Bolt Electronics"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput 
                    style={styles.input} 
                    value={phone} 
                    onChangeText={setPhone}
                    placeholder="e.g. +254..."
                    keyboardType="phone-pad"
                />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#1e3a8a' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    saveBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});