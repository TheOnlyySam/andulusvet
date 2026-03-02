import React, { useContext, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandChip from '../components/BrandChip';
import { AppContext } from '../context/AppContext';
import { colors } from '../theme/colors';

function addMonths(baseDate, months) {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

function buildCatPlan(birthDate, mode) {
  const plan = [
    { vaccineName: 'PCH', date: addMonths(birthDate, 2), notes: 'أول جرعة بعمر شهرين.' },
    { vaccineName: 'PCH', date: addMonths(birthDate, 3), notes: 'الجرعة الثانية بعد شهر.' },
    { vaccineName: 'Rabies', date: addMonths(birthDate, 4), notes: 'جرعة السعار بعد شهر من الثانية.' },
    { vaccineName: 'جرعة ديدان', date: addMonths(birthDate, 2), notes: 'بدء جرع الديدان من عمر شهرين.' },
    { vaccineName: 'جرعة ديدان', date: addMonths(birthDate, 5), notes: 'متابعة دورية لجرع الديدان.' },
    { vaccineName: 'جرعة ديدان', date: addMonths(birthDate, 8), notes: 'متابعة دورية لجرع الديدان.' },
    { vaccineName: 'جرعة ديدان', date: addMonths(birthDate, 11), notes: 'متابعة دورية لجرع الديدان.' }
  ];

  if (mode === 'cat_6m') {
    plan.push(
      {
        vaccineName: 'PCH',
        date: addMonths(birthDate, 10),
        notes: 'بعد 6 أشهر من جرعة السعار.'
      },
      {
        vaccineName: 'PCH + Rabies',
        date: addMonths(birthDate, 16),
        notes: 'بعد 6 أشهر من جرعة PCH السابقة.'
      }
    );
  } else {
    plan.push({
      vaccineName: 'PCHR',
      date: addMonths(birthDate, 16),
      notes: 'جرعة سنوية مجمعة.'
    });
  }

  return plan;
}

function buildDogPlan(birthDate) {
  const first = addDays(birthDate, 45);
  const second = addDays(first, 20);
  const rabies = addMonths(second, 2);

  const plan = [
    { vaccineName: 'PD', date: first, notes: 'أول جرعة بعمر شهر ونصف.' },
    { vaccineName: 'PHDDI', date: second, notes: 'الجرعة الثانية بعد 20 يوم.' },
    { vaccineName: 'Rabies', date: rabies, notes: 'جرعة السعار بعد شهرين من PHDDI.' }
  ];

  for (let age = 1; age <= 5; age += 1) {
    plan.push({
      vaccineName: 'جرعة سنوية',
      date: addMonths(birthDate, age * 12),
      notes: 'تذكير سنوي حتى عمر 5 سنوات.'
    });
  }

  [8, 11, 14].forEach((age) => {
    plan.push({
      vaccineName: 'جرعة كل 3 سنوات',
      date: addMonths(birthDate, age * 12),
      notes: 'بعد عمر 5 سنوات تصبح كل 3 سنوات.'
    });
  });

  return plan;
}

export default function PetsVaccinesScreen() {
  const { vaccineBook, addVaccineRecord, addVaccinePlan } = useContext(AppContext);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('cat');
  const [catMode, setCatMode] = useState('cat_6m');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [manualVaccineName, setManualVaccineName] = useState('');
  const [manualDate, setManualDate] = useState(new Date(Date.now() + 86400000));
  const [showManualPicker, setShowManualPicker] = useState(false);

  const generatedPlan = useMemo(() => {
    if (petType === 'cat') return buildCatPlan(birthDate, catMode);
    return buildDogPlan(birthDate);
  }, [birthDate, catMode, petType]);

  const savePlan = async () => {
    if (!petName.trim()) {
      Alert.alert('بيانات ناقصة', 'يرجى إدخال اسم الحيوان.');
      return;
    }

    try {
      const records = generatedPlan.map((item) => ({
        petName: petName.trim(),
        petType,
        vaccineName: item.vaccineName,
        dateIso: item.date.toISOString(),
        notes: item.notes
      }));

      await addVaccinePlan(records);
      Alert.alert('تم إنشاء الخطة', 'تمت إضافة خطة اللقاحات وجدولة التذكيرات تلقائيا.');
    } catch (e) {
      Alert.alert('تعذر الحفظ', 'تحقق من إذن الإشعارات في الجهاز.');
    }
  };

  const saveManual = async () => {
    if (!petName.trim() || !manualVaccineName.trim()) {
      Alert.alert('بيانات ناقصة', 'يرجى إدخال اسم الحيوان واسم اللقاح.');
      return;
    }

    try {
      await addVaccineRecord({
        petName: petName.trim(),
        petType,
        vaccineName: manualVaccineName.trim(),
        dateIso: manualDate.toISOString(),
        notes: 'إدخال يدوي'
      });
      setManualVaccineName('');
      setManualDate(new Date(Date.now() + 86400000));
      Alert.alert('تم الحفظ', 'تمت إضافة الجرعة اليدوية وجدولة التذكير.');
    } catch (e) {
      Alert.alert('تعذر الحفظ', 'تحقق من إذن الإشعارات في الجهاز.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>الحيوانات واللقاحات</Text>
      <Text style={styles.subtitle}>دفتر رقمي تلقائي للقطط والكلاب + إدخال يدوي لأي جرعة</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={styles.formCard}>
          <Text style={styles.label}>اسم الحيوان</Text>
          <TextInput
            style={styles.input}
            value={petName}
            onChangeText={setPetName}
            placeholder="مثال: لولو"
            placeholderTextColor="#8f99b0"
            textAlign="right"
          />

          <Text style={styles.label}>نوع الحيوان للخطة</Text>
          <FlatList
            horizontal
            inverted
            data={[
              { id: 'cat', label: 'قطط' },
              { id: 'dog', label: 'كلاب' }
            ]}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => (
              <BrandChip label={item.label} active={petType === item.id} onPress={() => setPetType(item.id)} />
            )}
          />

          <Text style={styles.label}>تاريخ الميلاد</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowBirthPicker(true)}>
            <Text style={styles.dateTxt}>{birthDate.toLocaleDateString('ar-IQ')}</Text>
          </TouchableOpacity>

          {showBirthPicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowBirthPicker(Platform.OS === 'ios');
                if (selectedDate) setBirthDate(selectedDate);
              }}
            />
          )}

          {petType === 'cat' && (
            <>
              <Text style={styles.label}>بروتوكول القطط</Text>
              <FlatList
                horizontal
                inverted
                data={[
                  { id: 'cat_6m', label: 'نظام كل 6 أشهر' },
                  { id: 'cat_yearly', label: 'نظام سنوي PCHR' }
                ]}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
                renderItem={({ item }) => (
                  <BrandChip
                    label={item.label}
                    active={catMode === item.id}
                    onPress={() => setCatMode(item.id)}
                  />
                )}
              />
            </>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={savePlan}>
            <Text style={styles.saveTxt}>إنشاء خطة اللقاحات التلقائية</Text>
          </TouchableOpacity>

          <Text style={styles.helper}>
            الخطة مبنية على التعليمات التي أعطيتها، ومواعيدها محسوبة تلقائيا من تاريخ الميلاد.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>إضافة جرعة يدوية</Text>

          <Text style={styles.label}>اسم اللقاح</Text>
          <TextInput
            style={styles.input}
            value={manualVaccineName}
            onChangeText={setManualVaccineName}
            placeholder="مثال: Rabies"
            placeholderTextColor="#8f99b0"
            textAlign="right"
          />

          <Text style={styles.label}>موعد الجرعة</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowManualPicker(true)}>
            <Text style={styles.dateTxt}>{manualDate.toLocaleString('ar-IQ')}</Text>
          </TouchableOpacity>

          {showManualPicker && (
            <DateTimePicker
              value={manualDate}
              mode="datetime"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowManualPicker(Platform.OS === 'ios');
                if (selectedDate) setManualDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.saveBtnAlt} onPress={saveManual}>
            <Text style={styles.saveTxt}>حفظ الجرعة اليدوية</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>معاينة الخطة</Text>
        {generatedPlan.map((item, idx) => (
          <View key={`${item.vaccineName}_${idx}`} style={styles.previewCard}>
            <Text style={styles.recordLine}>الجرعة: {item.vaccineName}</Text>
            <Text style={styles.recordLine}>الموعد: {item.date.toLocaleDateString('ar-IQ')}</Text>
            <Text style={styles.recordLine}>{item.notes}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>سجل اللقاحات</Text>
        {!vaccineBook.length && <Text style={styles.empty}>لا يوجد سجل حتى الآن.</Text>}

        {vaccineBook.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <Text style={styles.recordLine}>الحيوان: {record.petName}</Text>
            <Text style={styles.recordLine}>اللقاح: {record.vaccineName}</Text>
            <Text style={styles.recordLine}>الموعد: {new Date(record.dateIso).toLocaleString('ar-IQ')}</Text>
            {record.notes ? <Text style={styles.recordLine}>ملاحظة: {record.notes}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.secondary,
    textAlign: 'right',
    marginTop: 4
  },
  subtitle: {
    marginTop: 4,
    color: colors.muted,
    textAlign: 'right',
    marginBottom: 12
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12
  },
  label: {
    textAlign: 'right',
    color: colors.secondary,
    marginBottom: 6,
    marginTop: 8,
    fontWeight: '700'
  },
  chipRow: {
    paddingVertical: 8
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.text,
    backgroundColor: '#fff'
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff8df'
  },
  dateTxt: {
    textAlign: 'right',
    color: colors.text,
    fontWeight: '700'
  },
  saveBtn: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  saveBtnAlt: {
    marginTop: 14,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  saveTxt: {
    color: colors.secondary,
    fontWeight: '900'
  },
  helper: {
    marginTop: 8,
    textAlign: 'right',
    color: colors.muted,
    fontSize: 12
  },
  sectionTitle: {
    marginTop: 8,
    textAlign: 'right',
    color: colors.secondary,
    fontWeight: '900',
    fontSize: 18
  },
  previewCard: {
    marginTop: 8,
    backgroundColor: '#fffdf3',
    borderWidth: 1,
    borderColor: '#f5dd92',
    borderRadius: 12,
    padding: 10
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.muted
  },
  recordCard: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12
  },
  recordLine: {
    textAlign: 'right',
    color: colors.text,
    marginBottom: 4
  }
});
