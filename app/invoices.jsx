import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStore} from '../src/store';
import { Ionicons } from '@expo/vector-icons';

export default function Invoices() {
    const router = useRouter();
    const invoices = useStore((state) => state.invoices);
    const deleteInvoice = useStore((state) => state.deleteInvoice);

    const confirmDelete = (id) => {
        alert(
            "Delete Invoice",
            "Are you sure you want to remove this record?",
            [
                {text: "Cancel", style: "cancel"},
                {text: "Delete", style: "destructive", onPress: () => deleteInvoice(id)}
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Recent Invoices</Text>
           
                <FlatList 
                    data={invoices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.invoiceCard}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.clientName}>{item.clientName || "Walk-in Customer"}</Text>
                                <Text style={styles.dateText}>{item.date}</Text>
                                <Text style={styles.itemCount}>{item.items?.length || 0} Items</Text>
                            </View>
                            <View style={styles.cardACtions}>
                                <Text style={styles.amount}>Ksh. {item.total.toFixed(2)}</Text>
                                <TouchableOpacity
                                    onPress={() => confirmDelete(item.id)}
                                    style={styles.deleteBtn}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#ef4444"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={80} color="#cbd5e1"/>
                            <Text style={styles.emptyText}>No invoices found</Text>
                        </View>}
                />
            {/* Floating Action Button*/}
            <TouchableOpacity style={styles.fab}
                onPress={() => router.push('/create-invoice')}>
                    <Ionicons name="add" size={30} color="#fff"/>
            </TouchableOpacity>
           
        </View>
    );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        margin: 20,
        color: '#2f4ea1'
    },
    clientName: {
        fontSize: 17,
        fontWeight: '700', 
        color: '#334155',
        marginBottom: 4
    }, 
    emptyContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 100
    },
    emptyText: { 
        color: '#94a3b8',
        fontSize: 16, 
        marginTop: 10 },
    fab: {
        position: 'absolute', bottom: 30, right: 30,
        backgroundColor: '#1e3a8a', width: 64, height: 64,
        borderRadius: 32, justifyContent: 'center', alignItems: 'center',
        elevation: 5,
        shadowColor: '#1e3a8a', shadowOpacity: 0.3, shadowRadius: 10
    },
    invoiceCard: {
        backgroundColor: '#0000001e', 
        padding: 16, 
        marginHorizontal: 20,
        marginBottom: 12, 
        borderRadius: 16, 
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    cardInfo: {
        flex: 1
    },
    dateText: { fontSize: 13, color: '#64748b', marginBottom: 2 },
    cardActions: { alignItems: 'flex-end' },
    itemCount: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

    amount: { 
        fontSize: 18,
        color: '#10b981', 
        fontWeight: '800',
        marginBottom: 8 
    },
    deleteBtn: {
        padding: 8,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
    }
});