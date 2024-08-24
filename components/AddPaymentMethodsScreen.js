import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import COLORS from '../constants/colors';

const AddPaymentMethodsScreen = () => {
  const { confirmPayment } = useStripe();
  const [cardDetails, setCardDetails] = useState(null);

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      alert("Please enter complete card details.");
      return;
    }

    try {
      // Replace with your Heroku backend URL that creates the payment intent
      const response = await fetch('https://your-heroku-server.com/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 1000 }), // Amount in cents
      });

      const { clientSecret } = await response.json();

      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        type: 'Card',
        billingDetails: { /* Add billing details if required */ },
      });

      if (error) {
        alert(`Payment confirmation error: ${error.message}`);
      } else if (paymentIntent) {
        alert('Payment successful');
      }
    } catch (e) {
      alert(`Payment failed: ${e.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Payment Method</Text>
      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={(cardDetails) => setCardDetails(cardDetails)}
      />
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Add Payment Method</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  cardContainer: {
    height: 50,
    width: '100%',
    marginVertical: 30,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddPaymentMethodsScreen;
