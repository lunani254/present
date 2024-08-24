import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import Button from '../components/Button';
import COLORS from '../constants/colors';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';

const Signup = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleSignup = async () => {
    if (!isChecked) {
      Alert.alert("Terms and Conditions", "You must agree to the terms and conditions to sign up.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Signup Successful", "You have successfully signed up!");
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    }
  };

  return (
    <LinearGradient style={styles.container} colors={[COLORS.secondary, COLORS.primary]}>
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}> Connect and bid today!</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>First name</Text>
            <View style={styles.inputBox}>
              <TextInput
                placeholder='Enter your first name'
                placeholderTextColor={COLORS.black}
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputBox}>
              <TextInput
                placeholder='Enter your email address'
                placeholderTextColor={COLORS.black}
                keyboardType='email-address'
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                placeholder='Enter your password'
                placeholderTextColor={COLORS.black}
                secureTextEntry={!isPasswordShown}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordShown(!isPasswordShown)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={isPasswordShown ? "eye-off" : "eye"}
                  size={24}
                  color={COLORS.black}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              style={styles.checkbox}
              value={isChecked}
              onValueChange={setIsChecked}
              color={isChecked ? COLORS.primary : undefined}
            />
            <Text>I agree to the terms and conditions</Text>
          </View>

          <Button
            title="Sign Up"
            filled
            style={styles.signupButton}
            onPress={handleSignup}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or Sign up with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Already have an account?</Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.registerLink}>Log In</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    header: {
        marginVertical: 10,
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 15,
        color: COLORS.grey,
    },
    inputContainer: {
        marginVertical: 10,
    },
    label: {
        marginBottom: 5,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: COLORS.white,
        paddingHorizontal: 10,
        paddingVertical: 8,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
    },
    eyeIcon: {
        marginLeft: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    checkboxLabel: {
        marginLeft: 8,
        color: COLORS.grey,
    },
    signupButton: {
        marginVertical: 20,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.grey,
    },
    dividerText: {
        marginHorizontal: 10,
        color: COLORS.grey,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 10,
        elevation: 2,
        marginHorizontal: 4,
    },
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 20,
    },
    registerText: {
        color: COLORS.grey,
    },
    registerLink: {
        color: COLORS.primary,
        marginLeft: 5,
    },
});

export default Signup;