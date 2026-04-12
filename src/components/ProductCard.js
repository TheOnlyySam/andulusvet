import React, { useContext } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { getAnimalTypes } from '../services/catalogService';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatCurrency, getRowDirection, getTextAlign, pickLocalizedText } from '../utils/format';

const animalTypes = getAnimalTypes();

const stageLabelMap = {
  kitten: { ar: 'قطط صغيرة', en: 'Kittens' },
  cat: { ar: 'قطط بالغة', en: 'Adult Cats' },
  puppy: { ar: 'جراء', en: 'Puppies' },
  dog: { ar: 'كلاب بالغة', en: 'Adult Dogs' }
};

export default function ProductCard({ product }) {
  const { addToCart } = useContext(AppContext);
  const { language, isRTL, t } = useLocalization();
  const animal = animalTypes.find((item) => item.id === product.animalType);

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

      <View style={styles.infoWrap}>
        <View style={[styles.topRow, { flexDirection: getRowDirection(isRTL) }]}>
          <Text style={styles.price}>{formatCurrency(product.price, language)}</Text>
          <Text style={styles.brand}>{pickLocalizedText(product.brand, language)}</Text>
        </View>

        <Text numberOfLines={2} style={[styles.name, { textAlign: getTextAlign(isRTL) }]}>
          {pickLocalizedText(product.name, language)}
        </Text>
        <Text numberOfLines={2} style={[styles.desc, { textAlign: getTextAlign(isRTL) }]}>
          {pickLocalizedText(product.desc, language)}
        </Text>

        <View style={[styles.bottomRow, { flexDirection: getRowDirection(isRTL) }]}>
          <View style={[styles.tagsRow, { flexDirection: getRowDirection(isRTL) }]}>
            <Text style={styles.animalBadge}>{pickLocalizedText(animal?.name, language) || 'General'}</Text>
            {product.lifeStage ? (
              <Text style={styles.stageBadge}>{pickLocalizedText(stageLabelMap[product.lifeStage], language)}</Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => addToCart(product)}>
            <Text style={styles.btnText}>{t('shop.add')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card
  },
  image: {
    width: '100%',
    height: 170,
    backgroundColor: '#EEF5F2'
  },
  infoWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    fontSize: typography.caption,
    color: colors.secondary,
    backgroundColor: '#EEF7F1',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    fontWeight: '800'
  },
  price: {
    color: colors.secondary,
    fontWeight: '900',
    fontSize: typography.label
  },
  name: {
    marginTop: spacing.sm,
    fontSize: typography.h3,
    color: colors.text,
    fontWeight: '900'
  },
  desc: {
    marginTop: 6,
    fontSize: typography.bodySm,
    color: colors.textSoft,
    lineHeight: 20
  },
  bottomRow: {
    marginTop: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tagsRow: {
    alignItems: 'center',
    gap: 8
  },
  animalBadge: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: typography.caption
  },
  stageBadge: {
    color: '#fff',
    fontWeight: '800',
    fontSize: typography.caption,
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 18
  },
  btnText: {
    color: colors.secondary,
    fontWeight: '900',
    fontSize: typography.bodySm
  }
});
