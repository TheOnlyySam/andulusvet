import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>حسابي</Text>

      <View style={styles.card}>
        <Text style={styles.line}>الاسم: مستخدم تجريبي</Text>
        <Text style={styles.line}>الهاتف: 07xx xxx xxxx</Text>
        <Text style={styles.line}>المدينة: بغداد</Text>
        <Text style={styles.hint}>هذه بيانات تجريبية مؤقتا لحين ربط قاعدة البيانات.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.secondary,
    textAlign: 'right',
    marginTop: 4
  },
  card: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    padding: 16
  },
  line: {
    textAlign: 'right',
    color: colors.text,
    marginBottom: 10,
    fontWeight: '700'
  },
  hint: {
    marginTop: 8,
    textAlign: 'right',
    color: colors.muted
  }
});
