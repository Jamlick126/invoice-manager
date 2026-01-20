import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStore} from '../src/store';
import { Ionicons } from '@expo/vector-icons';

export default function Invoices() {
    const router = useRouter();
    const invoices = useStore((state) => state.invoices);

    return (
        <View style={StyleSheet.container}>
            {invoices.length === 0 ? (
                <View style={StyleSheet.empty}>
                    <Ionicons name="document-text-outline" size={64} color="#ccc"/>
                    <Text style={StyleSheet.emptyText}>No invoices yet</Text>
                </View> 
            ): (
                <FlatList 
                    data={invoices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View>
                            <Text style={styles.clientName}>{item.clientName}</Text>
                            <Text style={styles.amount}>${item.total.toFixed(2)}</Text>
                        </View>
                    )}
                />
            )}
            {/* Floating Action Button*/}
            <TouchableOpacity style={styles.fab}
                onPress={() => router.push('/create-invoice')}>
                    <Ionicons name="add" size={30} color="#fff"/>
            </TouchableOpacity>
           
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#94a3b8', marginTop: 10 },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: '#1e3a8a', width: 60, height: 60,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 5,
  },
  card: {
    backgroundColor: '#fff', padding: 15, marginHorizontal: 15,
    marginTop: 10, borderRadius: 10, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  clientName: { fontWeight: 'bold', fontSize: 16 },
  amount: { color: '#10b981', fontWeight: 'bold' }
});