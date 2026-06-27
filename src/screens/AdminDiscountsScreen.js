import React, { useContext, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatCurrency, getTextAlign, pickLocalizedText } from '../utils/format';

export default function AdminDiscountsScreen() {
  const { discountRules, createAdminDiscount } = useContext(AppContext);
  const { language, isRTL, t } = useLocalization();
  const [form, setForm] = useState({
    labelAr: '',
    labelEn: '',
    threshold: '',
    value: '',
    valueType: 'percentage',
    isActive: 'true',
    startsAt: '',
    endsAt: '',
    scope: 'order'
  });

  const visibleDiscounts = useMemo(() => discountRules.slice(0, 8), [discountRules]);
  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!form.labelAr || !form.labelEn || !form.threshold || !form.value) {
      Alert.alert(t('alerts.missingData'), t('admin.discountValidation'));
      return;
    }

    try {
      await createAdminDiscount({
        label: { ar: form.labelAr, en: form.labelEn },
        threshold: Number(form.threshold),
        value: Number(form.value),
        valueType: form.valueType,
        value_type: form.valueType,
        isActive: form.isActive === 'true',
        is_active: form.isActive === 'true',
        startsAt: form.startsAt || null,
        starts_at: form.startsAt || null,
        endsAt: form.endsAt || null,
        ends_at: form.endsAt || null,
        scope: form.scope,
        type: 'threshold'
      });
      Alert.alert(t('alerts.success'), t('admin.discountCreated'));
      setForm({
        labelAr: '',
        labelEn: '',
        threshold: '',
        value: '',
        valueType: 'percentage',
        isActive: 'true',
        startsAt: '',
        endsAt: '',
        scope: 'order'
      });
    } catch (error) {
      Alert.alert(t('alerts.error'), error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('admin.discountsTitle')} subtitle={t('admin.discountsSubtitle')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <FormField label={t('admin.labelAr')} value={form.labelAr} onChangeText={(value) => updateForm('labelAr', value)} />
          <FormField label={t('admin.labelEn')} value={form.labelEn} onChangeText={(value) => updateForm('labelEn', value)} />
          <FormField label={t('admin.threshold')} value={form.threshold} onChangeText={(value) => updateForm('threshold', value)} keyboardType="numeric" />
          <FormField label={t('admin.value')} value={form.value} onChangeText={(value) => updateForm('value', value)} keyboardType="numeric" />
          <FormField label={t('admin.valueType')} value={form.valueType} onChangeText={(value) => updateForm('valueType', value)} placeholder="percentage / fixed" />
          <FormField label={t('admin.activeFlag')} value={form.isActive} onChangeText={(value) => updateForm('isActive', value)} placeholder="true / false" />
          <FormField label={t('admin.startsAt')} value={form.startsAt} onChangeText={(value) => updateForm('startsAt', value)} placeholder="2026-05-01" />
          <FormField label={t('admin.endsAt')} value={form.endsAt} onChangeText={(value) => updateForm('endsAt', value)} placeholder="2026-06-01" />
          <FormField label={t('admin.scope')} value={form.scope} onChangeText={(value) => updateForm('scope', value)} placeholder="order" />
          <TouchableOpacity style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitText}>{t('admin.saveDiscount')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('admin.activeDiscounts')}</Text>
        {visibleDiscounts.map((item) => (
          <View key={item.id} style={styles.listCard}>
            <Text style={[styles.listTitle, { textAlign: getTextAlign(isRTL) }]}>{pickLocalizedText(item.label, language)}</Text>
            <Text style={[styles.listSubtitle, { textAlign: getTextAlign(isRTL) }]}>
              {formatCurrency(item.threshold || 0, language)} / {item.value}{item.valueType === 'percentage' ? '%' : ''}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  content: { paddingBottom: 140 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  submitBtn: { backgroundColor: colors.secondary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm },
  submitText: { color: '#fff', fontWeight: '900', fontSize: typography.body },
  sectionTitle: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900', marginVertical: spacing.md },
  listCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  listTitle: { color: colors.text, fontWeight: '800', fontSize: typography.body },
  listSubtitle: { color: colors.textSoft, marginTop: 4 }
});
