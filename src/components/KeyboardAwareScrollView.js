import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView as NativeKeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function KeyboardAwareScrollView({ contentContainerStyle, style, ...props }) {
  return (
    <NativeKeyboardAwareScrollView
      {...props}
      style={[styles.scroll, style]}
      enableOnAndroid
      extraHeight={Platform.OS === 'android' ? 110 : 80}
      extraScrollHeight={24}
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    />
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1
  },
  content: {
    flexGrow: 1
  }
});
