import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

const Button = ({ title, onPress, filled = false, color, style }) => {
  const filledBgColor = color || COLORS.primary;
  const outlinedColor = COLORS.white;
  const bgColor = filled ? filledBgColor : outlinedColor;
  const textColor = filled ? COLORS.white : COLORS.primary;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor }, style]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingBottom: 16,
    paddingVertical: 10,
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
});

export default Button;
