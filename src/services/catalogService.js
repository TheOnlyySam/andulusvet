import { animalTypes, brands, categories, detailedFoodCategories, products } from '../data/mockData';

const brandLabels = {
  'رويال كانين': { ar: 'رويال كانين', en: 'Royal Canin' },
  بورينا: { ar: 'بورينا', en: 'Purina' },
  هيلز: { ar: 'هيلز', en: "Hill's" },
  'فيت لايف': { ar: 'فيت لايف', en: 'Vet Life' },
  'بي فارما': { ar: 'بي فارما', en: 'B Pharma' },
  'إكو فيت': { ar: 'إكو فيت', en: 'Eco Vet' },
  'جرين فارم': { ar: 'جرين فارم', en: 'Green Farm' },
  'هاي بيت': { ar: 'هاي بيت', en: 'Hi Pet' }
};

const animalTypeLabels = {
  cat: { ar: 'قطط', en: 'Cats' },
  dog: { ar: 'كلاب', en: 'Dogs' },
  bird: { ar: 'طيور', en: 'Birds' },
  cattle: { ar: 'مواشي', en: 'Cattle' },
  horse: { ar: 'خيول', en: 'Horses' }
};

const categoryLocalization = {
  c1: { name: { ar: 'أطعمة جافة', en: 'Dry Food' } },
  c2: { name: { ar: 'أطعمة رطبة', en: 'Wet Food' } },
  c3: { name: { ar: 'فيتامينات', en: 'Vitamins' } },
  c4: { name: { ar: 'مستلزمات العناية', en: 'Care Supplies' } },
  c5: { name: { ar: 'أدوية بيطرية', en: 'Veterinary Medicine' } }
};

const detailedLocalization = {
  cat_food: { name: { ar: 'طعام القطط', en: 'Cat Food' } },
  dog_food: { name: { ar: 'طعام الكلاب', en: 'Dog Food' } }
};

const productLocalization = {
  p1: { name: { ar: 'طعام قطط جاف ممتاز', en: 'Premium Dry Cat Food' }, desc: { ar: 'تركيبة متوازنة لدعم صحة القطط اليومية.', en: 'Balanced daily nutrition for adult cats.' } },
  p2: { name: { ar: 'طعام كلاب رطب بالدجاج', en: 'Chicken Wet Dog Food' }, desc: { ar: 'وجبة رطبة شهية وغنية بالبروتين.', en: 'A protein-rich wet meal dogs enjoy.' } },
  p3: { name: { ar: 'فيتامين دعم المناعة للطيور', en: 'Bird Immunity Support Vitamins' }, desc: { ar: 'مكمل غذائي يومي مناسب لطيور الزينة.', en: 'Daily supplement for pet birds.' } },
  p4: { name: { ar: 'شامبو علاجي للحساسية', en: 'Therapeutic Anti-Allergy Shampoo' }, desc: { ar: 'لطيف على الجلد وفعال ضد التهيج.', en: 'Gentle on skin and helps calm irritation.' } },
  p5: { name: { ar: 'مضاد طفيليات للمواشي', en: 'Cattle Parasite Treatment' }, desc: { ar: 'يساعد في الوقاية من الطفيليات الداخلية للمواشي.', en: 'Helps protect cattle from internal parasites.' } },
  p6: { name: { ar: 'طعام جاف للجراء', en: 'Dry Puppy Food' }, desc: { ar: 'مصمم خصيصا لنمو الجراء الصحي.', en: 'Designed to support healthy puppy growth.' } },
  p7: { name: { ar: 'طعام متوازن للكناري', en: 'Balanced Canary Food' }, desc: { ar: 'خلطة حبوب طبيعية لدعم نشاط الطيور.', en: 'Natural grain mix for energetic birds.' } },
  p8: { name: { ar: 'مكمل كالسيوم للقطط', en: 'Calcium Supplement for Cats' }, desc: { ar: 'يدعم صحة العظام والأسنان للقطط.', en: 'Supports bone and dental health.' } },
  p9: { name: { ar: 'علف خيول عالي الطاقة', en: 'High-Energy Horse Feed' }, desc: { ar: 'مناسب للخيول الرياضية وزيادة التحمل.', en: 'Great for active horses and stamina support.' } },
  p10: { name: { ar: 'فيتامين مفاصل للخيول', en: 'Horse Joint Vitamins' }, desc: { ar: 'دعم مرونة المفاصل وتقليل الإجهاد.', en: 'Supports flexibility and reduces strain.' } },
  p11: { name: { ar: 'دواء طفيليات للخيول', en: 'Horse Parasite Medicine' }, desc: { ar: 'حماية دورية من الطفيليات الداخلية.', en: 'Routine protection from internal parasites.' } },
  p12: { name: { ar: 'طعام رطب للقطط الصغيرة', en: 'Wet Food for Kittens' }, desc: { ar: 'قوام ناعم وسهل الهضم للقطط الصغيرة.', en: 'Soft and easy to digest for kittens.' } },
  p13: { name: { ar: 'حبوب تنظيف أسنان الكلاب', en: 'Dog Dental Chews' }, desc: { ar: 'تساعد على تقليل الترسبات وتحسين رائحة الفم.', en: 'Helps reduce buildup and freshen breath.' } },
  p14: { name: { ar: 'شامبو لطيف للقطط', en: 'Gentle Cat Shampoo' }, desc: { ar: 'مناسب للبشرة الحساسة وفراء لامع.', en: 'Suitable for sensitive skin and shiny coats.' } },
  p15: { name: { ar: 'مقوي مناعة للمواشي', en: 'Cattle Immunity Booster' }, desc: { ar: 'تركيبة مركزة لرفع مقاومة الأمراض.', en: 'Concentrated formula for stronger immunity.' } },
  p16: { name: { ar: 'علف مواشي جاف ممتاز', en: 'Premium Dry Cattle Feed' }, desc: { ar: 'دعم النمو والإنتاج بكفاءة.', en: 'Supports growth and productivity.' } },
  p17: { name: { ar: 'قطرات فيتامين للطيور', en: 'Bird Vitamin Drops' }, desc: { ar: 'تعزيز النشاط والريش الصحي.', en: 'Supports energy and feather health.' } },
  p18: { name: { ar: 'مضاد فطريات جلدي للكلاب', en: 'Dog Skin Antifungal Treatment' }, desc: { ar: 'علاج موضعي سريع وفعال.', en: 'Fast and effective topical treatment.' } },
  p19: { name: { ar: 'طعام قطط بالغين متكامل', en: 'Complete Adult Cat Food' }, desc: { ar: 'تغذية يومية متوازنة للقطط البالغة.', en: 'Balanced daily nutrition for adult cats.' } },
  p20: { name: { ar: 'طعام رطب للكلاب البالغة', en: 'Wet Food for Adult Dogs' }, desc: { ar: 'يدعم الهضم وصحة العضلات.', en: 'Supports digestion and muscle health.' } },
  p21: { name: { ar: 'مضاد ديدان للقطط', en: 'Cat Deworming Treatment' }, desc: { ar: 'جرعة سهلة للاستخدام الدوري.', en: 'Easy routine deworming dose.' } },
  p22: { name: { ar: 'بخاخ عناية حوافر الخيول', en: 'Horse Hoof Care Spray' }, desc: { ar: 'حماية يومية وترطيب للحوافر.', en: 'Daily protection and hydration for hooves.' } },
  p23: { name: { ar: 'طعام جاف للكلاب الحساسة', en: 'Dry Food for Sensitive Dogs' }, desc: { ar: 'تركيبة خالية من المهيجات الشائعة.', en: 'Formula made for sensitive digestion.' } },
  p24: { name: { ar: 'دواء تنفسي للطيور', en: 'Bird Respiratory Medicine' }, desc: { ar: 'دعم الجهاز التنفسي للطيور الأليفة.', en: 'Respiratory support for pet birds.' } },
  p25: { name: { ar: 'مكعبات أملاح معدنية للمواشي', en: 'Mineral Salt Blocks for Cattle' }, desc: { ar: 'تعويض المعادن الأساسية بشكل يومي.', en: 'Daily replacement of essential minerals.' } },
  p26: { name: { ar: 'معجون طاقة للخيول', en: 'Horse Energy Paste' }, desc: { ar: 'رفع سريع للطاقة قبل التمرين.', en: 'Quick energy boost before exercise.' } },
  p27: { name: { ar: 'طعام جاف فاخر للقطط الصغيرة', en: 'Premium Dry Food for Kittens' }, desc: { ar: 'حبيبات صغيرة مناسبة للهضم السهل.', en: 'Small kibble for easy digestion.' } },
  p28: { name: { ar: 'طعام رطب بالسلمون للقطط الصغيرة', en: 'Salmon Wet Food for Kittens' }, desc: { ar: 'دعم النمو الصحي في الأشهر الأولى.', en: 'Supports healthy growth in early months.' } },
  p29: { name: { ar: 'ليتر قطط متكتل عالي الامتصاص', en: 'High-Absorbency Clumping Litter' }, desc: { ar: 'تحكم ممتاز بالروائح وسهل التنظيف.', en: 'Strong odor control and easy cleaning.' } },
  p30: { name: { ar: 'لعبة كرات للقطط النشيطة', en: 'Ball Toy for Active Cats' }, desc: { ar: 'تحفز الحركة اليومية وتقلل الملل.', en: 'Encourages daily movement and play.' } },
  p31: { name: { ar: 'طوق قطط مريح قابل للتعديل', en: 'Adjustable Comfortable Cat Collar' }, desc: { ar: 'خفيف ومناسب للاستخدام اليومي.', en: 'Lightweight and ideal for daily use.' } },
  p32: { name: { ar: 'طعام جاف للقطط البالغة الحساسة', en: 'Dry Food for Sensitive Adult Cats' }, desc: { ar: 'تركيبة لطيفة على المعدة والبشرة.', en: 'Gentle on digestion and skin.' } },
  p33: { name: { ar: 'طعام رطب لقطط بالغة بالدجاج', en: 'Chicken Wet Food for Adult Cats' }, desc: { ar: 'وجبة لذيذة غنية بالبروتين.', en: 'Tasty protein-rich meal.' } },
  p34: { name: { ar: 'طعام جاف للجراء الصغيرة', en: 'Dry Food for Young Puppies' }, desc: { ar: 'يدعم العظام والنمو السليم.', en: 'Supports bones and healthy growth.' } },
  p35: { name: { ar: 'طعام رطب للجراء بالنكهة المختلطة', en: 'Mixed Flavor Wet Puppy Food' }, desc: { ar: 'سهل المضغ ومناسب للجراء.', en: 'Soft texture for easy chewing.' } },
  p36: { name: { ar: 'لعبة عض للجراء', en: 'Chew Toy for Puppies' }, desc: { ar: 'مادة آمنة تساعد على التسنين.', en: 'Safe material that helps with teething.' } },
  p37: { name: { ar: 'حزام تدريب للكلاب البالغة', en: 'Training Harness for Adult Dogs' }, desc: { ar: 'تحكم أفضل أثناء المشي اليومي.', en: 'Better control during daily walks.' } },
  p38: { name: { ar: 'طعام جاف بروتين عالي للكلاب', en: 'High-Protein Dry Dog Food' }, desc: { ar: 'دعم الكتلة العضلية والنشاط اليومي.', en: 'Supports muscle mass and daily energy.' } }
};

export function getBrands() {
  return brands.map((brand) => ({ value: brand, label: brandLabels[brand] || { ar: brand, en: brand } }));
}

export function getAnimalTypes() {
  return animalTypes.map((item) => ({
    ...item,
    name: animalTypeLabels[item.id] || { ar: item.name, en: item.name }
  }));
}

export function getCategories() {
  return categories.map((item) => ({
    ...item,
    name: categoryLocalization[item.id]?.name || { ar: item.name, en: item.name }
  }));
}

export function getDetailedFoodCategories() {
  return detailedFoodCategories.map((item) => ({
    ...item,
    name: detailedLocalization[item.id]?.name || { ar: item.name, en: item.name }
  }));
}

export function getProducts() {
  return products.map((item) => ({
    ...item,
    brand: brandLabels[item.brand] || { ar: item.brand, en: item.brand },
    name: productLocalization[item.id]?.name || { ar: item.name, en: item.name },
    desc: productLocalization[item.id]?.desc || { ar: item.desc, en: item.desc }
  }));
}
