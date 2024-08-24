import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getDatabase, ref as dbRef, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/colors';

const YourBidsScreen = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBids = async () => {
      const user = auth.currentUser;

      if (!user) {
        console.log('No user is currently authenticated');
        setLoading(false);
        return;
      }

      try {
        const db = getDatabase();
        const bidsRef = dbRef(db, 'bids/');
        const snapshot = await get(bidsRef);

        if (snapshot.exists()) {
          const bidsData = snapshot.val();
          const userBids = [];

          Object.keys(bidsData).forEach(productId => {
            Object.keys(bidsData[productId]).forEach(bidId => {
              const bid = bidsData[productId][bidId];
              if (bid.userId === user.uid) {
                userBids.push({
                  id: bidId,
                  productId,
                  ...bid,
                });
              }
            });
          });

          setBids(userBids);
        } else {
          console.log('No bids found for this user');
        }
      } catch (error) {
        console.error('Error fetching bids:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  const handleAcceptedBidPress = (bid) => {
    const deposit = bid.bidAmount * 0.1;

    Alert.alert(
      "Confirm Your Bid",
      `Are you sure you want to proceed with this bid? A deposit of 10% (${deposit} units) will be required. Please note that this amount is refundable, but it will be held until you confirm the product. Make sure to inspect the product in person.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Proceed",
          onPress: () => {
            // Navigate to a screen where the payment simulation will occur
            navigation.navigate('PaymentSimulationScreen', { bid, deposit });
          }
        }
      ]
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!bids.length) {
    return <Text>No bids found.</Text>;
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
        return styles.acceptedBid;
      case 'rejected':
        return styles.rejectedBid;
      default:
        return styles.pendingBid;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bids}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.bidItem, getStatusStyle(item.status)]}
            onPress={() => item.status === 'accepted' ? handleAcceptedBidPress(item) : null}
          >
            <View style={styles.bidDetails}>
              <Text style={styles.bidTitle}>{item.productName}</Text>
              <Text>Bid Amount: {item.bidAmount}</Text>
              <Text>Status: {item.status || 'Pending'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  bidItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',  // Shadow color
    shadowOffset: { width: 0, height: 2 },  // Shadow offset (x, y)
    shadowOpacity: 0.2,  // Shadow opacity
    shadowRadius: 4,  // Shadow radius
    elevation: 5,  // Elevation (for Android shadow)
  },
  bidDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bidTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  acceptedBid: {
    backgroundColor: '#d4edda', // Light green background
    borderColor: '#28a745', // Darker green border
    borderWidth: 1,
  },
  rejectedBid: {
    backgroundColor: '#f8d7da', // Light red/pink background
    borderColor: '#dc3545', // Darker red border
    borderWidth: 1,
  },
  pendingBid: {
    backgroundColor: '#fff3cd', // Light yellow background
    borderColor: '#ffc107', // Darker yellow border
    borderWidth: 1,
  },
});

export default YourBidsScreen;
