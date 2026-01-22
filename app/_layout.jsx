import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#2f4ea1'},
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold'},
                title: 'Invoice Manager',
            }}>
                <Stack.Screen name="index" 
                    options={ { drawerLabel: 'Home', title: 'Dashboard',
                    drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
                    }}
                />
                 <Stack.Screen name="invoices" 
                    options={ { drawerLabel: 'Invoices', title: 'Invoices',
                    drawerIcon: ({ color }) => <Ionicons name="document-text-outline" size={22} color={color} />,    
                    }}
                />
                 <Stack.Screen name="payments" 
                    options={ { drawerLabel: 'Payments', title: 'Payments',
                        drawerIcon:({ color }) => <Ionicons name="cash-outline" size={22} color={color}/>
                    }}
                />
                <Stack.Screen name="expenses" 
                    options={ { drawerLabel: 'Expenses', title: 'Expenses',
                        drawerIcon: ({ color }) => <Ionicons name="calculator-outline" size={22} color={color}/>
                    }}
                />
                <Stack.Screen name="clients" 
                    options={ { drawerLabel: 'Clients', title: 'Clients',
                        drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
                    }}
                />
                <Stack.Screen name="products" 
                    options={ { drawerLabel: 'Products', title: 'Products',
                        drawerIcon: ({ color }) => <Ionicons name="albums-outline" size={22} color={color} />,
                    }}
                />
                <Stack.Screen name="purchase" 
                    options={ { drawerLabel: 'Purchase', title: 'Purchase',
                        drawerIcon: ({ color }) => <Ionicons name="medkit-outline" size={22} color={color}/>
                    }}
                />
                <Stack.Screen name="inventory" 
                    options={ { drawerLabel: 'Inventory', title: 'Inventory',
                        drawerIcon: ({ color }) => <Ionicons name="storefront-outline" size={22} color={color} />,
                    }}
                />
                <Stack.Screen name="reports" 
                    options={ { drawerLabel: 'Reports', title: 'Reports',
                        drawerIcon: ({ color }) => <Ionicons name="stats-chart-outline" size={22} color={color}/>
                    }}
                />
                  <Stack.Screen name="settings" 
                    options={ { drawerLabel: 'Settings', title: 'Settings',
                        drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color}/>
                    }}
                />
        </Stack>

    );
}