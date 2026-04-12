import React, { useContext, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import FormField from '../components/FormField';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { uploadProductImage } from '../services/storageService';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getTextAlign, pickLocalizedText } from '../utils/format';

export default function AdminProductsScreen() {
  const { products, createAdminProduct } = useContext(AppContext);
  const { language, isRTL, t } = useLocalization();
  const [form, setForm] = useState({
    nameAr: '',
    nameEn: '',
    brandAr: '',
    brandEn: '',
    descAr: '',
    descEn: '',
    categoryId: 'c1',
    animalType: 'cat',
    lifeStage: '',
    price: '',
    image: null,
    isActive: 'true'
  });
  const [isUploading, setIsUploading] = useState(false);

  const visibleProducts = useMemo(() => products.slice(0, 8), [products]);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t('alerts.warning'), t('alerts.permissionPhotos'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    updateForm('image', {
      uri: asset.uri,
      mimeType: asset.mimeType || 'image/jpeg',
      fileName: asset.fileName || `product_${Date.now()}.jpg`
    });
  };

  const submit = async () => {
    if (!form.nameAr || !form.nameEn || !form.brandAr || !form.brandEn || !form.price) {
      Alert.alert(t('alerts.missingData'), t('admin.productValidation'));
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = form.image ? await uploadProductImage(form.image) : '';

      await createAdminProduct({
        name: { ar: form.nameAr, en: form.nameEn },
        brand: { ar: form.brandAr, en: form.brandEn },
        desc: { ar: form.descAr, en: form.descEn },
        category_id: form.categoryId,
        categoryId: form.categoryId,
        animal_type: form.animalType,
        animalType: form.animalType,
        life_stage: form.lifeStage || null,
        lifeStage: form.lifeStage || null,
        price: Number(form.price),
        image: imageUrl,
        image_url: imageUrl,
        is_active: form.isActive === 'true'
      });
      Alert.alert(t('alerts.success'), t('admin.productCreated'));
      setForm({
        nameAr: '',
        nameEn: '',
        brandAr: '',
        brandEn: '',
        descAr: '',
        descEn: '',
        categoryId: 'c1',
        animalType: 'cat',
        lifeStage: '',
        price: '',
        image: null,
        isActive: 'true'
      });
    } catch (error) {
      Alert.alert(t('alerts.error'), error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('admin.productsTitle')} subtitle={t('admin.productsSubtitle')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <FormField label={t('admin.nameAr')} value={form.nameAr} onChangeText={(value) => updateForm('nameAr', value)} />
          <FormField label={t('admin.nameEn')} value={form.nameEn} onChangeText={(value) => updateForm('nameEn', value)} />
          <FormField label={t('admin.brandAr')} value={form.brandAr} onChangeText={(value) => updateForm('brandAr', value)} />
          <FormField label={t('admin.brandEn')} value={form.brandEn} onChangeText={(value) => updateForm('brandEn', value)} />
          <FormField label={t('admin.descAr')} value={form.descAr} onChangeText={(value) => updateForm('descAr', value)} multiline />
          <FormField label={t('admin.descEn')} value={form.descEn} onChangeText={(value) => updateForm('descEn', value)} multiline />
          <FormField label={t('admin.categoryId')} value={form.categoryId} onChangeText={(value) => updateForm('categoryId', value)} placeholder="c1" />
          <FormField label={t('admin.animalType')} value={form.animalType} onChangeText={(value) => updateForm('animalType', value)} placeholder="cat" />
          <FormField label={t('admin.lifeStage')} value={form.lifeStage} onChangeText={(value) => updateForm('lifeStage', value)} placeholder="kitten" />
          <FormField label={t('admin.price')} value={form.price} onChangeText={(value) => updateForm('price', value)} keyboardType="numeric" />
          <View style={styles.imageField}>
            <Text style={styles.imageLabel}>{t('admin.imageUpload')}</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={chooseImage}>
              <Text style={styles.imagePickerText}>{form.image ? t('admin.changeImage') : t('admin.chooseImage')}</Text>
            </TouchableOpacity>
            {form.image?.uri ? <Image source={{ uri: form.image.uri }} style={styles.previewImage} /> : null}
          </View>
          <FormField label={t('admin.activeFlag')} value={form.isActive} onChangeText={(value) => updateForm('isActive', value)} placeholder="true / false" />
          <TouchableOpacity style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitText}>{isUploading ? t('common.loading') : t('admin.saveProduct')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('admin.latestProducts')}</Text>
        {visibleProducts.map((item) => (
          <View key={item.id} style={styles.listCard}>
            <Text style={[styles.listTitle, { textAlign: getTextAlign(isRTL) }]}>{pickLocalizedText(item.name, language)}</Text>
            <Text style={[styles.listSubtitle, { textAlign: getTextAlign(isRTL) }]}>{pickLocalizedText(item.brand, language)}</Text>
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
  imageField: { marginBottom: spacing.sm },
  imageLabel: { color: colors.secondary, marginBottom: 7, fontSize: typography.label, fontWeight: '800' },
  imagePicker: { backgroundColor: '#EEF7F1', borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  imagePickerText: { color: colors.secondary, fontWeight: '800', fontSize: typography.bodySm },
  previewImage: { width: '100%', height: 180, borderRadius: radius.lg, marginTop: spacing.sm, backgroundColor: '#EEF5F2' },
  submitBtn: { backgroundColor: colors.secondary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm },
  submitText: { color: '#fff', fontWeight: '900', fontSize: typography.body },
  sectionTitle: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900', marginVertical: spacing.md },
  listCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  listTitle: { color: colors.text, fontWeight: '800', fontSize: typography.body },
  listSubtitle: { color: colors.textSoft, marginTop: 4 }
});
