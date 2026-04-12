import React, { useContext, useMemo, useState } from 'react';
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

const GOVERNORATE_LABELS = {
  بغداد: { ar: 'بغداد', en: 'Baghdad' },
  البصرة: { ar: 'البصرة', en: 'Basra' },
  نينوى: { ar: 'نينوى', en: 'Nineveh' },
  أربيل: { ar: 'أربيل', en: 'Erbil' },
  النجف: { ar: 'النجف', en: 'Najaf' },
  كربلاء: { ar: 'كربلاء', en: 'Karbala' },
  السليمانية: { ar: 'السليمانية', en: 'Sulaymaniyah' },
  'ذي قار': { ar: 'ذي قار', en: 'Dhi Qar' },
  بابل: { ar: 'بابل', en: 'Babylon' },
  الأنبار: { ar: 'الأنبار', en: 'Anbar' },
  ديالى: { ar: 'ديالى', en: 'Diyala' },
  'صلاح الدين': { ar: 'صلاح الدين', en: 'Salah al-Din' },
  كركوك: { ar: 'كركوك', en: 'Kirkuk' },
  واسط: { ar: 'واسط', en: 'Wasit' },
  ميسان: { ar: 'ميسان', en: 'Maysan' },
  المثنى: { ar: 'المثنى', en: 'Al Muthanna' },
  القادسية: { ar: 'القادسية', en: 'Al Qadisiyyah' },
  دهوك: { ar: 'دهوك', en: 'Duhok' }
};

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

const DISTRICT_LABELS = Object.fromEntries(
  BAGHDAD_DISTRICTS.map((district) => [district, { ar: district, en: district }])
);

function SelectMenu({ items, value, onToggle, open, onSelect, label, language, isRTL }) {
  return (
    <View style={styles.fieldSpacing}>
      <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>{label}</Text>
      <TouchableOpacity style={styles.selectBtn} onPress={onToggle}>
        <Text style={[styles.selectTxt, { textAlign: getTextAlign(isRTL) }]}>
          {pickLocalizedText(value, language)}
        </Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.menu}>
          {items.map((item) => (
            <TouchableOpacity key={item.key} style={styles.menuItem} onPress={() => onSelect(item.key)}>
              <Text style={[styles.menuTxt, { textAlign: getTextAlign(isRTL) }]}>
                {pickLocalizedText(item.label, language)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { language, isRTL, t } = useLocalization();
  const { cart, cartSummary, changeQty, removeFromCart, clearCart } = useContext(AppContext);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber1, setPhoneNumber1] = useState('');
  const [phoneNumber2, setPhoneNumber2] = useState('');
  const [governorate, setGovernorate] = useState('بغداد');
  const [district, setDistrict] = useState('');
  const [closestLandmark, setClosestLandmark] = useState('');
  const [placeOfResidence, setPlaceOfResidence] = useState('');
  const [showGovernorates, setShowGovernorates] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);

  const isBaghdad = useMemo(() => governorate === 'بغداد', [governorate]);

  const reserveOrder = async () => {
    if (!cart.length) {
      Alert.alert(t('alerts.emptyCart'), t('cart.emptyMessage'));
      return;
    }

    if (!customerName.trim() || !phoneNumber1.trim() || !closestLandmark.trim() || !placeOfResidence.trim()) {
      Alert.alert(t('alerts.missingData'), t('cart.missingCheckout'));
      return;
    }

    if (isBaghdad && !district) {
      Alert.alert(t('alerts.missingData'), t('cart.districtRequired'));
      return;
    }

    const payload = buildWhatsappOrderMessage({
      language,
      t,
      cartItems: cart.map((item) => ({
        ...item,
        displayName: pickLocalizedText(item.name, language)
      })),
      checkoutDraft: {
        customerName: customerName.trim(),
        phoneNumber1: phoneNumber1.trim(),
        phoneNumber2: phoneNumber2.trim(),
        governorate: pickLocalizedText(GOVERNORATE_LABELS[governorate], language),
        district: district ? pickLocalizedText(DISTRICT_LABELS[district], language) : '',
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

      <ScrollView contentContainerStyle={{ paddingBottom: 310, paddingTop: 2 }} showsVerticalScrollIndicator={false}>
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

          <SelectMenu
            items={IRAQ_GOVERNORATES.map((item) => ({ key: item, label: GOVERNORATE_LABELS[item] }))}
            value={GOVERNORATE_LABELS[governorate]}
            onToggle={() => setShowGovernorates((prev) => !prev)}
            open={showGovernorates}
            onSelect={(nextValue) => {
              setGovernorate(nextValue);
              setShowGovernorates(false);
              setDistrict('');
            }}
            label={t('cart.governorate')}
            language={language}
            isRTL={isRTL}
          />

          {isBaghdad ? (
            <SelectMenu
              items={BAGHDAD_DISTRICTS.map((item) => ({ key: item, label: DISTRICT_LABELS[item] }))}
              value={district ? DISTRICT_LABELS[district] : { ar: t('cart.selectArea'), en: t('cart.selectArea') }}
              onToggle={() => setShowDistricts((prev) => !prev)}
              open={showDistricts}
              onSelect={(nextValue) => {
                setDistrict(nextValue);
                setShowDistricts(false);
              }}
              label={`${t('cart.district')} ${language === 'ar' ? `(${t('cart.baghdadOnly')})` : `(${t('cart.baghdadOnly')})`}`}
              language={language}
              isRTL={isRTL}
            />
          ) : null}

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
      </ScrollView>

      <View style={[styles.footer, { bottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.reserveBtn} onPress={reserveOrder}>
          <Text style={styles.reserveTxt}>{t('cart.sendWhatsapp')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearTxt}>{t('cart.clearCart')}</Text>
        </TouchableOpacity>
      </View>
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
  fieldSpacing: {
    marginBottom: spacing.sm
  },
  label: {
    color: colors.secondary,
    marginBottom: 7,
    fontSize: typography.label,
    fontWeight: '800'
  },
  selectBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    backgroundColor: '#fff'
  },
  selectTxt: {
    color: colors.text,
    fontSize: typography.body
  },
  menu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: 6
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff'
  },
  menuTxt: {
    color: colors.text,
    fontWeight: '700'
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card
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
