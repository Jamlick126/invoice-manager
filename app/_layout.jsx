import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

export default function Layout() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    // 1. Check if user is logged in on mount
    const checkUser = async () => {
        const user = await AsyncStorage.getItem('user_session');
        setIsAuthenticated(!!user);
        setIsLoading(false);
    };
    useEffect(() => {
        checkUser();
    }, [segments]);

    // 2. Navigation Guard Logic
    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            // Redirect to dashboard if authenticated but trying to access login
            router.replace('/');
        }
    }, [isAuthenticated, segments, isLoading]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2f4ea1" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#2f4ea1'},
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold'},
                title: 'Invoice Manager',
            }}>

                {/* AUTH SCREENS (Hidden from headers) */}
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />

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