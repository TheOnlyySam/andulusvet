import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AppContext } from '../context/AppContext';
import { colors } from '../theme/colors';

function addMonths(baseDate, months) {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ar-IQ');
}

const PROTOCOLS = [
  {
    id: 'cat_pch_korea',
    petType: 'cat',
    label: 'قطط - PCH (كوريا)',
    steps: [
      { vaccineName: 'PCH', relation: { type: 'reference', months: 0 }, hint: 'الجرعة الأولى بتاريخ الجلب' },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 1 }, hint: 'بعد شهر' },
      { vaccineName: 'Rabies', relation: { type: 'prev', months: 1 }, hint: 'بعد شهر' },
      { vaccineName: 'PCH Booster', relation: { type: 'index', index: 1, months: 6 }, hint: 'بعد 6 أشهر من جرعة PCH السابقة' },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 12 }, hint: 'بعد سنة' }
    ]
  },
  {
    id: 'cat_pch_netherlands',
    petType: 'cat',
    label: 'قطط - PCH (هولندا)',
    steps: [
      { vaccineName: 'PCH', relation: { type: 'reference', months: 0 }, hint: 'الجرعة الأولى بتاريخ الجلب' },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 1 }, hint: 'بعد شهر' },
      { vaccineName: 'Rabies', relation: { type: 'prev', months: 1 }, hint: 'بعد شهر' },
      { vaccineName: 'PCH Booster', relation: { type: 'index', index: 1, months: 6 }, hint: 'بعد 6 أشهر من جرعة PCH السابقة' },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 12 }, hint: 'بعد سنة' }
    ]
  },
  {
    id: 'cat_pch_czech',
    petType: 'cat',
    label: 'قطط - PCH (التشيك)',
    steps: [
      { vaccineName: 'PCH', relation: { type: 'reference', months: 0 }, hint: 'الجرعة الأولى بتاريخ الجلب' },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 1 }, hint: 'بعد شهر' },
      { vaccineName: 'Rabies', relation: { type: 'prev', months: 1 }, hint: 'بعد شهر' },
      { vaccineName: 'PCH Booster', relation: { type: 'index', index: 1, months: 6 }, hint: 'بعد 6 أشهر من جرعة PCH السابقة' },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 12 }, hint: 'بعد سنة' }
    ]
  },
  {
    id: 'cat_pchr',
    petType: 'cat',
    label: 'قطط - PCHR (التشيك)',
    steps: [
      { vaccineName: 'PCHR', relation: { type: 'reference', months: 0 }, hint: 'الجرعة الأولى بتاريخ الجلب' },
      { vaccineName: 'PCHR', relation: { type: 'prev', months: 1 }, hint: 'بعد شهر' },
      { vaccineName: 'PCHR', relation: { type: 'prev', months: 12 }, hint: 'بعد سنة' }
    ]
  },
  {
    id: 'dog_dhppi_lepto',
    petType: 'dog',
    label: 'كلاب - DHPPi + Lepto (هولندا)',
    steps: [
      { vaccineName: 'DHPPi + Lepto', relation: { type: 'reference', months: 0 }, hint: 'الجرعة الأولى بتاريخ الجلب' },
      { vaccineName: 'DHPPi', relation: { type: 'prev', months: 1 }, hint: 'بعد شهر' },
      { vaccineName: 'Rabies', relation: { type: 'prev', months: 1 }, hint: 'بعد شهر' },
      { vaccineName: 'DHPPi + Lepto', relation: { type: 'prev', months: 6 }, hint: 'بعد 6 أشهر' },
      { vaccineName: 'DHPPi + Lepto + Rabies', relation: { type: 'prev', months: 12 }, hint: 'جرعة سنوية' },
      { vaccineName: 'DHPPi + Lepto + Rabies', relation: { type: 'after5', months: 36 }, hint: 'كل 3 سنوات بعد عمر 5 سنوات' }
    ]
  }
];

function buildSchedule(protocol, referenceDate, receivedByIndex) {
  if (!protocol) return [];
  const rows = [];

  for (let i = 0; i < protocol.steps.length; i += 1) {
    const step = protocol.steps[i];
    let baseDate = new Date(referenceDate);

    if (step.relation.type === 'prev' && i > 0) {
      baseDate = rows[i - 1].effectiveDate;
    }

    if (step.relation.type === 'index') {
      baseDate = rows[step.relation.index]?.effectiveDate || new Date(referenceDate);
    }

    if (step.relation.type === 'after5') {
      const fromAge5 = addMonths(referenceDate, 60);
      const fromPrev = i > 0 ? addMonths(rows[i - 1].effectiveDate, step.relation.months) : fromAge5;
      const plannedDate = fromPrev.getTime() > fromAge5.getTime() ? fromPrev : fromAge5;
      const receivedDate = receivedByIndex[i] || null;
      rows.push({
        index: i,
        vaccineName: step.vaccineName,
        hint: step.hint,
        plannedDate,
        receivedDate,
        effectiveDate: receivedDate || plannedDate
      });
      continue;
    }

    const plannedDate = addMonths(baseDate, step.relation.months);
    const receivedDate = receivedByIndex[i] || null;
    rows.push({
      index: i,
      vaccineName: step.vaccineName,
      hint: step.hint,
      plannedDate,
      receivedDate,
      effectiveDate: receivedDate || plannedDate
    });
  }

  return rows;
}

export default function PetsVaccinesScreen() {
  const { isLoggedIn, currentUser, vaccineBooksForUser, createVaccineBook, updateVaccineBookRecords } = useContext(AppContext);

  const [view, setView] = useState('list');
  const [selectedBookId, setSelectedBookId] = useState(null);

  const [petName, setPetName] = useState('');
  const [vetName, setVetName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  const [bookAttachment, setBookAttachment] = useState(null);
  const [bookImage, setBookImage] = useState(null);
  const [bringingDate, setBringingDate] = useState(new Date());
  const [petBirthDate, setPetBirthDate] = useState(new Date());
  const [showBringingPicker, setShowBringingPicker] = useState(false);
  const [showBirthPicker, setShowBirthPicker] = useState(false);

  const [protocolId, setProtocolId] = useState(PROTOCOLS[0].id);
  const [showProtocolMenu, setShowProtocolMenu] = useState(false);
  const [receivedByIndex, setReceivedByIndex] = useState({});
  const [activeDoseIndex, setActiveDoseIndex] = useState(null);
  const [detailReceivedByIndex, setDetailReceivedByIndex] = useState({});
  const [detailActiveDoseIndex, setDetailActiveDoseIndex] = useState(null);

  const selectedProtocol = useMemo(
    () => PROTOCOLS.find((item) => item.id === protocolId) || PROTOCOLS[0],
    [protocolId]
  );

  const scheduleRows = useMemo(
    () => buildSchedule(selectedProtocol, bringingDate, receivedByIndex),
    [selectedProtocol, bringingDate, receivedByIndex]
  );

  const selectedBook = useMemo(
    () => vaccineBooksForUser.find((book) => book.id === selectedBookId) || null,
    [vaccineBooksForUser, selectedBookId]
  );

  const startCreate = () => {
    setView('create');
    setSelectedBookId(null);
  };

  const openBookDetails = (bookId) => {
    const book = vaccineBooksForUser.find((item) => item.id === bookId);
    if (book) {
      const byDate = [...(book.records || [])].sort(
        (a, b) => new Date(a.plannedDateIso || a.dateIso).getTime() - new Date(b.plannedDateIso || b.dateIso).getTime()
      );
      const nextMap = {};
      byDate.forEach((dose, idx) => {
        if (dose.receivedDateIso) {
          nextMap[idx] = new Date(dose.receivedDateIso);
        }
      });
      setDetailReceivedByIndex(nextMap);
      setDetailActiveDoseIndex(null);
    }
    setSelectedBookId(bookId);
    setView('detail');
  };

  const resetCreateForm = () => {
    setPetName('');
    setVetName('');
    setOwnerPhone('');
    setOwnerEmail('');
    setBookNotes('');
    setBookAttachment(null);
    setBookImage(null);
    setBringingDate(new Date());
    setPetBirthDate(new Date());
    setProtocolId(PROTOCOLS[0].id);
    setShowProtocolMenu(false);
    setReceivedByIndex({});
    setActiveDoseIndex(null);
  };

  const saveBook = async () => {
    if (!isLoggedIn) {
      Alert.alert('تسجيل الدخول مطلوب', 'يرجى تسجيل الدخول أولاً.');
      return;
    }

    if (!petName.trim() || !vetName.trim()) {
      Alert.alert('بيانات ناقصة', 'يرجى إدخال اسم الحيوان واسم الطبيب البيطري.');
      return;
    }

    const records = scheduleRows.map((row) => ({
      petName: petName.trim(),
      petType: selectedProtocol.petType,
      vaccineName: row.vaccineName,
      dateIso: row.plannedDate.toISOString(),
      plannedDateIso: row.plannedDate.toISOString(),
      receivedDateIso: row.receivedDate ? new Date(row.receivedDate).toISOString() : null,
      notes: row.hint,
      attachments: []
    }));

    const result = await createVaccineBook({
      petName: petName.trim(),
      petType: selectedProtocol.petType,
      referenceDateIso: bringingDate.toISOString(),
      petBirthDateIso: petBirthDate.toISOString(),
      ownerPhone: ownerPhone.trim(),
      ownerEmail: ownerEmail.trim(),
      vetName: vetName.trim(),
      protocol: selectedProtocol.id,
      notes: bookNotes.trim(),
      attachment: bookAttachment,
      image: bookImage,
      records
    });

    if (!result.ok) {
      Alert.alert('تعذر الحفظ', result.message || 'حاول مرة أخرى.');
      return;
    }

    Alert.alert('تم الحفظ', 'تم إنشاء الدفتر بنجاح.');
    resetCreateForm();
    openBookDetails(result.book.id);
  };

  const selectedBookProtocol = useMemo(
    () => (selectedBook ? PROTOCOLS.find((item) => item.id === selectedBook.protocol) || PROTOCOLS[0] : null),
    [selectedBook]
  );

  const detailScheduleRows = useMemo(() => {
    if (!selectedBook || !selectedBookProtocol) return [];
    const baseDate = selectedBook.referenceDateIso ? new Date(selectedBook.referenceDateIso) : new Date();
    return buildSchedule(selectedBookProtocol, baseDate, detailReceivedByIndex);
  }, [selectedBook, selectedBookProtocol, detailReceivedByIndex]);

  const saveDetailDates = async () => {
    if (!selectedBook || !selectedBookProtocol) return;

    const existingRecordsByDate = [...(selectedBook.records || [])].sort(
      (a, b) => new Date(a.plannedDateIso || a.dateIso).getTime() - new Date(b.plannedDateIso || b.dateIso).getTime()
    );

    const nextRecords = detailScheduleRows.map((row, idx) => {
      const old = existingRecordsByDate[idx] || {};
      return {
        ...old,
        petName: selectedBook.petName,
        petType: selectedBook.petType,
        vaccineName: row.vaccineName,
        dateIso: row.plannedDate.toISOString(),
        plannedDateIso: row.plannedDate.toISOString(),
        receivedDateIso: row.receivedDate ? new Date(row.receivedDate).toISOString() : null,
        notes: old.notes || row.hint,
        attachments: old.attachments || []
      };
    });

    const result = await updateVaccineBookRecords({
      bookId: selectedBook.id,
      records: nextRecords
    });

    if (!result.ok) {
      Alert.alert('تعذر الحفظ', result.message || 'حاول مرة أخرى.');
      return;
    }

    Alert.alert('تم التحديث', 'تم تعديل المواعيد وحفظها بنجاح.');
  };

  const pickPdfAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      setBookAttachment({
        name: file.name || 'attachment.pdf',
        uri: file.uri,
        mimeType: file.mimeType || 'application/pdf',
        size: file.size || 0
      });
    } catch (error) {
      Alert.alert('تعذر اختيار الملف', 'حدث خطأ أثناء اختيار ملف PDF.');
    }
  };

  const pickBookImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('إذن مطلوب', 'يرجى السماح بالوصول للصور من إعدادات التطبيق.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8
      });

      if (result.canceled || !result.assets?.length) return;

      const image = result.assets[0];
      setBookImage({
        uri: image.uri,
        width: image.width,
        height: image.height,
        fileName: image.fileName || 'book-image.jpg',
        mimeType: image.mimeType || 'image/jpeg'
      });
    } catch (error) {
      Alert.alert('تعذر اختيار الصورة', 'حدث خطأ أثناء اختيار صورة الدفتر.');
    }
  };

  const exportBookPdf = async () => {
    if (!selectedBook) return;

    const rows = detailScheduleRows
      .map(
        (dose, idx) =>
          `<tr>
            <td>${idx + 1}</td>
            <td>${dose.vaccineName}</td>
            <td>${formatDate(dose.plannedDate)}</td>
            <td>${dose.receivedDate ? formatDate(dose.receivedDate) : '-'}</td>
          </tr>`
      )
      .join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h1 { margin-bottom: 4px; }
            p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f7fc; }
          </style>
        </head>
        <body>
          <h1>AndulusVet - Vaccine Book</h1>
          <p>Pet: ${selectedBook.petName}</p>
          <p>Vet: ${selectedBook.vetName}</p>
          <p>Owner Phone: ${selectedBook.ownerPhone || '-'}</p>
          <p>Owner Email: ${selectedBook.ownerEmail || '-'}</p>
          <p>Pet Birth Date: ${selectedBook.petBirthDateIso ? formatDate(selectedBook.petBirthDateIso) : '-'}</p>
          <p>Bringing Date: ${selectedBook.referenceDateIso ? formatDate(selectedBook.referenceDateIso) : '-'}</p>
          <p>General Notes: ${selectedBook.notes || '-'}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Vaccine</th>
                <th>Planned Date</th>
                <th>Received Date</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const file = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('تم التصدير', `تم إنشاء ملف PDF:\n${file.uri}`);
        return;
      }
      await Sharing.shareAsync(file.uri);
    } catch (error) {
      Alert.alert('تعذر التصدير', 'حدث خطأ أثناء إنشاء ملف PDF.');
    }
  };

  if (view === 'detail' && selectedBook) {

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>تفاصيل الدفتر</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => setView('list')}>
          <Text style={styles.backTxt}>الرجوع إلى الدفاتر</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>معلومات الدفتر</Text>
            <Text style={styles.line}>الحيوان: {selectedBook.petName}</Text>
            <Text style={styles.line}>الطبيب البيطري: {selectedBook.vetName}</Text>
            <Text style={styles.line}>الهاتف: {selectedBook.ownerPhone || '-'}</Text>
            <Text style={styles.line}>البريد الإلكتروني: {selectedBook.ownerEmail || '-'}</Text>
            <Text style={styles.line}>تاريخ ميلاد الحيوان: {selectedBook.petBirthDateIso ? formatDate(selectedBook.petBirthDateIso) : '-'}</Text>
            <Text style={styles.line}>تاريخ الجلب: {selectedBook.referenceDateIso ? formatDate(selectedBook.referenceDateIso) : '-'}</Text>
            <Text style={styles.line}>
              المرفق العام: {selectedBook.attachment?.name || selectedBook.attachment || '-'}
            </Text>
            <Text style={styles.line}>ملاحظات عامة: {selectedBook.notes || '-'}</Text>
            {selectedBook.image?.uri ? (
              <Image source={{ uri: selectedBook.image.uri }} style={styles.bookImage} />
            ) : null}
            <TouchableOpacity style={styles.exportBtn} onPress={exportBookPdf}>
              <Text style={styles.exportTxt}>تصدير الدفتر PDF</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>الجرعات</Text>
            {detailScheduleRows.map((dose, idx) => (
              <View key={`${dose.vaccineName}_${idx}`} style={styles.doseCard}>
                <Text style={styles.doseTitle}>{idx + 1}. {dose.vaccineName}</Text>
                <Text style={styles.line}>الموعد المجدول: {formatDate(dose.plannedDate)}</Text>
                <Text style={styles.line}>التاريخ الفعلي: {dose.receivedDate ? formatDate(dose.receivedDate) : '-'}</Text>
                <View style={styles.inlineRow}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => setDetailActiveDoseIndex(idx)}>
                    <Text style={styles.smallBtnTxt}>
                      {dose.receivedDate ? `تعديل التاريخ: ${formatDate(dose.receivedDate)}` : 'إدخال تاريخ فعلي'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.clearBtn]}
                    onPress={() =>
                      setDetailReceivedByIndex((prev) => {
                        const next = { ...prev };
                        delete next[idx];
                        return next;
                      })
                    }
                  >
                    <Text style={styles.smallBtnTxt}>مسح</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {detailActiveDoseIndex !== null && (
              <DateTimePicker
                value={detailReceivedByIndex[detailActiveDoseIndex] || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setDetailActiveDoseIndex(Platform.OS === 'ios' ? detailActiveDoseIndex : null);
                  if (!selectedDate) return;
                  setDetailReceivedByIndex((prev) => ({
                    ...prev,
                    [detailActiveDoseIndex]: selectedDate
                  }));
                }}
              />
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={saveDetailDates}>
              <Text style={styles.saveTxt}>حفظ التعديلات</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === 'create') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>إنشاء دفتر جديد</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => setView('list')}>
          <Text style={styles.backTxt}>الرجوع إلى الدفاتر</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>بيانات المالك والحيوان</Text>
            <Text style={styles.helper}>المستخدم الحالي: {currentUser?.username || 'غير مسجل'}</Text>

            <Text style={styles.label}>صورة الحيوان</Text>
            <View style={styles.inlineRow}>
              <TouchableOpacity style={styles.smallBtn} onPress={pickBookImage}>
                <Text style={styles.smallBtnTxt}>
                  {bookImage?.fileName ? `تم اختيار: ${bookImage.fileName}` : 'اختيار صورة'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, styles.clearBtn]} onPress={() => setBookImage(null)}>
                <Text style={styles.smallBtnTxt}>مسح</Text>
              </TouchableOpacity>
            </View>
            {bookImage?.uri ? <Image source={{ uri: bookImage.uri }} style={styles.bookImage} /> : null}

            <Text style={styles.label}>اسم الحيوان</Text>
            <TextInput style={styles.input} value={petName} onChangeText={setPetName} placeholder="مثال: لولو" placeholderTextColor="#8f99b0" />

            <Text style={styles.label}>اسم الطبيب البيطري</Text>
            <TextInput style={styles.input} value={vetName} onChangeText={setVetName} placeholder="مثال: د. أحمد" placeholderTextColor="#8f99b0" />

            <Text style={styles.label}>هاتف المالك</Text>
            <TextInput style={styles.input} value={ownerPhone} onChangeText={setOwnerPhone} placeholder="07xx xxx xxxx" placeholderTextColor="#8f99b0" keyboardType="phone-pad" />

            <Text style={styles.label}>البريد الإلكتروني للمالك</Text>
            <TextInput style={styles.input} value={ownerEmail} onChangeText={setOwnerEmail} placeholder="owner@email.com" placeholderTextColor="#8f99b0" autoCapitalize="none" keyboardType="email-address" />

            <Text style={styles.label}>تاريخ ميلاد الحيوان</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowBirthPicker(true)}>
              <Text style={styles.dateTxt}>{formatDate(petBirthDate)}</Text>
            </TouchableOpacity>

            {showBirthPicker && (
              <DateTimePicker
                value={petBirthDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowBirthPicker(Platform.OS === 'ios');
                  if (selectedDate) setPetBirthDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.label}>تاريخ الجلب (الجرعة الأولى تكون بهذا التاريخ بالضبط)</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowBringingPicker(true)}>
              <Text style={styles.dateTxt}>{formatDate(bringingDate)}</Text>
            </TouchableOpacity>

            {showBringingPicker && (
              <DateTimePicker
                value={bringingDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowBringingPicker(Platform.OS === 'ios');
                  if (selectedDate) setBringingDate(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>البروتوكول والمرفقات</Text>
            <Text style={styles.label}>البروتوكول</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowProtocolMenu((prev) => !prev)}>
              <Text style={styles.dropdownTxt}>{selectedProtocol.label}</Text>
            </TouchableOpacity>
            {showProtocolMenu && (
              <View style={styles.dropdownMenu}>
                {PROTOCOLS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.dropdownItem, protocolId === item.id && styles.dropdownItemActive]}
                    onPress={() => {
                      setProtocolId(item.id);
                      setShowProtocolMenu(false);
                      setReceivedByIndex({});
                    }}
                  >
                    <Text style={styles.dropdownItemTxt}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>ملاحظات عامة</Text>
            <TextInput
              style={[styles.input, styles.multiInput]}
              value={bookNotes}
              onChangeText={setBookNotes}
              placeholder="أي ملاحظات عامة"
              placeholderTextColor="#8f99b0"
              multiline
            />

            <Text style={styles.label}>المرفق العام (PDF من الجهاز)</Text>
            <View style={styles.inlineRow}>
              <TouchableOpacity style={styles.smallBtn} onPress={pickPdfAttachment}>
                <Text style={styles.smallBtnTxt}>
                  {bookAttachment?.name ? `تم اختيار: ${bookAttachment.name}` : 'اختيار ملف PDF'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, styles.clearBtn]} onPress={() => setBookAttachment(null)}>
                <Text style={styles.smallBtnTxt}>مسح</Text>
              </TouchableOpacity>
            </View>

          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>الجرعات المجدولة</Text>
            <Text style={styles.helper}>يمكن إدخال تاريخ الجرعة الفعلي لكل جرعة ليتم تعديل الجرعات التالية تلقائيًا.</Text>
            {scheduleRows.map((row) => (
              <View key={row.index} style={styles.doseCard}>
                <Text style={styles.doseTitle}>{row.index + 1}. {row.vaccineName}</Text>
                <Text style={styles.line}>الموعد المجدول: {formatDate(row.plannedDate)}</Text>
                <Text style={styles.line}>{row.hint}</Text>
                <View style={styles.inlineRow}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => setActiveDoseIndex(row.index)}>
                    <Text style={styles.smallBtnTxt}>
                      {row.receivedDate ? `تاريخ فعلي: ${formatDate(row.receivedDate)}` : 'إدخال تاريخ فعلي'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.clearBtn]}
                    onPress={() =>
                      setReceivedByIndex((prev) => {
                        const next = { ...prev };
                        delete next[row.index];
                        return next;
                      })
                    }
                  >
                    <Text style={styles.smallBtnTxt}>مسح</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {activeDoseIndex !== null && (
              <DateTimePicker
                value={receivedByIndex[activeDoseIndex] || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setActiveDoseIndex(Platform.OS === 'ios' ? activeDoseIndex : null);
                  if (!selectedDate) return;
                  setReceivedByIndex((prev) => ({
                    ...prev,
                    [activeDoseIndex]: selectedDate
                  }));
                }}
              />
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={saveBook}>
              <Text style={styles.saveTxt}>حفظ الدفتر</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>دفاتر اللقاحات</Text>
      <Text style={styles.subtitle}>اختر دفترًا لعرض التفاصيل، أو أنشئ دفترًا جديدًا.</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {!isLoggedIn && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTxt}>يرجى تسجيل الدخول أولاً من تبويب حسابي.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={startCreate}>
          <Text style={styles.saveTxt}>إنشاء دفتر جديد</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>دفاتري حسب الحيوان</Text>
          {!vaccineBooksForUser.length && <Text style={styles.empty}>لا توجد دفاتر محفوظة حتى الآن.</Text>}
          {vaccineBooksForUser.map((book) => (
            <TouchableOpacity key={book.id} style={styles.bookRow} onPress={() => openBookDetails(book.id)}>
              <Text style={styles.line}>الحيوان: {book.petName}</Text>
              <Text style={styles.line}>الطبيب: {book.vetName}</Text>
              <Text style={styles.line}>النوع: {book.petType === 'cat' ? 'قط' : 'كلب'}</Text>
              <Text style={styles.line}>عدد الجرعات: {(book.records || []).length}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 14
  },
  content: {
    paddingBottom: 120,
    gap: 12
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.secondary,
    marginTop: 4,
    textAlign: 'right'
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 10,
    color: colors.muted,
    textAlign: 'right'
  },
  warningCard: {
    backgroundColor: '#fff3f2',
    borderWidth: 1,
    borderColor: '#ffd8d4',
    borderRadius: 14,
    padding: 12
  },
  warningTxt: {
    color: '#b42318',
    fontWeight: '700',
    textAlign: 'right'
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.secondary,
    marginBottom: 8,
    textAlign: 'right'
  },
  helper: {
    color: colors.muted,
    marginBottom: 10,
    textAlign: 'right'
  },
  label: {
    marginBottom: 6,
    color: colors.secondary,
    fontWeight: '800',
    textAlign: 'right'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    color: colors.text,
    textAlign: 'right'
  },
  multiInput: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10
  },
  dateTxt: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'right'
  },
  dropdownBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#fff'
  },
  dropdownTxt: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'right'
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff'
  },
  dropdownItemActive: {
    backgroundColor: '#e9efff'
  },
  dropdownItemTxt: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'right'
  },
  doseCard: {
    backgroundColor: '#f9fbff',
    borderWidth: 1,
    borderColor: '#e8eefb',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10
  },
  doseTitle: {
    fontWeight: '900',
    color: colors.secondary,
    marginBottom: 6,
    textAlign: 'right'
  },
  line: {
    color: colors.text,
    marginBottom: 4,
    textAlign: 'right'
  },
  inlineRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 6
  },
  smallBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#e9efff'
  },
  clearBtn: {
    flex: 0.45,
    backgroundColor: '#f5f5f5'
  },
  smallBtnTxt: {
    color: colors.secondary,
    fontWeight: '800',
    fontSize: 13
  },
  saveBtn: {
    borderRadius: 12,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    alignItems: 'center'
  },
  saveTxt: {
    color: '#fff',
    fontWeight: '900'
  },
  exportBtn: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#1f8b4c',
    paddingVertical: 10,
    alignItems: 'center'
  },
  exportTxt: {
    color: '#fff',
    fontWeight: '900'
  },
  bookImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 10,
    resizeMode: 'cover'
  },
  backBtn: {
    borderRadius: 12,
    backgroundColor: '#f2f4f8',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8
  },
  backTxt: {
    color: colors.secondary,
    fontWeight: '800'
  },
  empty: {
    color: colors.muted,
    textAlign: 'right'
  },
  bookRow: {
    borderTopWidth: 1,
    borderTopColor: '#edf0f6',
    paddingTop: 10,
    marginTop: 8
  }
});
