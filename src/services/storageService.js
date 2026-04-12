import { getSupabaseClient } from '../lib/supabase';

function sanitizeFileName(name = 'image.jpg') {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadProductImage(file) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase is not configured for image uploads.');
  }

  if (!file?.uri) {
    throw new Error('No image file selected.');
  }

  const response = await fetch(file.uri);
  const arrayBuffer = await response.arrayBuffer();
  const fileName = sanitizeFileName(file.fileName || file.name || `product_${Date.now()}.jpg`);
  const storagePath = `products/${Date.now()}_${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(storagePath, arrayBuffer, {
      contentType: file.mimeType || 'image/jpeg',
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath);
  return data.publicUrl;
}
