import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminProductForm from '../components/AdminProductForm';
import ScreenHeader from '../components/ScreenHeader';
import { Text } from '../components/Typography';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, spacing, typography } from '../theme';

export default function AdminEditProductScreen({ route }) {
  const { products, updateAdminProduct } = useContext(AppContext);
  const { language } = useLocalization();
  const product = products.find((item) => item.id === route.params?.productId);

  if (!product) {
    return <SafeAreaView style={styles.container}><ScreenHeader title={language === 'ar' ? 'تعديل المنتج' : 'Edit product'} /><View style={styles.missing}><Text style={styles.missingText}>{language === 'ar' ? 'تعذر العثور على المنتج. ارجع وحدّث القائمة.' : 'Product not found. Go back and refresh the list.'}</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={language === 'ar' ? 'تعديل المنتج' : 'Edit product'} subtitle={language === 'ar' ? 'عدّل البيانات ثم احفظ التغييرات' : 'Update the details and save changes'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AdminProductForm initialProduct={product} onSubmit={(payload) => updateAdminProduct(product.id, payload)} submitLabel={language === 'ar' ? 'حفظ التعديلات' : 'Save changes'} successMessage={language === 'ar' ? 'تم تحديث المنتج بنجاح.' : 'Product updated successfully.'} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  content: { paddingBottom: 140 },
  missing: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  missingText: { color: colors.textSoft, textAlign: 'center', fontSize: typography.body }
});
