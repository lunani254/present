import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { auth, database } from '../firebase';
import { ref, onValue, get } from 'firebase/database';
import COLORS from '../constants/colors';

const YourBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      const userBidsRef = ref(database, `bids/${user.uid}`);

      const fetchBids = () => {
        onValue(userBidsRef, async (snapshot) => {
          const bidsData = [];
          const promises = [];

          snapshot.forEach((childSnapshot) => {
            const bidData = childSnapshot.val();
            if (!bidData) {return;}

            const adRef = ref(database, `ads/${bidData.productId}`);
            promises.push(
              get(adRef).then((adSnapshot) => {
                const adData = adSnapshot.val();
                if (adData && adData.minimumBidPrice !== undefined && adData.productName) {
                  bidsData.push({
                    ...bidData,
                    highestBid: adData.minimumBidPrice,
                    productName: adData.productName,
                  });
                }
              }).catch((error) => {
                console.error(`Error fetching ad data for productId ${bidData.productId}: `, error);
              })
            );
          });

          await Promise.all(promises);
          const sortedBids = bidsData.sort((a, b) => b.bidAmount - a.bidAmount);
          const userBids = sortedBids.filter(bid => bid.userId === user.uid);

          setBids(userBids);
          setLoading(false);
        });
      };

      fetchBids();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bids.length === 0 ? (
        <Text style={styles.noBidsText}>You have no current bids</Text>
      ) : (
        <FlatList
          data={bids}
          keyExtractor={(item) => item.productId}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.productName}</Text>
              <Text>Your Bid: {item.bidAmount}</Text>
              <Text>Highest Bid: {item.highestBid}</Text>
              <Text>
                {index === 0 ? 'You are the highest bidder!' : `Your rank: ${index + 1}`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBidsText: {
    textAlign: 'center',
    fontSize: 18,
    color: COLORS.primary,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
});

export default YourBids;
