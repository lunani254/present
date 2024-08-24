import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal, Alert, Button } from 'react-native';
import { getDatabase, ref as dbRef, get, update } from 'firebase/database';

const ViewYourProductProgressScreen = ({ route }) => {
  const { productId } = route.params;
  const [productDetails, setProductDetails] = useState(null);
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBidder, setSelectedBidder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const db = getDatabase();

        // Fetch product details
        const productRef = dbRef(db, `ads/${productId}`);
        const productSnapshot = await get(productRef);

        if (productSnapshot.exists()) {
          const productData = productSnapshot.val();
          setProductDetails(productData);

          // Fetch bidders for the product
          const biddersRef = dbRef(db, `bids/${productId}`);
          const biddersSnapshot = await get(biddersRef);

          if (biddersSnapshot.exists()) {
            const biddersData = biddersSnapshot.val();
            const biddersArray = Object.keys(biddersData).map((key, index) => ({
              id: key,
              bidAmount: biddersData[key].bidAmount,
              bidTime: biddersData[key].bidTime,
              userId: biddersData[key].userId,
              userEmail: biddersData[key].userEmail,
              status: biddersData[key].status || 'pending', // Fetch status or default to 'pending'
              name: `Bidder ${index + 1}`,
            }));
            setBidders(biddersArray);
          } else {
            console.log('No bidders found for this product');
          }
        } else {
          console.log('No product details available');
        }
      } catch (error) {
        console.error('Error fetching product details and bidders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleBidderPress = (bidder) => {
    setSelectedBidder(bidder);
    setModalVisible(true);
  };

  const updateBidStatus = async (status) => {
    try {
      const db = getDatabase();
      const bidRef = dbRef(db, `bids/${productId}/${selectedBidder.id}`);

      // Update the selected bidder's status
      await update(bidRef, { status });

      // Update other bidders to 'rejected'
      const otherBidders = bidders.filter(bidder => bidder.id !== selectedBidder.id);
      for (let bidder of otherBidders) {
        const otherBidRef = dbRef(db, `bids/${productId}/${bidder.id}`);
        await update(otherBidRef, { status: 'rejected' });
      }

      Alert.alert(`Bid ${status.charAt(0).toUpperCase() + status.slice(1)}`, `You have ${status} the bid from ${selectedBidder.name}`);
      
      // Update local state to reflect the changes
      setBidders(prevBidders => 
        prevBidders.map(bidder => 
          bidder.id === selectedBidder.id 
            ? { ...bidder, status } 
            : { ...bidder, status: 'rejected' }
        )
      );
    } catch (error) {
      console.error('Error updating bid status:', error);
    } finally {
      setModalVisible(false);
    }
  };

  const handleAcceptBid = () => {
    updateBidStatus('accepted');
  };

  const handleDeclineBid = () => {
    updateBidStatus('rejected');
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!productDetails) {
    return <Text>No product details found</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.productCard}>
        <Image source={{ uri: productDetails.imageUrls[0] }} style={styles.productImage} />
        <Text style={styles.productTitle}>{productDetails.productName}</Text>
        <Text style={styles.productDescription}>{productDetails.productDescription}</Text>
        <Text style={styles.productLocation}>Location: {productDetails.location}</Text>
        <Text style={styles.productBid}>Minimum Bid: {productDetails.minimumBidPrice}</Text>
      </View>
      <FlatList
        data={bidders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleBidderPress(item)}>
            <View style={[styles.bidderItem, item.status === 'accepted' ? styles.acceptedBidder : (item.status === 'rejected' ? styles.rejectedBidder : {})]}>
              <Text>{item.name}</Text>
              <Text>Bid Amount: {item.bidAmount}</Text>
              <Text>Bid Time: {new Date(item.bidTime).toLocaleString()}</Text>
              <Text>Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Do you want to accept or decline the bid from {selectedBidder?.name}?</Text>
          <View style={styles.modalButtonContainer}>
            <Button title="Accept" onPress={handleAcceptBid} />
            <Button title="Decline" onPress={handleDeclineBid} />
          </View>
          <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  productLocation: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  productBid: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  bidderItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  acceptedBidder: {
    backgroundColor: '#d4edda',
  },
  rejectedBidder: {
    backgroundColor: '#f8d7da',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
});

export default ViewYourProductProgressScreen;
