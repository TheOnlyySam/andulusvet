import React, { useContext, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import { colors } from '../theme/colors';

const WHATSAPP_PHONE = '9647801730506';

const IRAQ_GOVERNORATES = [
  'بغداد',
  'البصرة',
  'نينوى',
  'أربيل',
  'النجف',
  'كربلاء',
  'السليمانية',
  'ذي قار',
  'بابل',
  'الأنبار',
  'ديالى',
  'صلاح الدين',
  'كركوك',
  'واسط',
  'ميسان',
  'المثنى',
  'القادسية',
  'دهوك'
];

const BAGHDAD_DISTRICTS = [
  'الكرادة',
  'المنصور',
  'العامرية',
  'الكاظمية',
  'الأعظمية',
  'الصدر',
  'زيونة',
  'الدورة',
  'الجادرية',
  'الغدير',
  'البلديات',
  'اليوسفية',
  'أبو غريب',
  'الشعلة',
  'البياع'
];

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, changeQty, removeFromCart, clearCart } = useContext(AppContext);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [governorate, setGovernorate] = useState('بغداد');
  const [district, setDistrict] = useState('');
  const [showGovernorates, setShowGovernorates] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);

  const isBaghdad = useMemo(() => governorate === 'بغداد', [governorate]);

  const reserveOrder = async () => {
    if (!cart.length) {
      Alert.alert('السلة فارغة', 'أضف منتجات قبل تأكيد الحجز.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      Alert.alert('بيانات ناقصة', 'يرجى إدخال الاسم ورقم الهاتف.');
      return;
    }

    if (isBaghdad && !district) {
      Alert.alert('اختر المنطقة', 'يرجى اختيار قضاء/منطقة داخل بغداد.');
      return;
    }

    const lines = cart.map(
      (item) => `- ${item.name} | الكمية: ${item.qty} | السعر: ${item.price.toLocaleString('ar-IQ')} د.ع`
    );

    const locationLine = isBaghdad ? `${governorate} - ${district}` : governorate;
    const body = [
      'طلب حجز جديد (الدفع عند الاستلام)',
      '',
      `الاسم: ${customerName.trim()}`,
      `الهاتف: ${customerPhone.trim()}`,
      `الموقع: ${locationLine}`,
      '',
      'تفاصيل الطلب:',
      ...lines,
      '',
      `المجموع: ${cartTotal.toLocaleString('ar-IQ')} د.ع`
    ].join('\n');

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(body)}`;
    const supported = await Linking.canOpenURL(whatsappUrl);
    if (!supported) {
      Alert.alert('تعذر الفتح', 'تعذر فتح واتساب على هذا الجهاز.');
      return;
    }

    await Linking.openURL(whatsappUrl);
    Alert.alert('تم', 'تم فتح واتساب لإرسال طلب الحجز.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>السلة</Text>
      <Text style={styles.subtitle}>الدفع عند الاستلام فقط</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 260, paddingTop: 12 }}>
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

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>بيانات الحجز</Text>

          <Text style={styles.label}>اسم المستلم</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="الاسم الكامل"
            placeholderTextColor="#8f99b0"
            textAlign="right"
          />

          <Text style={styles.label}>رقم الهاتف</Text>
          <TextInput
            style={styles.input}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="07xx xxx xxxx"
            placeholderTextColor="#8f99b0"
            keyboardType="phone-pad"
            textAlign="right"
          />

          <Text style={styles.label}>المحافظة</Text>
          <TouchableOpacity style={styles.selectBtn} onPress={() => setShowGovernorates((prev) => !prev)}>
            <Text style={styles.selectTxt}>{governorate}</Text>
          </TouchableOpacity>
          {showGovernorates && (
            <View style={styles.menu}>
              {IRAQ_GOVERNORATES.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[styles.menuItem, governorate === city && styles.menuItemActive]}
                  onPress={() => {
                    setGovernorate(city);
                    setShowGovernorates(false);
                    setDistrict('');
                  }}
                >
                  <Text style={styles.menuTxt}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isBaghdad && (
            <>
              <Text style={styles.label}>القضاء / المنطقة (بغداد)</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setShowDistricts((prev) => !prev)}>
                <Text style={styles.selectTxt}>{district || 'اختر المنطقة'}</Text>
              </TouchableOpacity>
              {showDistricts && (
                <View style={styles.menu}>
                  {BAGHDAD_DISTRICTS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.menuItem, district === d && styles.menuItemActive]}
                      onPress={() => {
                        setDistrict(d);
                        setShowDistricts(false);
                      }}
                    >
                      <Text style={styles.menuTxt}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { bottom: insets.bottom + 10 }]}>
        <Text style={styles.total}>المجموع: {cartTotal.toLocaleString('ar-IQ')} د.ع</Text>
        <TouchableOpacity style={styles.reserveBtn} onPress={reserveOrder}>
          <Text style={styles.reserveTxt}>إرسال الحجز عبر واتساب</Text>
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
  formCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  formTitle: {
    textAlign: 'right',
    color: colors.secondary,
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 10
  },
  label: {
    textAlign: 'right',
    color: colors.secondary,
    marginBottom: 6,
    fontWeight: '800'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: colors.text,
    backgroundColor: '#fff'
  },
  selectBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#fff'
  },
  selectTxt: {
    textAlign: 'right',
    color: colors.text,
    fontWeight: '700'
  },
  menu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden'
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff'
  },
  menuItemActive: {
    backgroundColor: '#e9efff'
  },
  menuTxt: {
    textAlign: 'right',
    color: colors.text,
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
    backgroundColor: '#25D366',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12
  },
  reserveTxt: {
    color: '#fff',
    fontWeight: '900'
  },
  clearTxt: {
    marginTop: 8,
    textAlign: 'center',
    color: '#a73535',
    fontWeight: '700'
  }
});
