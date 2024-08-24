import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set, get, update } from 'firebase/database';
import COLORS from '../constants/colors';

const PlaceBidScreen = ({ route }) => {
  const { productId, productName, minimumBidPrice, originalAdCreatorId } = route.params;
  const navigation = useNavigation();
  const [bidAmount, setBidAmount] = useState(minimumBidPrice);
  const [ws, setWs] = useState(null);

  const handleConfirmBid = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const { uid, email } = user;
      const database = getDatabase();
      const bidRef = ref(database, `bids/${productId}`);
      const newBidRef = push(bidRef);
      await set(newBidRef, {
        userId: uid,
        userEmail: email,
        productId: productId,
        productName: productName,
        bidAmount: bidAmount,
        bidTime: new Date().toISOString(),
      });

      // Update the number of bidders in the Firebase database
      const productRef = ref(database, `ads/${productId}`);
      const productSnapshot = await get(productRef);
      const productData = productSnapshot.val();
      const currentBidders = productData.numberOfBidders || 0;
      await update(productRef, {
        numberOfBidders: currentBidders + 1,
      });

      // Send bid information to WebSocket server
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'placeBid',
          originalAdCreatorId,
          bidAmount,
          productName,
          bidderEmail: email,
        }));
      }

      Alert.alert('Bid Placed', 'Your bid has been placed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'You need to be logged in to place a bid.');
    }
  };

  const handleIncreaseBid = () => {
    setBidAmount((prevBid) => prevBid + 1);
  };

  const handleDecreaseBid = () => {
    if (bidAmount > minimumBidPrice) {
      setBidAmount((prevBid) => prevBid - 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.bidContainer}>
        <Text style={styles.productName}>{productName}</Text>
        <Text style={styles.currentBid}>Current Bid: Ksh {minimumBidPrice}</Text>
        <View style={styles.bidInputContainer}>
          <TouchableOpacity onPress={handleDecreaseBid} style={styles.bidButton}>
            <Text style={styles.bidButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.bidInput}
            value={String(bidAmount)}
            keyboardType="numeric"
            onChangeText={(text) => setBidAmount(Number(text))}
          />
          <TouchableOpacity onPress={handleIncreaseBid} style={styles.bidButton}>
            <Text style={styles.bidButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBid}>
          <Text style={styles.confirmButtonText}>Confirm Bid</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
  },
  backButtonText: {
    color: 'white',
  },
  bidContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  currentBid: {
    fontSize: 20,
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  bidInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bidButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bidInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    textAlign: 'center',
    fontSize: 20,
    paddingHorizontal: 20,
    width: 100,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PlaceBidScreen;
