import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminProductForm from '../components/AdminProductForm';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { colors, spacing } from '../theme';

export default function AdminProductsScreen() {
  const { createAdminProduct } = useContext(AppContext);
  const { t } = useLocalization();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('admin.productsTitle')} subtitle={t('admin.productsSubtitle')} />
      <KeyboardAwareScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AdminProductForm onSubmit={createAdminProduct} submitLabel={t('admin.saveProduct')} successMessage={t('admin.productCreated')} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  content: { paddingBottom: 140 }
});
