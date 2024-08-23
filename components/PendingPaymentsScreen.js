import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import axios from 'axios';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebase';

const PendingPaymentsScreen = ({ route }) => {
  const { userId } = route.params;

  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    const fetchPendingPayments = () => {
      const paymentsRef = ref(database, 'bids');
      onValue(paymentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userPayments = [];
          Object.keys(data).forEach((productId) => {
            Object.keys(data[productId]).forEach((bidId) => {
              const bidData = data[productId][bidId];
              if (
                bidData.userId === userId &&
                bidData.status === 'accepted' &&
                bidData.paymentStatus !== 'completed'
              ) {
                userPayments.push({ ...bidData, productId, bidId });
              }
            });
          });
          setPendingPayments(userPayments);
        } else {
          setPendingPayments([]);
        }
      });
    };

    if (userId) {
      fetchPendingPayments();
    }
  }, [userId]);

  const handlePayPalPayment = async (payment) => {
    try {
      const orderRes = await axios.post('http://localhost:3000/create-order', { amount: payment.bidAmount });
      const orderID = orderRes.data.id;

      const captureRes = await axios.post('http://localhost:3000/capture-order', { orderID });
      if (captureRes.data.capture) {
        Alert.alert('Payment Success', 'Your payment was successful!');
        const bidRef = ref(database, `bids/${payment.productId}/${payment.bidId}`);
        await update(bidRef, { paymentStatus: 'completed' });
      } else {
        Alert.alert('Payment Error', 'There was an error processing your payment.');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Payment Error', 'There was an error processing your payment.');
    }
  };

  return (
    <View>
      <Text>Pending Payments</Text>
      <FlatList
        data={pendingPayments}
        renderItem={({ item }) => (
          <View>
            <Text>Bid Amount: ksh {item.bidAmount}</Text>
            <Button title="Pay with PayPal" onPress={() => handlePayPalPayment(item)} />
          </View>
        )}
        keyExtractor={(item) => item.bidId}
      />
    </View>
  );
};

export default PendingPaymentsScreen;
