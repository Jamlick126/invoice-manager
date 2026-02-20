import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const storedUserJson = await AsyncStorage.getItem('user_session');
            
            if (!storedUserJson) {
            Alert.alert("Error", "No account found. Please sign up first.");
            return;
            }
            const storedUser = JSON.parse(storedUserJson);
            
            if (email.toLowerCase() === storedUser.email.toLowerCase() && password === storedUser.password) {
                // Re-save the session to trigger the Layout Guard if necessary
                await AsyncStorage.setItem('user_session', JSON.stringify(storedUser));
                
                router.replace('/');
            } else {
            Alert.alert("Error", "Invalid credentials. Use admin/1234");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong while logging in.");
        }
        
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoCircle}>
                <Ionicons name="stats-chart" size={50} color="#fff"/>
            </View>

            <Text style={styles.title}>Invoice Manager</Text>
            <Text style={styles.subtitle}>Secure Financial Tracking</Text>

            <TextInput 
                style={styles.input}
                placeholder="Username or Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput 
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.linkText}>Don't have an account? <Text style={{fontWeight: 'bold'}}>Sign Up</Text></Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', padding: 30 },
    logoCircle: { backgroundColor: '#1e3a8a', width: 100, height: 100, borderRadius: 50, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 40 },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
    loginBtn: { backgroundColor: '#1e3a8a', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    loginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    linkText: { color: '#64748b', textAlign: 'center', marginTop: 20 }
});