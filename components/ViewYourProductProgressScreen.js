import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebase';
import COLORS from '../constants/colors';
import Modal from 'react-native-modal';

const ViewYourProductProgressScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [productDetails, setProductDetails] = useState(null);
  const [bids, setBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (!productId) {
      console.error('Product ID is missing from route params');
      return;
    }

    const fetchProductDetails = () => {
      const productRef = ref(database, `ads/${productId}`);
      onValue(productRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setProductDetails(data);
        } else {
          setProductDetails({
            productName: 'Product not found',
            location: 'N/A',
            productDescription: 'N/A',
            minimumBidPrice: 0,
            numberOfBidders: 0,
            imageUrls: [],
          });
        }
      });
    };

    const fetchBids = () => {
      const bidsRef = ref(database, `bids/${productId}`);
      onValue(bidsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const allBids = [];
          Object.keys(data).forEach(bidId => {
            const bidData = data[bidId];
            allBids.push({ id: bidId, ...bidData });
          });
          allBids.sort((a, b) => b.bidAmount - a.bidAmount);
          setBids(allBids);
        } else {
          setBids([]);
        }
      });
    };

    fetchProductDetails();
    fetchBids();
  }, [productId]);

  const handleBidPress = (bid) => {
    setSelectedBid(bid);
    setIsModalVisible(true);
  };

  const handleAcceptBid = async () => {
    try {
      if (selectedBid) {
        const bidRef = ref(database, `bids/${productId}/${selectedBid.id}`);
        await update(bidRef, { status: 'accepted' });

        Alert.alert('Accept Bid', `Bid for ksh ${selectedBid.bidAmount} accepted.`);
      }
    } catch (error) {
      console.error('Error updating bid status:', error);
    }
    setIsModalVisible(false);
  };

  const handleRejectBid = async () => {
    try {
      if (selectedBid) {
        const bidRef = ref(database, `bids/${productId}/${selectedBid.id}`);
        await update(bidRef, { status: 'rejected' });

        Alert.alert('Reject Bid', `Bid for ksh ${selectedBid.bidAmount} rejected.`);
      }
    } catch (error) {
      console.error('Error updating bid status:', error);
    }
    setIsModalVisible(false);
  };

  if (!productDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Here is your ad progress, keep posting your ads and earn with us!</Text>
      <View style={styles.productCard}>
        {productDetails.imageUrls && productDetails.imageUrls[0] && (
          <Image source={{ uri: productDetails.imageUrls[0] }} style={styles.productImage} />
        )}
        <Text style={styles.productName}>{productDetails.productName}</Text>
        <Text style={styles.productLocation}>
          <FontAwesome name="map-marker" size={16} color={COLORS.primary} /> {productDetails.location}
        </Text>
        <Text style={styles.productDescription}>{productDetails.productDescription}</Text>
        <Text style={styles.productPrice}>Minimum Bid Price: ksh {productDetails.minimumBidPrice}</Text>
        <Text style={styles.numberOfBidders}>Number of Bidders: {bids.length}</Text>
      </View>

      {bids.length === 0 ? (
        <Text style={styles.noBiddersText}>No bidders</Text>
      ) : (
        <FlatList
          data={bids}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => handleBidPress(item)}>
              <View style={styles.bidCard}>
                <Text style={styles.bidderName}>{`${index + 1} Bidder`}</Text>
                <Text style={styles.bidPrice}>Bid Price: ksh {item.bidAmount}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bidsList}
        />
      )}

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Bid Action</Text>
          {selectedBid && (
            <>
              <Text style={styles.modalText}>Bid Price: ksh {selectedBid.bidAmount}</Text>
              <Pressable style={[styles.button, { backgroundColor: COLORS.primary }]} onPress={handleAcceptBid}>
                <Text style={styles.buttonText}>Accept Bid</Text>
              </Pressable>
              <Pressable style={[styles.button, { backgroundColor: COLORS.primary }]} onPress={handleRejectBid}>
                <Text style={styles.buttonText}>Reject Bid</Text>
              </Pressable>
              <Pressable style={[styles.button, { backgroundColor: COLORS.primary }]} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productLocation: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  numberOfBidders: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  bidsList: {
    width: '100%',
  },
  bidCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 3,
    justifyContent: 'space-between',
  },
  bidderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bidPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  noBiddersText: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ViewYourProductProgressScreen;
