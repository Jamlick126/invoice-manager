import React, { useState, useEffect }from "react";
import { View, Text, Modal, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useStore} from '../src/store';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const printInvoice = async (invoice) => {
    const { profile } = useStore.getState();

    const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = invoice.total - totalPaid;

    const html = `
    <html>
    <head>
        <style>
        body { padding: 20px; font-family: 'Helvetica' ,sans-serif; color:#333 }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; }
          .business-info h1 { color: #1e3a8a; marginTop: 10px; text-transform: uppercase; }
          .business-info p { margin: 2px 0; color: #64748b; }
          .invoice-details { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px;}
        th { background-color: #f8fafc; padding: 12px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }

        .payment-history-title { margin-top: 30px; font-size: 14px; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
        .payment-table td { border-bottom: 1px dashed #e2e8f0; color: #475569; }

        .summary-container { margin-top: 30px; border-top: 2px solid #1e3a8a; padding-top: 10px; }
        .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 16px; }
        .balance-row { background-color: #fef2f2; color: #ef4444; font-weight: bold; padding: 10px; border-radius: 5px; margin-top: 10px; }
    
        .client-section {
            margin: 20px 0;
            padding: 10px;
            background-color: #f8fafc; /* Light gray background to make it pop */
            border-radius: 5px;
        }
        .client-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .client-name {
            font-size: 22px; /* Increased font size */
            font-weight: bold;
            color: #1e3a8a; /* Deep blue to match the header */
        }
        .logo-container img {
            width: 100px;
            height: 100px;
            object-fit: contain;] /* Ensures the whole logo fits without cropping */
            display: block;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 100px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
        .terms-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
        }
        .terms-text {
            font-size: 11px;
            color: #64748b;
            line-height: 1.5;
        }
        </style>
    </head>
        <body>
            <div class="header">
                <div class="logo-container">
                    ${profile.logoUri ? `<img src="${profile.logoUri}" style="width: 100px; height: 100px; object-fit: contain; border-radius: 12px" />` : ''}
                </div>
                <div class="business-info">
                    <h1>${profile.businessName || 'BIZ'}</h1>
                    <p>${profile.phone || 'Contact Info Not Set'}</p>
                </div>

                <div class="invoice-details">
                    <h2>OFFICIAL RECEIPT</h2>
                    <p><strong>Date:</strong> ${invoice.date}</p>
                    <p><strong>Invoice #:</strong> ${invoice.id.slice(-6)}</p>
                    <p><strong>Status:</strong> <span style="color: ${invoice.status === 'Paid' ? '#10b981' : '#ef4444'}">${invoice.status || 'Pending'}</span></p>
                </div>
            </div>

            <div class="client-section">
                <div class="client-label">Bill To:</div>
                <div class="client-name">${invoice.clientName}</div>
            </div>
            
            <hr />
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right; padding: 8px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                        <td>${item.name} (x${item.quantity || 1})</td>
                        <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">
                            Ksh. ${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}
                        </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            ${invoice.payments && invoice.payments.length > 0 ? `
                <div class="payment-history-title">Payment History</div>
                <table class="payment-table">
                    <thead>
                        <tr>
                            <th style="background: none;">Date</th>
                            <th style="background: none;">Method</th>
                            <th style="text-align: right; background: none;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.payments.map(p => `
                            <tr>
                                <td>${p.date}</td>
                                <td>
                                    ${p.method}
                                    ${p.transId ? `<br/><small style="color:#64748b;">Ref: ${p.transId}</small>` : ''}
                                </td>
                                <td style="text-align: right;">Ksh. ${p.amount.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : ''}

            <div class="summary-container">
                <div class="summary-row">
                    <span>Gross Total:</span>
                    <span>Ksh. ${invoice.total.toLocaleString()}</span>
                </div>
                <div class="summary-row" style="color: #10b981;">
                    <span>Total Paid:</span>
                    <span>- Ksh. ${totalPaid.toLocaleString()}</span>
                </div>
                
                ${balanceDue > 0 ? `
                <div class="summary-row balance-row">
                    <span>BALANCE DUE:</span>
                    <span>Ksh. ${balanceDue.toLocaleString()}</span>
                </div>
                ` : `
                <div class="summary-row" style="color: #10b981; font-weight: bold; margin-top: 10px;">
                    <span>ACCOUNT STATUS:</span>
                    <span>FULLY PAID</span>
                </div>
                `}
            </div>

            <div class="footer">
            <div class="terms-title">Terms & Conditions</div>
                <div class="terms-text">
                    1. Goods once sold are not returnable or exchangeable. <br />
                    2. Payments should be made within 7 days of the invoice date. <br />
                    3. Thank you for choosing ${profile.businessName || 'our business'}!
                </div>
            </div>

        </body>
    </html>`;

    try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf'});
    } catch (error) {
        console.error("PDF Error:", error);
        Alert.alert("Error", "Could not generate PDF.");
    }
};

export default function Invoices() {
    const router = useRouter();
    const invoices = useStore((state) => state.invoices);
    const updateInvoiceStatus = useStore((state) => state.updateInvoiceStatus);
    const [isReady, setIsReady] = useState(false);
    const deleteInvoice = useStore((state) => state.deleteInvoice);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');// 'Cash' or 'M-Pesa'
    const [paymentAmount, setPaymentAmount] = useState('');
    const [transId, setTransId] = useState('');

    useEffect(() => {
        setIsReady(true);
    }, []);

    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>Loading History...</Text>
            </View>
        )
    }

    const handleDelete = (id) => {
        // Check if on web or mobile
        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete this invoice?")) {
                deleteInvoice(id);
            }
        } else {
            Alert.alert(
                "Delete Invoice",
                "Are you sure you want to remove this record?",
                [
                    {text: "Cancel", style: "cancel"},
                    {text: "Delete", style: "destructive", onPress: () => deleteInvoice(id)}
                ]
            );
        }
       
    };
    const getStatusStyle = (status) => ({
        backgroundColor: status === 'Paid' ? '#dcfce7' : '#fee2e2',
        color: status === 'Paid' ? '#166534' : '#991b1b',
    });

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
                                {/* Status Badge */}
                                <TouchableOpacity 
                                    onPress={() => {
                                        // Calculate total already paid
                                        const amountPaidSoFar = (item.payments || []).reduce((sum, p) => sum + p.amount, 0);
                                        const balanceRemaining = item.total - amountPaidSoFar;

                                        // Keep clickable if balance is more than 0
                                        if (balanceRemaining > 0) {
                                            setSelectedInvoice(item);
                                            setPaymentAmount(balanceRemaining.toString()); // Prefill with the remaining balance
                                            setPaymentModalVisible(true);
                                        } else {
                                            Alert.alert("Completed", "This invoice is fully paid.");
                                        }
                                    }}
                                    style={[styles.statusBadge, { 
                                        backgroundColor: item.status === 'Paid' ? '#dcfce7' : (item.payments?.length > 0 ? '#fef9c3' : '#fee2e2') 
                                    }]}
                                >
                                    <Text style={[styles.statusText, { 
                                        color: item.status === 'Paid' ? '#166534' : (item.payments?.length > 0 ? '#854d0e' : '#991b1b') 
                                    }]}>
                                        {item.status || 'Pending'}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: 'bold' }}>
                                        Balance: Ksh. {(item.total - (item.payments || []).reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}
                                    </Text>
                                                                                                    
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardActions}>
                                <Text style={styles.amount}>Ksh. {(item.total || 0).toFixed(2)}</Text>
                                <View style={{ flexDirection: 'row', gap: 12}}>
                                    {/* PRINT BUTTON */}
                                    <TouchableOpacity 
                                        onPress={() => printInvoice(item)} 
                                        style={styles.printBtn}
                                    >
                                        <Ionicons name="print-outline" size={22} color="#3b82f6" />
                                    </TouchableOpacity>
                                     <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        style={styles.deleteBtn}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ef4444"/>
                                    </TouchableOpacity>

                                </View>
                               
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
        {/* PAYMENT MODAL */}
        <Modal visible={paymentModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalView}>
                    <Text style={styles.modalHeader}>Record Payment</Text>
                    
                    <Text style={styles.label}>Select Method:</Text>
                    <View style={styles.methodRow}>
                        {['Cash', 'M-Pesa'].map(method => (
                            <TouchableOpacity 
                                key={method}
                                style={[styles.methodBtn, paymentMethod === method && styles.activeMethod]}
                                onPress={() => setPaymentMethod(method)}
                            >
                                <Text style={{ color: paymentMethod === method ? '#fff' : '#1e3a8a' }}>{method}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput 
                        style={styles.input}
                        keyboardType="numeric"
                        value={paymentAmount}
                        onChangeText={setPaymentAmount}
                        placeholder="Amount to pay"
                    />

                    {paymentMethod === 'M-Pesa' && (
                        <TextInput 
                            style={styles.input}
                            placeholder="M-Pesa Ref (e.g. RCK...)"
                            value={transId}
                            onChangeText={setTransId}
                            autoCapitalize="characters"
                        />
                    )}


                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setPaymentModalVisible(false)}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => {
                            // This calls your store's addPayment action
                            updateInvoiceStatus(selectedInvoice.id, 'Paid', {
                                amount: parseFloat(paymentAmount),
                                method: paymentMethod,
                                transId: paymentMethod === 'M-Pesa' ? transId: '',
                                date: new Date().toLocaleDateString()
                            });
                            setTransId('');
                            setPaymentModalVisible(false);
                        }}>
                            <Text style={{color: '#fff'}}>Save Payment</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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
        backgroundColor: '#ffffff', 
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
    printBtn: {
        padding: 8,
        backgroundColor: '#eff6ff', // Light blue background
        borderRadius: 8,
    },
    deleteBtn: {
        padding: 8,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
    },
    statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    clientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
modalView: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1e3a8a' },
methodRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
methodBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1e3a8a', alignItems: 'center' },
activeMethod: { backgroundColor: '#1e3a8a' },
input: { borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 10, marginBottom: 20 },
modalButtons: { flexDirection: 'row', gap: 10 },
cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
saveBtn: { flex: 2, backgroundColor: '#10b981', padding: 15, borderRadius: 10, alignItems: 'center' },
label: { fontSize: 14, color: '#64748b', marginBottom: 8 }
});