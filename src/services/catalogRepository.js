import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '../lib/supabase';
import { localizeProduct } from './catalogService';

const PRODUCTS_CACHE_KEY = 'andulusvet_products_cache_v1';

function toLocalizedField(primary, secondary, fallback = '') {
  if (typeof primary === 'object' && primary) {
    return {
      ar: primary.ar || primary.name_ar || fallback,
      en: primary.en || primary.name_en || fallback
    };
  }

  return {
    ar: primary || fallback,
    en: secondary || primary || fallback
  };
}

function normalizeProduct(product) {
  return localizeProduct({
    ...product,
    id: String(product.id),
    categoryId: product.categoryId || product.category_id || 'c1',
    animalType: product.animalType || product.animal_type || 'cat',
    lifeStage: product.lifeStage || product.life_stage || null,
    image: product.image || product.image_url || '',
    image_url: product.image_url || product.image || '',
    isActive: typeof product.isActive === 'boolean' ? product.isActive : product.is_active !== false,
    is_active: typeof product.is_active === 'boolean' ? product.is_active : product.isActive !== false,
    price: Number(product.price || 0),
    name: toLocalizedField(product.name || product.name_ar, product.name_en, ''),
    brand: toLocalizedField(product.brand || product.brand_ar, product.brand_en, ''),
    desc: toLocalizedField(
      product.desc || product.description || product.description_ar,
      product.desc_en || product.description_en,
      ''
    )
  });
}

export async function fetchProductsFromRepository() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const cached = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
    return cached ? JSON.parse(cached).map(normalizeProduct) : [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    const cached = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
    if (cached) return JSON.parse(cached).map(normalizeProduct);
    throw error;
  }

  const products = (data || [])
    .map(normalizeProduct)
    .filter((product) => product.isActive !== false);
  await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
  return products;
}

export async function createProductInRepository(payload) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured for product writes.');
  }

  const dbPayload = {
    name_ar: payload.name?.ar || '',
    name_en: payload.name?.en || '',
    brand_ar: payload.brand?.ar || '',
    brand_en: payload.brand?.en || '',
    description_ar: payload.desc?.ar || '',
    description_en: payload.desc?.en || '',
    category_id: payload.categoryId || payload.category_id || 'c1',
    animal_type: payload.animalType || payload.animal_type || 'cat',
    life_stage: payload.lifeStage || payload.life_stage || null,
    price: Number(payload.price || 0),
    image_url: payload.image || payload.image_url || '',
    is_active: typeof payload.is_active === 'boolean' ? payload.is_active : payload.isActive !== false,
    created_by: payload.created_by || null
  };

  const { data, error } = await supabase
    .from('products')
    .insert(dbPayload)
    .select()
    .single();

  if (error) throw error;
  return normalizeProduct(data);
}

export async function updateProductInRepository(productId, payload) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured for product updates.');

  const dbPayload = {
    name_ar: payload.name?.ar || '',
    name_en: payload.name?.en || '',
    brand_ar: payload.brand?.ar || '',
    brand_en: payload.brand?.en || '',
    description_ar: payload.desc?.ar || '',
    description_en: payload.desc?.en || '',
    category_id: payload.categoryId || 'c1',
    animal_type: payload.animalType || 'all',
    life_stage: payload.lifeStage || null,
    price: Number(payload.price || 0),
    image_url: payload.image || '',
    is_active: payload.isActive !== false
  };

  const { data, error } = await supabase.from('products').update(dbPayload).eq('id', productId).select().single();
  if (error) throw error;
  return normalizeProduct(data);
}
