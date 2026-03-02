export const brands = [
  'رويال كانين',
  'بورينا',
  'هيلز',
  'فيت لايف',
  'بي فارما',
  'إكو فيت',
  'جرين فارم',
  'هاي بيت'
];

export const animalTypes = [
  { id: 'cat', name: 'قطط' },
  { id: 'dog', name: 'كلاب' },
  { id: 'bird', name: 'طيور' },
  { id: 'cattle', name: 'مواشي' },
  { id: 'horse', name: 'خيول' }
];

export const lifeStageOptions = [
  { id: 'kitten', name: 'kitten', animalType: 'cat' },
  { id: 'cat', name: 'cat', animalType: 'cat' },
  { id: 'puppy', name: 'puppy', animalType: 'dog' },
  { id: 'dog', name: 'dog', animalType: 'dog' }
];

export const detailedFoodCategories = [
  {
    id: 'cat_food',
    name: 'طعام القطط',
    animalType: 'cat',
    image:
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dog_food',
    name: 'طعام الكلاب',
    animalType: 'dog',
    image:
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80'
  }
];

export const categories = [
  {
    id: 'c1',
    name: 'أطعمة جافة',
    image:
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=1200&q=80',
    animalTypes: ['cat', 'dog', 'bird', 'cattle', 'horse']
  },
  {
    id: 'c2',
    name: 'أطعمة رطبة',
    image:
      'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=1200&q=80',
    animalTypes: ['cat', 'dog']
  },
  {
    id: 'c3',
    name: 'فيتامينات',
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    animalTypes: ['cat', 'dog', 'bird', 'cattle', 'horse']
  },
  {
    id: 'c4',
    name: 'مستلزمات العناية',
    image:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80',
    animalTypes: ['cat', 'dog', 'horse']
  },
  {
    id: 'c5',
    name: 'أدوية بيطرية',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    animalTypes: ['cat', 'dog', 'bird', 'cattle', 'horse']
  }
];

export const products = [
  {
    id: 'p1',
    name: 'طعام قطط جاف ممتاز',
    brand: 'رويال كانين',
    categoryId: 'c1',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 24500,
    image:
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=80',
    desc: 'تركيبة متوازنة لدعم صحة القطط اليومية.'
  },
  {
    id: 'p2',
    name: 'طعام كلاب رطب بالدجاج',
    brand: 'بورينا',
    categoryId: 'c2',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 18500,
    image:
      'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?auto=format&fit=crop&w=1200&q=80',
    desc: 'وجبة رطبة شهية وغنية بالبروتين.'
  },
  {
    id: 'p3',
    name: 'فيتامين دعم المناعة للطيور',
    brand: 'بي فارما',
    categoryId: 'c3',
    animalType: 'bird',
    price: 15000,
    image:
      'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1200&q=80',
    desc: 'مكمل غذائي يومي مناسب لطيور الزينة.'
  },
  {
    id: 'p4',
    name: 'شامبو علاجي للحساسية',
    brand: 'فيت لايف',
    categoryId: 'c4',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 22000,
    image:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    desc: 'لطيف على الجلد وفعال ضد التهيج.'
  },
  {
    id: 'p5',
    name: 'مضاد طفيليات للمواشي',
    brand: 'هيلز',
    categoryId: 'c5',
    animalType: 'cattle',
    price: 27000,
    image:
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
    desc: 'يساعد في الوقاية من الطفيليات الداخلية للمواشي.'
  },
  {
    id: 'p6',
    name: 'طعام جاف للجراء',
    brand: 'رويال كانين',
    categoryId: 'c1',
    animalType: 'dog',
    lifeStage: 'puppy',
    price: 26000,
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    desc: 'مصمم خصيصا لنمو الجراء الصحي.'
  },
  {
    id: 'p7',
    name: 'طعام متوازن للكناري',
    brand: 'بورينا',
    categoryId: 'c1',
    animalType: 'bird',
    price: 12000,
    image:
      'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1200&q=80',
    desc: 'خلطة حبوب طبيعية لدعم نشاط الطيور.'
  },
  {
    id: 'p8',
    name: 'مكمل كالسيوم للقطط',
    brand: 'بي فارما',
    categoryId: 'c3',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 17500,
    image:
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=80',
    desc: 'يدعم صحة العظام والأسنان للقطط.'
  },
  {
    id: 'p9',
    name: 'علف خيول عالي الطاقة',
    brand: 'جرين فارم',
    categoryId: 'c1',
    animalType: 'horse',
    price: 42000,
    image:
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80',
    desc: 'مناسب للخيول الرياضية وزيادة التحمل.'
  },
  {
    id: 'p10',
    name: 'فيتامين مفاصل للخيول',
    brand: 'إكو فيت',
    categoryId: 'c3',
    animalType: 'horse',
    price: 36000,
    image:
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80',
    desc: 'دعم مرونة المفاصل وتقليل الإجهاد.'
  },
  {
    id: 'p11',
    name: 'دواء طفيليات للخيول',
    brand: 'هاي بيت',
    categoryId: 'c5',
    animalType: 'horse',
    price: 39000,
    image:
      'https://images.unsplash.com/photo-1494256997604-768d1f608cac?auto=format&fit=crop&w=1200&q=80',
    desc: 'حماية دورية من الطفيليات الداخلية.'
  },
  {
    id: 'p12',
    name: 'طعام رطب للقطط الصغيرة',
    brand: 'هيلز',
    categoryId: 'c2',
    animalType: 'cat',
    lifeStage: 'kitten',
    price: 16000,
    image:
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1200&q=80',
    desc: 'قوام ناعم وسهل الهضم للقطط الصغيرة.'
  },
  {
    id: 'p13',
    name: 'حبوب تنظيف أسنان الكلاب',
    brand: 'فيت لايف',
    categoryId: 'c4',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 14500,
    image:
      'https://images.unsplash.com/photo-1601758003122-68cfb3b94f1f?auto=format&fit=crop&w=1200&q=80',
    desc: 'تساعد على تقليل الترسبات وتحسين رائحة الفم.'
  },
  {
    id: 'p14',
    name: 'شامبو لطيف للقطط',
    brand: 'إكو فيت',
    categoryId: 'c4',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 13000,
    image:
      'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&w=1200&q=80',
    desc: 'مناسب للبشرة الحساسة وفراء لامع.'
  },
  {
    id: 'p15',
    name: 'مقوي مناعة للمواشي',
    brand: 'بي فارما',
    categoryId: 'c3',
    animalType: 'cattle',
    price: 33500,
    image:
      'https://images.unsplash.com/photo-1613503326927-5f6ab2a0c2e2?auto=format&fit=crop&w=1200&q=80',
    desc: 'تركيبة مركزة لرفع مقاومة الأمراض.'
  },
  {
    id: 'p16',
    name: 'علف مواشي جاف ممتاز',
    brand: 'جرين فارم',
    categoryId: 'c1',
    animalType: 'cattle',
    price: 40000,
    image:
      'https://images.unsplash.com/photo-1500595046743-ee35f67b4bd4?auto=format&fit=crop&w=1200&q=80',
    desc: 'دعم النمو والإنتاج بكفاءة.'
  },
  {
    id: 'p17',
    name: 'قطرات فيتامين للطيور',
    brand: 'هاي بيت',
    categoryId: 'c3',
    animalType: 'bird',
    price: 11000,
    image:
      'https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?auto=format&fit=crop&w=1200&q=80',
    desc: 'تعزيز النشاط والريش الصحي.'
  },
  {
    id: 'p18',
    name: 'مضاد فطريات جلدي للكلاب',
    brand: 'هيلز',
    categoryId: 'c5',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 21000,
    image:
      'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1200&q=80',
    desc: 'علاج موضعي سريع وفعال.'
  },
  {
    id: 'p19',
    name: 'طعام قطط بالغين متكامل',
    brand: 'بورينا',
    categoryId: 'c1',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 23000,
    image:
      'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=1200&q=80',
    desc: 'تغذية يومية متوازنة للقطط البالغة.'
  },
  {
    id: 'p20',
    name: 'طعام رطب للكلاب البالغة',
    brand: 'رويال كانين',
    categoryId: 'c2',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 19500,
    image:
      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=1200&q=80',
    desc: 'يدعم الهضم وصحة العضلات.'
  },
  {
    id: 'p21',
    name: 'مضاد ديدان للقطط',
    brand: 'فيت لايف',
    categoryId: 'c5',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 14000,
    image:
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80',
    desc: 'جرعة سهلة للاستخدام الدوري.'
  },
  {
    id: 'p22',
    name: 'بخاخ عناية حوافر الخيول',
    brand: 'إكو فيت',
    categoryId: 'c4',
    animalType: 'horse',
    price: 28500,
    image:
      'https://images.unsplash.com/photo-1518861839461-74d53410c191?auto=format&fit=crop&w=1200&q=80',
    desc: 'حماية يومية وترطيب للحوافر.'
  },
  {
    id: 'p23',
    name: 'طعام جاف للكلاب الحساسة',
    brand: 'هاي بيت',
    categoryId: 'c1',
    animalType: 'dog',
    lifeStage: 'puppy',
    price: 27500,
    image:
      'https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=1200&q=80',
    desc: 'تركيبة خالية من المهيجات الشائعة.'
  },
  {
    id: 'p24',
    name: 'دواء تنفسي للطيور',
    brand: 'بي فارما',
    categoryId: 'c5',
    animalType: 'bird',
    price: 17000,
    image:
      'https://images.unsplash.com/photo-1578942331303-6281f9c7db84?auto=format&fit=crop&w=1200&q=80',
    desc: 'دعم الجهاز التنفسي للطيور الأليفة.'
  },
  {
    id: 'p25',
    name: 'مكعبات أملاح معدنية للمواشي',
    brand: 'جرين فارم',
    categoryId: 'c3',
    animalType: 'cattle',
    price: 31500,
    image:
      'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1200&q=80',
    desc: 'تعويض المعادن الأساسية بشكل يومي.'
  },
  {
    id: 'p26',
    name: 'معجون طاقة للخيول',
    brand: 'رويال كانين',
    categoryId: 'c3',
    animalType: 'horse',
    price: 33500,
    image:
      'https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?auto=format&fit=crop&w=1200&q=80',
    desc: 'رفع سريع للطاقة قبل التمرين.'
  },
  {
    id: 'p27',
    name: 'طعام جاف فاخر للقطط الصغيرة',
    brand: 'رويال كانين',
    categoryId: 'c1',
    animalType: 'cat',
    lifeStage: 'kitten',
    price: 20500,
    image:
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1200&q=80',
    desc: 'حبيبات صغيرة مناسبة للهضم السهل.'
  },
  {
    id: 'p28',
    name: 'طعام رطب بالسلمون للقطط الصغيرة',
    brand: 'بورينا',
    categoryId: 'c2',
    animalType: 'cat',
    lifeStage: 'kitten',
    price: 16800,
    image:
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=80',
    desc: 'دعم النمو الصحي في الأشهر الأولى.'
  },
  {
    id: 'p29',
    name: 'ليتر قطط متكتل عالي الامتصاص',
    brand: 'هاي بيت',
    categoryId: 'c4',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 12500,
    image:
      'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=1200&q=80',
    desc: 'تحكم ممتاز بالروائح وسهل التنظيف.'
  },
  {
    id: 'p30',
    name: 'لعبة كرات للقطط النشيطة',
    brand: 'إكو فيت',
    categoryId: 'c4',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 9000,
    image:
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=1200&q=80',
    desc: 'تحفز الحركة اليومية وتقلل الملل.'
  },
  {
    id: 'p31',
    name: 'طوق قطط مريح قابل للتعديل',
    brand: 'فيت لايف',
    categoryId: 'c4',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 11000,
    image:
      'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?auto=format&fit=crop&w=1200&q=80',
    desc: 'خفيف ومناسب للاستخدام اليومي.'
  },
  {
    id: 'p32',
    name: 'طعام جاف للقطط البالغة الحساسة',
    brand: 'هيلز',
    categoryId: 'c1',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 25500,
    image:
      'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=1200&q=80',
    desc: 'تركيبة لطيفة على المعدة والبشرة.'
  },
  {
    id: 'p33',
    name: 'طعام رطب لقطط بالغة بالدجاج',
    brand: 'رويال كانين',
    categoryId: 'c2',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 17000,
    image:
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1200&q=80',
    desc: 'وجبة لذيذة غنية بالبروتين.'
  },
  {
    id: 'p34',
    name: 'طعام جاف للجراء الصغيرة',
    brand: 'بورينا',
    categoryId: 'c1',
    animalType: 'dog',
    lifeStage: 'puppy',
    price: 23500,
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    desc: 'يدعم العظام والنمو السليم.'
  },
  {
    id: 'p35',
    name: 'طعام رطب للجراء بالنكهة المختلطة',
    brand: 'هاي بيت',
    categoryId: 'c2',
    animalType: 'dog',
    lifeStage: 'puppy',
    price: 15500,
    image:
      'https://images.unsplash.com/photo-1601758003122-68cfb3b94f1f?auto=format&fit=crop&w=1200&q=80',
    desc: 'سهل المضغ ومناسب للجراء.'
  },
  {
    id: 'p36',
    name: 'لعبة عض للجراء',
    brand: 'إكو فيت',
    categoryId: 'c4',
    animalType: 'dog',
    lifeStage: 'puppy',
    price: 9800,
    image:
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80',
    desc: 'مادة آمنة تساعد على التسنين.'
  },
  {
    id: 'p37',
    name: 'حزام تدريب للكلاب البالغة',
    brand: 'فيت لايف',
    categoryId: 'c4',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 14500,
    image:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    desc: 'تحكم أفضل أثناء المشي اليومي.'
  },
  {
    id: 'p38',
    name: 'طعام جاف بروتين عالي للكلاب',
    brand: 'هيلز',
    categoryId: 'c1',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 28500,
    image:
      'https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=1200&q=80',
    desc: 'مناسب للكلاب النشطة.'
  },
  {
    id: 'p39',
    name: 'طعام رطب للكلاب بنكهة اللحم',
    brand: 'رويال كانين',
    categoryId: 'c2',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 17800,
    image:
      'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=1200&q=80',
    desc: 'ترطيب ممتاز وطعم محبب.'
  },
  {
    id: 'p40',
    name: 'عرض باقة قطط صغيرة (جاف + رطب)',
    brand: 'بورينا',
    categoryId: 'c1',
    animalType: 'cat',
    lifeStage: 'kitten',
    price: 17900,
    image:
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=80',
    desc: 'باقة اقتصادية للمرحلة الأولى.'
  },
  {
    id: 'p41',
    name: 'عرض باقة جراء (أكل + لعبة)',
    brand: 'هاي بيت',
    categoryId: 'c1',
    animalType: 'dog',
    lifeStage: 'puppy',
    price: 17600,
    image:
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80',
    desc: 'خيار اقتصادي للجراء.'
  },
  {
    id: 'p42',
    name: 'علف خيول يومي متوازن',
    brand: 'جرين فارم',
    categoryId: 'c1',
    animalType: 'horse',
    price: 38500,
    image:
      'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1200&q=80',
    desc: 'تغذية أساسية يومية للخيول.'
  },
  {
    id: 'p43',
    name: 'مكمل فيتامينات للخيول السريعة',
    brand: 'بي فارما',
    categoryId: 'c3',
    animalType: 'horse',
    price: 34500,
    image:
      'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?auto=format&fit=crop&w=1200&q=80',
    desc: 'تحسين الأداء والتحمل.'
  },
  {
    id: 'p44',
    name: 'عدة تنظيف خيول كاملة',
    brand: 'إكو فيت',
    categoryId: 'c4',
    animalType: 'horse',
    price: 29000,
    image:
      'https://images.unsplash.com/photo-1518861839461-74d53410c191?auto=format&fit=crop&w=1200&q=80',
    desc: 'فرش وأدوات للعناية اليومية.'
  },
  {
    id: 'p45',
    name: 'دواء ديدان للمواشي',
    brand: 'هاي بيت',
    categoryId: 'c5',
    animalType: 'cattle',
    price: 29900,
    image:
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    desc: 'مخصص للبرنامج الوقائي الدوري.'
  },
  {
    id: 'p46',
    name: 'علف تسمين للمواشي',
    brand: 'جرين فارم',
    categoryId: 'c1',
    animalType: 'cattle',
    price: 41500,
    image:
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80',
    desc: 'تركيبة داعمة لزيادة الوزن.'
  },
  {
    id: 'p47',
    name: 'مكمل أملاح للمواشي',
    brand: 'بي فارما',
    categoryId: 'c3',
    animalType: 'cattle',
    price: 22500,
    image:
      'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1200&q=80',
    desc: 'يدعم توازن العناصر المعدنية.'
  },
  {
    id: 'p48',
    name: 'قفص لعب للقطط الصغيرة',
    brand: 'فيت لايف',
    categoryId: 'c4',
    animalType: 'cat',
    lifeStage: 'kitten',
    price: 16500,
    image:
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=80',
    desc: 'أداة ترفيه وتدريب للحركة.'
  },
  {
    id: 'p49',
    name: 'صينية ليتر كبيرة للقطط',
    brand: 'إكو فيت',
    categoryId: 'c4',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 17200,
    image:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    desc: 'تصميم عملي مضاد للتسريب.'
  },
  {
    id: 'p50',
    name: 'عرض قطط بالغة (رطب + فيتامين)',
    brand: 'هيلز',
    categoryId: 'c2',
    animalType: 'cat',
    lifeStage: 'cat',
    price: 17800,
    image:
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1200&q=80',
    desc: 'عرض محدود لتحسين التغذية.'
  },
  {
    id: 'p51',
    name: 'عرض كلاب بالغة (جاف + شامبو)',
    brand: 'رويال كانين',
    categoryId: 'c1',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 17950,
    image:
      'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1200&q=80',
    desc: 'باقة رعاية متكاملة بسعر خاص.'
  },
  {
    id: 'p52',
    name: 'أكل جاف اقتصادي للجراء',
    brand: 'هاي بيت',
    categoryId: 'c1',
    animalType: 'dog',
    lifeStage: 'puppy',
    price: 16200,
    image:
      'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=1200&q=80',
    desc: 'خيار يومي بسعر مناسب.'
  },
  {
    id: 'p53',
    name: 'أكل رطب اقتصادي للقطط الصغيرة',
    brand: 'بورينا',
    categoryId: 'c2',
    animalType: 'cat',
    lifeStage: 'kitten',
    price: 14900,
    image:
      'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?auto=format&fit=crop&w=1200&q=80',
    desc: 'وجبة رطبة مغذية وسعر مناسب.'
  },
  {
    id: 'p54',
    name: 'مجموعة ألعاب كلاب مطاطية',
    brand: 'إكو فيت',
    categoryId: 'c4',
    animalType: 'dog',
    lifeStage: 'dog',
    price: 13800,
    image:
      'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?auto=format&fit=crop&w=1200&q=80',
    desc: 'تحمل عالي للعب اليومي.'
  },
  {
    id: 'p55',
    name: 'مكمل بروتين للخيول',
    brand: 'جرين فارم',
    categoryId: 'c3',
    animalType: 'horse',
    price: 35200,
    image:
      'https://images.unsplash.com/photo-1494256997604-768d1f608cac?auto=format&fit=crop&w=1200&q=80',
    desc: 'مفيد خلال فترات التدريب.'
  },
  {
    id: 'p56',
    name: 'عرض مواشي (علف + فيتامين)',
    brand: 'بي فارما',
    categoryId: 'c1',
    animalType: 'cattle',
    price: 17900,
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    desc: 'عرض مؤقت لدعم الإنتاج.'
  }
];
