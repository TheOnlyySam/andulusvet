import React, { useContext } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { animalTypes } from '../data/mockData';
import { colors } from '../theme/colors';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(AppContext);
  const animal = animalTypes.find((a) => a.id === product.animalType);
  const stageLabelMap = {
    kitten: 'قطط صغيرة',
    cat: 'قطط',
    puppy: 'جراء',
    dog: 'كلاب'
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

      <View style={styles.infoWrap}>
        <View style={styles.topRow}>
          <Text style={styles.price}>{product.price.toLocaleString('ar-IQ')} د.ع</Text>
          <Text style={styles.brand}>{product.brand}</Text>
        </View>

        <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
        <Text numberOfLines={2} style={styles.desc}>{product.desc}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.tagsRow}>
            <Text style={styles.animalBadge}>{animal?.name || 'عام'}</Text>
            {product.lifeStage ? <Text style={styles.stageBadge}>{stageLabelMap[product.lifeStage] || product.lifeStage}</Text> : null}
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => addToCart(product)}>
            <Text style={styles.btnText}>أضف</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    marginBottom: 10,
    flexDirection: 'row-reverse',
    overflow: 'hidden',
    shadowColor: '#0f1f4d',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  image: {
    width: 112,
    height: 112,
    backgroundColor: '#eef2ff'
  },
  infoWrap: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  topRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    fontSize: 11,
    color: colors.secondary,
    backgroundColor: '#eef2ff',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 9,
    fontWeight: '700'
  },
  price: {
    color: colors.secondary,
    fontWeight: '900',
    fontSize: 12
  },
  name: {
    marginTop: 6,
    fontSize: 15,
    color: colors.text,
    fontWeight: '800',
    textAlign: 'right'
  },
  desc: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
    lineHeight: 16
  },
  bottomRow: {
    marginTop: 'auto',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tagsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center'
  },
  animalBadge: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 12
  },
  stageBadge: {
    marginRight: 6,
    color: '#fff',
    fontWeight: '800',
    fontSize: 10,
    backgroundColor: colors.secondary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 14
  },
  btnText: {
    color: colors.secondary,
    fontWeight: '900'
  }
});
