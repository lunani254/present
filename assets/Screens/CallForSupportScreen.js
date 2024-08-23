import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/colors';

const CallForSupportScreen = () => {
  const navigation = useNavigation();

  const handlePhonePress = () => {
    Linking.openURL('tel:+254768016771');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:lunanivictor06@gmail.com');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.contactContainer}>
        <Text style={styles.header}>Contact Support</Text>
        <TouchableOpacity onPress={handlePhonePress}>
          <Text style={styles.contactText}>Call: +254768016771</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.contactText}>Email: lunanivictor06@gmail.com</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  contactContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contactText: {
    fontSize: 18,
    color: COLORS.primary,
    marginVertical: 10,
    textDecorationLine: 'none',
  },
});

export default CallForSupportScreen;
