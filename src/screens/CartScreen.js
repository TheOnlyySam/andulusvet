import React, { useContext, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { buildWhatsappOrderMessage } from '../services/orderService';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatCurrency, getRowDirection, getTextAlign, pickLocalizedText } from '../utils/format';

const WHATSAPP_PHONE = '9647801730506';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { language, isRTL, t } = useLocalization();
  const { cart, cartSummary, changeQty, removeFromCart, clearCart } = useContext(AppContext);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber1, setPhoneNumber1] = useState('');
  const [phoneNumber2, setPhoneNumber2] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [district, setDistrict] = useState('');
  const [closestLandmark, setClosestLandmark] = useState('');
  const [placeOfResidence, setPlaceOfResidence] = useState('');
  const footerOffset = insets.bottom + 102;

  const reserveOrder = async () => {
    if (!cart.length) {
      Alert.alert(t('alerts.emptyCart'), t('cart.emptyMessage'));
      return;
    }

    if (!customerName.trim() || !phoneNumber1.trim() || !governorate.trim() || !district.trim() || !closestLandmark.trim() || !placeOfResidence.trim()) {
      Alert.alert(t('alerts.missingData'), t('cart.missingCheckout'));
      return;
    }

    const payload = buildWhatsappOrderMessage({
      language,
      t,
      summary: cartSummary,
      cartItems: cart.map((item) => ({
        ...item,
        displayName: pickLocalizedText(item.name, language)
      })),
      checkoutDraft: {
        customerName: customerName.trim(),
        phoneNumber1: phoneNumber1.trim(),
        phoneNumber2: phoneNumber2.trim(),
        governorate: governorate.trim(),
        district: district.trim(),
        closestLandmark: closestLandmark.trim(),
        placeOfResidence: placeOfResidence.trim()
      }
    });

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(payload)}`;
    const supported = await Linking.canOpenURL(whatsappUrl);
    if (!supported) {
      Alert.alert(t('alerts.error'), t('alerts.whatsappUnavailable'));
      return;
    }

    await Linking.openURL(whatsappUrl);
    Alert.alert(t('alerts.success'), t('alerts.orderOpened'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('cart.title')} subtitle={t('cart.subtitle')} />

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl, paddingTop: 2 }} showsVerticalScrollIndicator={false}>
        {!cart.length ? <Text style={styles.empty}>{t('cart.empty')}</Text> : null}

        {cart.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={[styles.name, { textAlign: getTextAlign(isRTL) }]}>
              {pickLocalizedText(item.name, language)}
            </Text>
            <Text style={[styles.price, { textAlign: getTextAlign(isRTL) }]}>
              {formatCurrency(item.price, language)}
            </Text>

            <View style={[styles.qtyRow, { flexDirection: getRowDirection(isRTL) }]}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, 1)}>
                <Text style={styles.qtyTxt}>+</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>
                {t('cart.quantity')}: {item.qty}
              </Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, -1)}>
                <Text style={styles.qtyTxt}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                <Text style={styles.removeTxt}>{t('common.remove')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.summaryCard}>
          <Text style={[styles.formTitle, { textAlign: getTextAlign(isRTL) }]}>{t('cart.orderInfo')}</Text>
          <View style={[styles.summaryRow, { flexDirection: getRowDirection(isRTL) }]}>
            <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cartSummary.subtotal, language)}</Text>
          </View>
          <View style={[styles.summaryRow, { flexDirection: getRowDirection(isRTL) }]}>
            <Text style={styles.summaryLabel}>{t('cart.discount')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cartSummary.discountAmount, language)}</Text>
          </View>
          <Text style={[styles.discountHint, { textAlign: getTextAlign(isRTL) }]}>{t('cart.over50Discount')}</Text>
          <View style={[styles.summaryRow, { flexDirection: getRowDirection(isRTL) }]}>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>{formatCurrency(cartSummary.total, language)}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={[styles.formTitle, { textAlign: getTextAlign(isRTL) }]}>{t('cart.orderInfo')}</Text>

          <FormField
            label={t('cart.receiverName')}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full name'}
          />
          <FormField
            label={t('cart.phone1')}
            value={phoneNumber1}
            onChangeText={setPhoneNumber1}
            placeholder="07xx xxx xxxx"
            keyboardType="phone-pad"
          />
          <FormField
            label={t('cart.phone2')}
            value={phoneNumber2}
            onChangeText={setPhoneNumber2}
            placeholder="07xx xxx xxxx"
            keyboardType="phone-pad"
          />

          <FormField
            label={t('cart.governorate')}
            value={governorate}
            onChangeText={setGovernorate}
            placeholder={language === 'ar' ? 'مثال: بغداد' : 'Example: Baghdad'}
          />
          <FormField
            label={t('cart.district')}
            value={district}
            onChangeText={setDistrict}
            placeholder={language === 'ar' ? 'مثال: الكرادة' : 'Example: Karrada'}
          />

          <FormField
            label={t('cart.closestLandmark')}
            value={closestLandmark}
            onChangeText={setClosestLandmark}
            placeholder={language === 'ar' ? 'مثال: قرب مستشفى اليرموك' : 'Example: Near Yarmouk Hospital'}
          />
          <FormField
            label={t('cart.placeOfResidence')}
            value={placeOfResidence}
            onChangeText={setPlaceOfResidence}
            placeholder={language === 'ar' ? 'المنطقة أو الحي' : 'Area or neighborhood'}
          />
        </View>
        <View style={[styles.footer, { marginBottom: footerOffset }]}>
          <Text style={[styles.footerTitle, { textAlign: getTextAlign(isRTL) }]}>{t('cart.readyTitle')}</Text>
          <Text style={[styles.footerSubtitle, { textAlign: getTextAlign(isRTL) }]}>{t('cart.readySubtitle')}</Text>
          <TouchableOpacity style={styles.reserveBtn} onPress={reserveOrder}>
            <Text style={styles.reserveTxt}>{t('cart.sendWhatsapp')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearTxt}>{t('cart.clearCart')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md
  },
  empty: {
    textAlign: 'center',
    color: colors.textSoft,
    marginTop: 40,
    fontSize: typography.body
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#fff',
    ...shadows.soft
  },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: typography.body
  },
  price: {
    color: colors.secondary,
    marginTop: 6,
    fontWeight: '900'
  },
  qtyRow: {
    marginTop: spacing.md,
    alignItems: 'center'
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
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
    fontWeight: '700',
    fontSize: typography.bodySm
  },
  removeBtn: {
    marginHorizontal: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FDEDEC',
    borderRadius: radius.md
  },
  removeTxt: {
    color: colors.danger,
    fontWeight: '700'
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: '#fff',
    ...shadows.soft
  },
  formCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: '#fff',
    ...shadows.soft
  },
  formTitle: {
    color: colors.secondary,
    fontWeight: '900',
    fontSize: typography.h3,
    marginBottom: spacing.md
  },
  summaryRow: {
    justifyContent: 'space-between',
    marginBottom: 8
  },
  summaryLabel: {
    color: colors.textSoft,
    fontSize: typography.bodySm
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '800'
  },
  discountHint: {
    color: colors.primaryDeep,
    fontSize: typography.caption,
    marginVertical: spacing.sm
  },
  totalLabel: {
    color: colors.secondary,
    fontSize: typography.label,
    fontWeight: '900'
  },
  totalValue: {
    color: colors.secondary,
    fontSize: typography.label,
    fontWeight: '900'
  },
  footer: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card
  },
  footerTitle: {
    color: colors.secondary,
    fontSize: typography.h3,
    fontWeight: '900'
  },
  footerSubtitle: {
    color: colors.textSoft,
    fontSize: typography.bodySm,
    marginTop: 6,
    marginBottom: spacing.md,
    lineHeight: 20
  },
  reserveBtn: {
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    alignItems: 'center'
  },
  reserveTxt: {
    color: '#fff',
    fontWeight: '900',
    fontSize: typography.body
  },
  clearTxt: {
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '700'
  }
});
