import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getTextAlign } from '../utils/format';

export default function ToastBanner({ visible, message }) {
  const insets = useSafeAreaInsets();
  const { isRTL } = useLocalization();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -14,
        duration: 220,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, translateY, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top: insets.top + 10,
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      <View style={styles.toast}>
        <Text style={[styles.message, { textAlign: getTextAlign(isRTL) }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100
  },
  toast: {
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.card
  },
  message: {
    color: '#fff',
    fontSize: typography.bodySm,
    fontWeight: '800'
  }
});
