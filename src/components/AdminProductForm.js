import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import FormField from './FormField';
import OptionSelector from './OptionSelector';
import { Text } from './Typography';
import { ANIMAL_OPTIONS, PRODUCT_TYPE_OPTIONS } from '../constants/productOptions';
import { useLocalization } from '../context/LocalizationContext';
import { uploadProductImage } from '../services/storageService';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getTextAlign, pickLocalizedText } from '../utils/format';

const emptyForm = {
  nameAr: '', nameEn: '', brandAr: '', brandEn: '', descAr: '', descEn: '',
  categoryId: 'c1', animalType: 'all', lifeStage: 'adult', price: '', image: null, isActive: true
};

const LIFE_STAGE_OPTIONS = [
  { value: 'young', label: { ar: 'صغير', en: 'Young' } },
  { value: 'adult', label: { ar: 'كبير', en: 'Adult' } }
];

function getLifeStageChoice(lifeStage) {
  return ['kitten', 'puppy', 'young'].includes(lifeStage) ? 'young' : 'adult';
}

function mapLifeStage(animalType, choice) {
  if (choice === 'young') {
    if (animalType === 'cat') return 'kitten';
    if (animalType === 'dog') return 'puppy';
    return 'young';
  }
  if (animalType === 'cat') return 'cat';
  if (animalType === 'dog') return 'dog';
  return 'adult';
}

function fromProduct(product) {
  if (!product) return emptyForm;
  return {
    nameAr: pickLocalizedText(product.name, 'ar'),
    nameEn: pickLocalizedText(product.name, 'en'),
    brandAr: pickLocalizedText(product.brand, 'ar'),
    brandEn: pickLocalizedText(product.brand, 'en'),
    descAr: pickLocalizedText(product.desc, 'ar'),
    descEn: pickLocalizedText(product.desc, 'en'),
    categoryId: product.categoryId || product.category_id || 'c1',
    animalType: product.animalType || product.animal_type || 'all',
    lifeStage: product.lifeStage || product.life_stage || 'adult',
    price: String(product.price || ''),
    image: product.image ? { uri: product.image, existing: true } : null,
    isActive: product.isActive !== false
  };
}

export default function AdminProductForm({ initialProduct, onSubmit, submitLabel, successMessage }) {
  const { language, isRTL, t } = useLocalization();
  const [form, setForm] = useState(() => fromProduct(initialProduct));
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(fromProduct(initialProduct)), [initialProduct]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const changeAnimal = (animalType) => setForm((current) => ({
    ...current,
    animalType,
    lifeStage: mapLifeStage(animalType, getLifeStageChoice(current.lifeStage))
  }));

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert(t('alerts.warning'), t('alerts.permissionPhotos'));
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.82 });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      update('image', { uri: asset.uri, mimeType: asset.mimeType || 'image/jpeg', fileName: asset.fileName || `product_${Date.now()}.jpg` });
    }
  };

  const save = async () => {
    if (!form.nameAr.trim() || !form.nameEn.trim() || !form.brandAr.trim() || !form.brandEn.trim() || !form.price) {
      return Alert.alert(t('alerts.missingData'), t('admin.productValidation'));
    }
    try {
      setSaving(true);
      const imageUrl = form.image?.existing ? form.image.uri : form.image ? await uploadProductImage(form.image) : '';
      await onSubmit({
        name: { ar: form.nameAr.trim(), en: form.nameEn.trim() },
        brand: { ar: form.brandAr.trim(), en: form.brandEn.trim() },
        desc: { ar: form.descAr.trim(), en: form.descEn.trim() },
        categoryId: form.categoryId,
        animalType: form.animalType,
        lifeStage: form.lifeStage.trim() || null,
        price: Number(form.price),
        image: imageUrl,
        isActive: form.isActive,
        is_active: form.isActive
      });
      Alert.alert(t('alerts.success'), successMessage);
      if (!initialProduct) setForm(emptyForm);
    } catch (error) {
      Alert.alert(t('alerts.error'), error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.formCard}>
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}><View style={styles.sectionIcon}><Ionicons name="text-outline" size={19} color={colors.secondary} /></View><Text style={styles.sectionTitle}>{language === 'ar' ? 'معلومات المنتج' : 'Product details'}</Text></View>
        <FormField label={t('admin.nameAr')} value={form.nameAr} onChangeText={(value) => update('nameAr', value)} />
        <FormField label={t('admin.nameEn')} value={form.nameEn} onChangeText={(value) => update('nameEn', value)} autoCapitalize="words" />
        <FormField label={t('admin.brandAr')} value={form.brandAr} onChangeText={(value) => update('brandAr', value)} />
        <FormField label={t('admin.brandEn')} value={form.brandEn} onChangeText={(value) => update('brandEn', value)} />
        <FormField label={t('admin.descAr')} value={form.descAr} onChangeText={(value) => update('descAr', value)} multiline />
        <FormField label={t('admin.descEn')} value={form.descEn} onChangeText={(value) => update('descEn', value)} multiline />
      </View>

      <View style={styles.divider} />
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}><View style={styles.sectionIcon}><Ionicons name="options-outline" size={19} color={colors.secondary} /></View><Text style={styles.sectionTitle}>{language === 'ar' ? 'التصنيف والسعر' : 'Classification & price'}</Text></View>
        <OptionSelector label={language === 'ar' ? 'اختيار الحيوان' : 'Animal'} options={ANIMAL_OPTIONS} value={form.animalType} onChange={changeAnimal} />
        <OptionSelector label={language === 'ar' ? 'نوع المنتج' : 'Product type'} options={PRODUCT_TYPE_OPTIONS} value={form.categoryId} onChange={(value) => update('categoryId', value)} />
        <OptionSelector
          label={t('admin.lifeStage')}
          options={LIFE_STAGE_OPTIONS}
          value={getLifeStageChoice(form.lifeStage)}
          onChange={(choice) => update('lifeStage', mapLifeStage(form.animalType, choice))}
        />
        <FormField label={t('admin.price')} value={form.price} onChangeText={(value) => update('price', value)} keyboardType="numeric" />
        <OptionSelector label={t('admin.activeFlag')} options={[{ value: true, label: { ar: 'مفعل', en: 'Active' } }, { value: false, label: { ar: 'مخفي', en: 'Hidden' } }]} value={form.isActive} onChange={(value) => update('isActive', value)} />
      </View>

      <View style={styles.divider} />
      <Text style={[styles.imageLabel, { textAlign: getTextAlign(isRTL) }]}>{t('admin.imageUpload')}</Text>
      <Pressable style={styles.imagePicker} onPress={chooseImage}><Ionicons name="image-outline" size={21} color={colors.secondary} /><Text style={styles.imagePickerText}>{form.image ? t('admin.changeImage') : t('admin.chooseImage')}</Text></Pressable>
      {form.image?.uri ? <Image source={{ uri: form.image.uri }} style={styles.preview} resizeMode="cover" /> : null}

      <Pressable style={({ pressed }) => [styles.submit, pressed && { opacity: 0.75 }]} onPress={save} disabled={saving}>
        <Ionicons name={initialProduct ? 'save-outline' : 'add-circle-outline'} size={21} color="#fff" />
        <Text style={styles.submitText}>{saving ? t('common.loading') : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  section: { gap: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: spacing.md },
  sectionIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  imageLabel: { color: colors.secondary, fontSize: typography.label, fontWeight: '900', marginBottom: 8 },
  imagePicker: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, backgroundColor: colors.accentSoft, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  imagePickerText: { color: colors.secondary, fontSize: typography.bodySm, fontWeight: '900' },
  preview: { width: '100%', height: 210, borderRadius: radius.lg, marginTop: spacing.sm, backgroundColor: colors.surfaceMuted },
  submit: { minHeight: 54, marginTop: spacing.lg, borderRadius: radius.md, backgroundColor: colors.secondary, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: typography.body, fontWeight: '900' }
});
