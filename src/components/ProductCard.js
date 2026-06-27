import React, { useContext, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Typography';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { getAnimalTypes } from '../services/catalogService';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatCurrency, getRowDirection, getTextAlign, pickLocalizedText } from '../utils/format';

const animalTypes = getAnimalTypes();
const stageLabels = {
  kitten: { ar: 'قطط صغيرة', en: 'Kittens' },
  cat: { ar: 'قطط بالغة', en: 'Adult cat' },
  puppy: { ar: 'جراء', en: 'Puppy' },
  dog: { ar: 'كلاب بالغة', en: 'Adult dog' },
  young: { ar: 'صغير', en: 'Young' },
  adult: { ar: 'كبير', en: 'Adult' }
};

export default function ProductCard({ product }) {
  const { addToCart } = useContext(AppContext);
  const { language, isRTL, t } = useLocalization();
  const [imageFailed, setImageFailed] = useState(false);
  const animal = product.animalType === 'all'
    ? { name: { ar: 'الكل', en: 'All' } }
    : animalTypes.find((item) => item.id === product.animalType);
  const hasImage = Boolean(product.image) && !imageFailed;

  return (
    <View style={[styles.card, { flexDirection: getRowDirection(isRTL) }]}>
      <View style={styles.media}>
        {hasImage ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" onError={() => setImageFailed(true)} />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="cube-outline" size={34} color={colors.primary} />
          </View>
        )}
        <View style={styles.availableBadge}>
          <View style={styles.availableDot} />
          <Text style={styles.availableText}>{language === 'ar' ? 'متوفر' : 'Available'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.brandRow, { flexDirection: getRowDirection(isRTL) }]}>
          <Text numberOfLines={1} style={styles.brand}>{pickLocalizedText(product.brand, language) || (language === 'ar' ? 'منتج بيطري' : 'Veterinary')}</Text>
        </View>
        <Text numberOfLines={2} style={[styles.name, { textAlign: getTextAlign(isRTL) }]}>{pickLocalizedText(product.name, language)}</Text>
        <Text numberOfLines={2} style={[styles.description, { textAlign: getTextAlign(isRTL) }]}>{pickLocalizedText(product.desc, language)}</Text>

        <View style={[styles.tags, { flexDirection: getRowDirection(isRTL) }]}>
          <View style={styles.tag}><Text style={styles.tagText}>{pickLocalizedText(animal?.name, language) || (language === 'ar' ? 'عام' : 'General')}</Text></View>
          {product.lifeStage ? <View style={styles.tag}><Text style={styles.tagText}>{pickLocalizedText(stageLabels[product.lifeStage], language)}</Text></View> : null}
        </View>

        <View style={[styles.actionRow, { flexDirection: getRowDirection(isRTL) }]}>
          <View>
            <Text style={styles.priceLabel}>{language === 'ar' ? 'السعر' : 'Price'}</Text>
            <Text style={styles.price}>{formatCurrency(product.price, language)}</Text>
          </View>
          <Pressable onPress={() => addToCart(product)} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addText}>{t('shop.add')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1, borderColor: '#DCEAEA', marginBottom: spacing.md, padding: 10, gap: spacing.md, ...shadows.card },
  media: { width: 116, height: 190, alignSelf: 'flex-start', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceMuted },
  image: { width: '100%', height: '100%' },
  imageFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  availableBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 5 },
  availableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  availableText: { color: colors.secondary, fontSize: 10, fontWeight: '800' },
  content: { flex: 1, paddingVertical: 3 },
  brandRow: { alignItems: 'center' },
  brand: { color: colors.primaryDeep, fontSize: typography.caption, fontWeight: '800' },
  name: { color: colors.text, fontSize: typography.body, lineHeight: 22, fontWeight: '900', marginTop: 5 },
  description: { color: colors.textSoft, fontSize: typography.caption, lineHeight: 18, marginTop: 4 },
  tags: { flexWrap: 'wrap', gap: 5, marginTop: 8 },
  tag: { backgroundColor: '#F0F7F7', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: colors.textSoft, fontSize: 10, fontWeight: '800' },
  actionRow: { justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: spacing.sm },
  priceLabel: { color: colors.textSoft, fontSize: 10 },
  price: { color: colors.secondary, fontSize: typography.label, fontWeight: '900', marginTop: 1 },
  addButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: 12, justifyContent: 'center' },
  addText: { color: '#fff', fontSize: typography.caption, fontWeight: '900' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] }
});
