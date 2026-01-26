import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,TouchableOpacity, FlatList } from 'react-native';

const MENU_ITEMS = [
  { id: '1', title: 'Invoices', icon: 'document-text-outline', color: '#3b82f6', route: '/invoices' },
  { id: '2', title: 'Payments', icon: 'cash-outline', color: '#10b981', route: '/payments' },
  { id: '3', title: 'Expenses', icon: 'calculator-outline', color: '#8b5cf6', route: '/expenses' },
  { id: '4', title: 'Products', icon: 'albums-outline', color: '#aef65c', route: '/products' },
  { id: '5', title: 'Settings', icon: 'settings-outline', color: '#aed6ca', route:'/settings'},
  { id: '7', title: 'Inventory', icon: 'cube-outline', color: '#f59e0b', route:'/inventory' },
]

export default function Dashboard() {
  const router = useRouter()

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(item.route)}>
        <View style={[styles.iconContainer, {
          backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={30} color={item.color}/>
        </View>
        <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  )
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <FlatList 
        data={MENU_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  grid: {
    padding: 10,
    paddingTop: 20
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // shadow for Android
    shadowColor: '#000', // shadow for iOS
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.1,
    height: 110,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374152'
  },
});
