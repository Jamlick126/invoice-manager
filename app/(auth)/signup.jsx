import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function Signup() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        businessName: '',
        phone: '',
        email: '',
        password: '',
    });

    const handleSignup = async () => {
        const { businessName, phone, email, password } = form;

        const userData = { businessName, phone, email, password };
        
        if (!businessName || !email || !password) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        try {
            // 1. Save user session
            await AsyncStorage.setItem('user_session', JSON.stringify(userData));
            
            // 2. Save Business Profile for Invoices (Links to your Profile store logic)
            const profileData = { businessName, phone };
            await AsyncStorage.setItem('business_profile', JSON.stringify(profileData));

            Alert.alert("Success", "Account created successfully!");
            router.replace('/'); // Go to Dashboard
        } catch (error) {
            Alert.alert("Error", "Failed to save account data");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
            </TouchableOpacity>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start managing your business finances</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Name *</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. Samburu Electronics" 
                    value={form.businessName}
                    onChangeText={(t) => setForm({...form, businessName: t})}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="0712..." 
                    keyboardType="phone-pad"
                    value={form.phone}
                    onChangeText={(t) => setForm({...form, phone: t})}
                />

                <Text style={styles.label}>Email Address *</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="email@example.com" 
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={(t) => setForm({...form, email: t})}
                />

                <Text style={styles.label}>Password *</Text>
                <View style={styles.passwordContainer}>
                    <TextInput 
                    style={styles.passwordInput} 
                    placeholder="••••••••" 
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(t) => setForm({...form, password: t})}
                    />
                    <TouchableOpacity 
                        style={styles.eyeIcon} 
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons 
                            name={showPassword ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color="#64748b" 
                        />
                    </TouchableOpacity>
                </View>
               
            </View>

            <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
                <Text style={styles.signupText}>Create Account</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#f8fafc', padding: 25, paddingTop: 60 },
    backBtn: { marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1e3a8a' },
    subtitle: { fontSize: 16, color: '#64748b', marginBottom: 30 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
    signupBtn: { backgroundColor: '#1e3a8a', padding: 18, borderRadius: 12, alignItems: 'center' },
    signupText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
    },
    eyeIcon: {
        paddingHorizontal: 15,
    },
});