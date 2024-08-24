import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ref as dbRef, get } from 'firebase/database';
import { auth, database } from '../firebase';

const YourBidsScreen = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const bidsRef = dbRef(database, 'bids/');
          const snapshot = await get(bidsRef);

          if (snapshot.exists()) {
            const bidsData = snapshot.val();
            const userBidsArray = [];

            Object.keys(bidsData).forEach(productId => {
              const productBids = bidsData[productId];
              Object.keys(productBids).forEach(bidId => {
                const bid = productBids[bidId];
                if (bid.userId === currentUser.uid) {
                  userBidsArray.push({
                    id: bidId,
                    productId,
                    ...bid,
                  });
                }
              });
            });

            if (userBidsArray.length > 0) {
              setBids(userBidsArray);
            } else {
              console.log('No bids found for this user');
            }
          } else {
            console.log('No bids available in the database');
          }
        } else {
          console.log('No user is currently authenticated');
        }
      } catch (error) {
        console.error('Error fetching user bids:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bids}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bidItem}
            onPress={() => navigation.navigate('ProductDetailsScreen', { productId: item.productId })}
          >
            <View style={styles.bidDetails}>
              <Text style={styles.bidTitle}>{item.productName}</Text>
              <Text>Bid Amount: {item.bidAmount}</Text>
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
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
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
});

export default YourBidsScreen;
