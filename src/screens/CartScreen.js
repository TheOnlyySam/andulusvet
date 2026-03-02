import React, { useContext } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import { colors } from '../theme/colors';

const RESERVATION_EMAIL = 'salamadil1233@gmail.com';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, changeQty, removeFromCart, clearCart } = useContext(AppContext);

  const reserveOrder = async () => {
    if (!cart.length) {
      Alert.alert('السلة فارغة', 'أضف منتجات قبل تأكيد الحجز.');
      return;
    }

    const lines = cart.map(
      (item) => `- ${item.name} | الكمية: ${item.qty} | السعر: ${item.price.toLocaleString('ar-IQ')} د.ع`
    );

    const body = [
      'طلب حجز جديد (الدفع عند الاستلام)',
      '',
      ...lines,
      '',
      `المجموع: ${cartTotal.toLocaleString('ar-IQ')} د.ع`
    ].join('\n');

    const mailto = `mailto:${RESERVATION_EMAIL}?subject=${encodeURIComponent('حجز طلب جديد من التطبيق')}&body=${encodeURIComponent(body)}`;

    const supported = await Linking.canOpenURL(mailto);
    if (!supported) {
      Alert.alert('تعذر فتح البريد', 'يرجى إعداد تطبيق بريد على الهاتف.');
      return;
    }

    await Linking.openURL(mailto);
    Alert.alert('تم تجهيز الرسالة', 'تم فتح البريد لإرسال طلب الحجز.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>السلة</Text>
      <Text style={styles.subtitle}>جميع الطلبات: دفع عند الاستلام فقط</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 180, paddingTop: 12 }}>
        {!cart.length && <Text style={styles.empty}>لا توجد منتجات في السلة.</Text>}

        {cart.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price.toLocaleString('ar-IQ')} د.ع</Text>

            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, 1)}>
                <Text style={styles.qtyTxt}>+</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>الكمية: {item.qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, -1)}>
                <Text style={styles.qtyTxt}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                <Text style={styles.removeTxt}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { bottom: insets.bottom + 10 }]}>
        <Text style={styles.total}>المجموع: {cartTotal.toLocaleString('ar-IQ')} د.ع</Text>
        <TouchableOpacity style={styles.reserveBtn} onPress={reserveOrder}>
          <Text style={styles.reserveTxt}>تأكيد الحجز</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearTxt}>تفريغ السلة</Text>
        </TouchableOpacity>
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
  subtitle: {
    marginTop: 4,
    color: colors.muted,
    textAlign: 'right'
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 40
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  name: {
    textAlign: 'right',
    color: colors.text,
    fontWeight: '800'
  },
  price: {
    textAlign: 'right',
    color: colors.secondary,
    marginTop: 6
  },
  qtyRow: {
    marginTop: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center'
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyTxt: {
    color: colors.secondary,
    fontWeight: '900',
    fontSize: 18
  },
  qtyValue: {
    marginHorizontal: 10,
    color: colors.text,
    fontWeight: '700'
  },
  removeBtn: {
    marginRight: 'auto',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffe9e9',
    borderRadius: 10
  },
  removeTxt: {
    color: '#ba2222',
    fontWeight: '700'
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12
  },
  total: {
    textAlign: 'right',
    color: colors.secondary,
    fontWeight: '900'
  },
  reserveBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12
  },
  reserveTxt: {
    color: colors.secondary,
    fontWeight: '900'
  },
  clearTxt: {
    marginTop: 8,
    textAlign: 'center',
    color: '#a73535',
    fontWeight: '700'
  }
});
