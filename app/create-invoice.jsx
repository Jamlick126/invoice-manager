import { Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useStore } from "../src/store";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";

export default function CreateInvoice() {
    const router = useRouter()
    const addInvoice = useStore((state) => state.addInvoice);

    const [clientName, setClientName] = useState('');
    const [amount, setAmount] = useState('');

    const handleSave = () => {
        if (!clientName || !amount) return alert("Please fill all fields");

        addInvoice({
            id: Date.now().toString(),
            clientName,
            total: parseFloat(amount),
            date: new Date().toLocaleDateString(),
        })

        router.back();
    };
    return (
        <ScrollView style={StyleSheet.container}>
            <Text style={StyleSheet.label}>Client Name</Text>
            <TextInput style={StyleSheet.input}
                value={clientName}
                onChangeText={setClientName}
                placeholder="Enter Client Name"/>
            
            <Text style={styles.label}>Total Amount ($)</Text>
            <TextInput 
            style={styles.input} 
            value={amount} 
            onChangeText={setAmount} 
            keyboardType="numeric"
            placeholder="0.00"
            />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Invoice</Text>
            </TouchableOpacity>
        </ScrollView>
    ) 
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginBottom: 5, color: '#1e3a8a' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 8, marginBottom: 20 },
  button: { backgroundColor: '#1e3a8a', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});