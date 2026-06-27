import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Typography';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { addSavedLocation, loadCheckoutPreferences, removeSavedLocation, saveCheckoutDraft } from '../services/checkoutService';
import { buildWhatsappOrderMessage } from '../services/orderService';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatCurrency, getRowDirection, getTextAlign, pickLocalizedText } from '../utils/format';

const WHATSAPP_PHONE = '9647801730506';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { language, isRTL, t } = useLocalization();
  const { cart, cartSummary, discountRules, changeQty, removeFromCart, clearCart } = useContext(AppContext);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber1, setPhoneNumber1] = useState('');
  const [phoneNumber2, setPhoneNumber2] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [district, setDistrict] = useState('');
  const [closestLandmark, setClosestLandmark] = useState('');
  const [placeOfResidence, setPlaceOfResidence] = useState('');
  const [savedLocations, setSavedLocations] = useState([]);
  const [isCheckoutDraftReady, setIsCheckoutDraftReady] = useState(false);
  const bottomContentOffset = insets.bottom + 96;

  const customerDraft = useMemo(
    () => ({
      customerName,
      phoneNumber1,
      phoneNumber2,
      governorate,
      district,
      closestLandmark,
      placeOfResidence
    }),
    [
      customerName,
      phoneNumber1,
      phoneNumber2,
      governorate,
      district,
      closestLandmark,
      placeOfResidence
    ]
  );

  const discountHint = useMemo(() => {
    const activeRules = (discountRules || [])
      .filter((rule) => rule.isActive !== false)
      .sort((a, b) => Number(a.threshold || 0) - Number(b.threshold || 0));

    if (!activeRules.length) return null;

    return activeRules
      .map((rule) => {
        const thresholdText = formatCurrency(Number(rule.threshold || 0), language);
        if ((rule.valueType || rule.value_type) === 'fixed') {
          return language === 'ar'
            ? `${thresholdText}+ => ${formatCurrency(Number(rule.value || 0), language)}`
            : `${thresholdText}+ => ${formatCurrency(Number(rule.value || 0), language)}`;
        }
        return `${thresholdText}+ => ${Number(rule.value || 0)}%`;
      })
      .join(language === 'ar' ? ' | ' : ' | ');
  }, [discountRules, language]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const stored = await loadCheckoutPreferences();
        if (!mounted) return;

        if (stored.draft) {
          setCustomerName(stored.draft.customerName || '');
          setPhoneNumber1(stored.draft.phoneNumber1 || '');
          setPhoneNumber2(stored.draft.phoneNumber2 || '');
          setGovernorate(stored.draft.governorate || '');
          setDistrict(stored.draft.district || '');
          setClosestLandmark(stored.draft.closestLandmark || '');
          setPlaceOfResidence(stored.draft.placeOfResidence || '');
        }

        setSavedLocations(stored.locations || []);
      } finally {
        if (mounted) setIsCheckoutDraftReady(true);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isCheckoutDraftReady) return;
    saveCheckoutDraft(customerDraft).catch(() => null);
  }, [customerDraft, isCheckoutDraftReady]);

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

  const saveCustomerInfo = async () => {
    await saveCheckoutDraft(customerDraft);
    Alert.alert(t('alerts.success'), t('cart.customerSaved'));
  };

  const saveLocation = async () => {
    if (!governorate.trim() || !district.trim() || !closestLandmark.trim() || !placeOfResidence.trim()) {
      Alert.alert(t('alerts.missingData'), t('cart.locationMissing'));
      return;
    }

    const label = `${district.trim()} - ${placeOfResidence.trim()}`;
    const next = await addSavedLocation({
      label,
      governorate: governorate.trim(),
      district: district.trim(),
      closestLandmark: closestLandmark.trim(),
      placeOfResidence: placeOfResidence.trim()
    });

    setSavedLocations(next);
    Alert.alert(t('alerts.success'), t('cart.locationSaved'));
  };

  const applySavedLocation = (item) => {
    setGovernorate(item.governorate || '');
    setDistrict(item.district || '');
    setClosestLandmark(item.closestLandmark || '');
    setPlaceOfResidence(item.placeOfResidence || '');
  };

  const deleteLocation = async (locationId) => {
    const next = await removeSavedLocation(locationId);
    setSavedLocations(next);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}
      >
        <ScreenHeader title={t('cart.title')} subtitle={t('cart.subtitle')} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomContentOffset }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          {!cart.length ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}><Ionicons name="cart-outline" size={34} color={colors.secondary} /></View>
              <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
              <Text style={styles.emptySubtitle}>{language === 'ar' ? 'أضف منتجات من المتجر وستظهر هنا مباشرة' : 'Add products from the shop and they will appear here'}</Text>
            </View>
          ) : (
            <View style={[styles.cartIntro, { flexDirection: getRowDirection(isRTL) }]}>
              <View>
                <Text style={[styles.cartIntroTitle, { textAlign: getTextAlign(isRTL) }]}>{language === 'ar' ? 'مراجعة الطلب' : 'Review order'}</Text>
                <Text style={styles.cartIntroSubtitle}>{cart.length} {language === 'ar' ? 'منتج في السلة' : 'items in your cart'}</Text>
              </View>
              <View style={styles.cartCountBadge}><Text style={styles.cartCountText}>{cart.reduce((sum, item) => sum + item.qty, 0)}</Text></View>
            </View>
          )}

          {cart.map((item) => (
            <View key={item.id} style={[styles.card, { flexDirection: getRowDirection(isRTL) }]}>
              {item.image ? <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" /> : <View style={styles.itemImageFallback}><Ionicons name="cube-outline" size={25} color={colors.primary} /></View>}
              <View style={styles.itemContent}>
                <View style={[styles.itemTopRow, { flexDirection: getRowDirection(isRTL) }]}>
                  <Text numberOfLines={2} style={[styles.name, { textAlign: getTextAlign(isRTL) }]}>{pickLocalizedText(item.name, language)}</Text>
                  <TouchableOpacity style={styles.removeIcon} onPress={() => removeFromCart(item.id)} accessibilityLabel={t('common.remove')}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.unitPrice, { textAlign: getTextAlign(isRTL) }]}>{formatCurrency(item.price, language)} × {item.qty}</Text>
                <View style={[styles.itemBottomRow, { flexDirection: getRowDirection(isRTL) }]}>
                  <View style={[styles.stepper, { flexDirection: getRowDirection(isRTL) }]}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, -1)}><Ionicons name="remove" size={17} color={colors.secondary} /></TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.qty}</Text>
                    <TouchableOpacity style={styles.qtyBtnActive} onPress={() => changeQty(item.id, 1)}><Ionicons name="add" size={17} color="#fff" /></TouchableOpacity>
                  </View>
                  <Text style={styles.price}>{formatCurrency(item.price * item.qty, language)}</Text>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.summaryCard}>
            <View style={[styles.sectionHeading, { flexDirection: getRowDirection(isRTL) }]}>
              <View style={styles.sectionIcon}><Ionicons name="receipt-outline" size={20} color={colors.secondary} /></View>
              <View><Text style={styles.summaryTitle}>{language === 'ar' ? 'ملخص السلة' : 'Cart summary'}</Text><Text style={styles.summarySubtitle}>{language === 'ar' ? 'تفاصيل السعر قبل إرسال الطلب' : 'Price details before sending'}</Text></View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryRow, { flexDirection: getRowDirection(isRTL) }]}>
              <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(cartSummary.subtotal, language)}</Text>
            </View>
            <View style={[styles.summaryRow, { flexDirection: getRowDirection(isRTL) }]}>
              <Text style={styles.summaryLabel}>{t('cart.discount')}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(cartSummary.discountAmount, language)}</Text>
            </View>
            {discountHint ? <Text style={[styles.discountHint, { textAlign: getTextAlign(isRTL) }]}>{discountHint}</Text> : null}
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryRow, styles.totalRow, { flexDirection: getRowDirection(isRTL) }]}>
              <Text style={styles.totalLabel}>{t('cart.total')}</Text>
              <Text style={styles.totalValue}>{formatCurrency(cartSummary.total, language)}</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={[styles.sectionHeading, { flexDirection: getRowDirection(isRTL) }]}>
              <View style={styles.sectionIcon}><Ionicons name="person-outline" size={20} color={colors.secondary} /></View>
              <View style={styles.sectionHeadingCopy}><Text style={[styles.formTitle, { textAlign: getTextAlign(isRTL) }]}>{t('cart.orderInfo')}</Text><Text style={[styles.sectionSubtitle, { textAlign: getTextAlign(isRTL) }]}>{language === 'ar' ? 'أدخل معلومات الاستلام والتوصيل' : 'Enter delivery and contact details'}</Text></View>
            </View>

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
            <View style={[styles.actionsRow, { flexDirection: getRowDirection(isRTL) }]}>
              <TouchableOpacity style={styles.ghostBtn} onPress={saveCustomerInfo}>
                <Text style={styles.ghostBtnTxt}>{t('cart.saveCustomer')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={saveLocation}>
                <Text style={styles.ghostBtnTxt}>{t('cart.saveLocation')}</Text>
              </TouchableOpacity>
            </View>

            {savedLocations.length ? (
              <View style={styles.savedLocationsWrap}>
                <Text style={[styles.savedTitle, { textAlign: getTextAlign(isRTL) }]}>{t('cart.savedLocations')}</Text>
                {savedLocations.map((item) => (
                  <View key={item.id} style={[styles.savedItem, { flexDirection: getRowDirection(isRTL) }]}>
                    <TouchableOpacity style={styles.savedApplyBtn} onPress={() => applySavedLocation(item)}>
                      <Text style={styles.savedApplyTxt}>
                        {item.label || `${item.district} - ${item.placeOfResidence}`}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.savedDeleteBtn} onPress={() => deleteLocation(item.id)}>
                      <Text style={styles.savedDeleteTxt}>{t('common.remove')}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          <View style={styles.footer}>
            <Text style={[styles.footerTitle, { textAlign: getTextAlign(isRTL) }]}>{t('cart.readyTitle')}</Text>
            <Text style={[styles.footerSubtitle, { textAlign: getTextAlign(isRTL) }]}>{t('cart.readySubtitle')}</Text>
            <TouchableOpacity style={styles.reserveBtn} onPress={reserveOrder}>
              <Ionicons name="logo-whatsapp" size={21} color="#fff" />
              <Text style={styles.reserveTxt}>{t('cart.sendWhatsapp')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearTxt}>{t('cart.clearCart')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md
  },
  keyboardWrap: {
    flex: 1
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    paddingTop: 2
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
  actionsRow: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  ghostBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 11,
    backgroundColor: colors.surfaceMuted
  },
  ghostBtnTxt: {
    color: colors.secondary,
    fontWeight: '800',
    fontSize: typography.caption
  },
  savedLocationsWrap: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md
  },
  savedTitle: {
    color: colors.secondary,
    fontWeight: '900',
    marginBottom: spacing.sm
  },
  savedItem: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  savedApplyBtn: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: spacing.md
  },
  savedApplyTxt: {
    color: colors.text,
    fontWeight: '700',
    fontSize: typography.caption
  },
  savedDeleteBtn: {
    borderRadius: radius.md,
    backgroundColor: '#FDEDEC',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    justifyContent: 'center'
  },
  savedDeleteTxt: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: typography.caption
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
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  emptyTitle: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900', textAlign: 'center' },
  emptySubtitle: { color: colors.textSoft, fontSize: typography.bodySm, lineHeight: 20, textAlign: 'center', marginTop: 6 },
  cartIntro: { justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cartIntroTitle: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900' },
  cartIntroSubtitle: { color: colors.textSoft, fontSize: typography.caption, marginTop: 3 },
  cartCountBadge: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  cartCountText: { color: '#fff', fontSize: typography.label, fontWeight: '900' },
  card: {
    borderWidth: 1,
    borderColor: '#DCEAEA',
    borderRadius: radius.xl,
    padding: 10,
    gap: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#fff',
    ...shadows.soft
  },
  itemImage: { width: 92, height: 112, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted },
  itemImageFallback: { width: 92, height: 112, borderRadius: radius.lg, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1, paddingVertical: 2, justifyContent: 'space-between' },
  itemTopRow: { alignItems: 'flex-start', gap: 7 },
  name: { flex: 1, color: colors.text, fontWeight: '900', fontSize: typography.body, lineHeight: 21 },
  removeIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#FFF1F0', alignItems: 'center', justifyContent: 'center' },
  unitPrice: { color: colors.textSoft, fontSize: typography.caption, marginTop: 3 },
  itemBottomRow: { alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  stepper: { height: 36, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  qtyBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F8F8' },
  qtyBtnActive: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary },
  qtyValue: { minWidth: 32, textAlign: 'center', color: colors.secondary, fontWeight: '900', fontSize: typography.bodySm },
  price: { color: colors.secondary, fontWeight: '900', fontSize: typography.label },
  summaryCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.secondary, ...shadows.card },
  summaryTitle: { color: '#fff', fontWeight: '900', fontSize: typography.h3 },
  summarySubtitle: { color: '#CFE0E2', fontSize: typography.caption, marginTop: 2 },
  sectionHeading: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  sectionHeadingCopy: { flex: 1 },
  sectionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  sectionSubtitle: { color: colors.textSoft, fontSize: typography.caption, marginTop: 2 },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: spacing.md },
  summaryRow: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  summaryLabel: { color: '#CFE0E2', fontSize: typography.bodySm },
  summaryValue: { color: '#fff', fontWeight: '800' },
  totalRow: { marginTop: 3, marginBottom: 0 },
  totalLabel: { color: '#fff', fontSize: typography.body, fontWeight: '900' },
  totalValue: { color: colors.accent, fontSize: typography.h3, fontWeight: '900' },
  discountHint: { color: colors.accent, fontSize: typography.caption, marginBottom: spacing.sm },
  formCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, backgroundColor: '#fff', ...shadows.soft },
  formTitle: { color: colors.secondary, fontWeight: '900', fontSize: typography.h3, marginBottom: 0 },
  ghostBtn: { flex: 1, borderWidth: 1, borderColor: colors.secondary, borderRadius: radius.md, alignItems: 'center', paddingVertical: 12, backgroundColor: '#fff' },
  footer: { backgroundColor: colors.accentSoft, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  reserveBtn: { minHeight: 52, borderRadius: radius.md, backgroundColor: '#1F9D63', flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.md }
});
