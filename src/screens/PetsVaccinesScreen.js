import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import FormField from '../components/FormField';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { getAttachmentLabel } from '../services/bookingService';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { formatDate, getRowDirection, getTextAlign } from '../utils/format';

function addMonths(baseDate, months) {
  const date = new Date(baseDate);
  date.setMonth(date.getMonth() + months);
  return date;
}

const PROTOCOLS = [
  {
    id: 'cat_pch_korea',
    petType: 'cat',
    label: { ar: 'قطط - PCH (كوريا)', en: 'Cats - PCH (Korea)' },
    steps: [
      { vaccineName: 'PCH', relation: { type: 'reference', months: 0 }, hint: { ar: 'الجرعة الأولى بتاريخ اول مراجعة', en: 'First dose on the first visit date' } },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      { vaccineName: 'Rabies', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      { vaccineName: 'PCH Booster', relation: { type: 'index', index: 1, months: 6 }, hint: { ar: 'بعد 6 أشهر من جرعة PCH السابقة', en: '6 months after the previous PCH dose' } },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 12 }, hint: { ar: 'بعد سنة', en: 'After 1 year' } }
    ]
  },
  {
    id: 'cat_pchr',
    petType: 'cat',
    label: { ar: 'قطط - PCHR (التشيك)', en: 'Cats - PCHR (Czech)' },
    steps: [
      { vaccineName: 'PCHR', relation: { type: 'reference', months: 0 }, hint: { ar: 'الجرعة الأولى بتاريخ اول مراجعة', en: 'First dose on the first visit date' } },
      { vaccineName: 'PCHR', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      { vaccineName: 'PCHR', relation: { type: 'prev', months: 12 }, hint: { ar: 'بعد سنة', en: 'After 1 year' } }
    ]
  },
  {
    id: 'dog_dhppi_lepto',
    petType: 'dog',
    label: { ar: 'كلاب - DHPPi + Lepto', en: 'Dogs - DHPPi + Lepto' },
    steps: [
      { vaccineName: 'DHPPi + Lepto', relation: { type: 'reference', months: 0 }, hint: { ar: 'الجرعة الأولى بتاريخ اول مراجعة', en: 'First dose on the first visit date' } },
      { vaccineName: 'DHPPi', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      { vaccineName: 'Rabies', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      { vaccineName: 'DHPPi + Lepto', relation: { type: 'prev', months: 6 }, hint: { ar: 'بعد 6 أشهر', en: 'After 6 months' } },
      { vaccineName: 'DHPPi + Lepto + Rabies', relation: { type: 'prev', months: 12 }, hint: { ar: 'جرعة سنوية', en: 'Annual dose' } }
    ]
  }
];

function buildSchedule(protocol, referenceDate, receivedByIndex) {
  if (!protocol) return [];
  const rows = [];

  for (let index = 0; index < protocol.steps.length; index += 1) {
    const step = protocol.steps[index];
    let baseDate = new Date(referenceDate);

    if (step.relation.type === 'prev' && index > 0) {
      baseDate = rows[index - 1].effectiveDate;
    }

    if (step.relation.type === 'index') {
      baseDate = rows[step.relation.index]?.effectiveDate || new Date(referenceDate);
    }

    const plannedDate = addMonths(baseDate, step.relation.months);
    const receivedDate = receivedByIndex[index] || null;
    rows.push({
      index,
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
  const { language, isRTL, t } = useLocalization();
  const {
    isLoggedIn,
    currentUser,
    currentProfile,
    vaccineBooksForUser,
    createVaccineBook,
    updateVaccineBookRecords
  } = useContext(AppContext);

  const [view, setView] = useState('list');
  const [selectedBookId, setSelectedBookId] = useState(null);

  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [petName, setPetName] = useState('');
  const [vetName, setVetName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  const [bookAttachment, setBookAttachment] = useState(null);
  const [bookImage, setBookImage] = useState(null);
  const [firstVisitDate, setFirstVisitDate] = useState(new Date());
  const [petBirthDate, setPetBirthDate] = useState(new Date());
  const [showFirstVisitPicker, setShowFirstVisitPicker] = useState(false);
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
    () => buildSchedule(selectedProtocol, firstVisitDate, receivedByIndex),
    [firstVisitDate, receivedByIndex, selectedProtocol]
  );

  const selectedBook = useMemo(
    () => vaccineBooksForUser.find((book) => book.id === selectedBookId) || null,
    [selectedBookId, vaccineBooksForUser]
  );

  const selectedBookProtocol = useMemo(
    () => (selectedBook ? PROTOCOLS.find((item) => item.id === selectedBook.protocol) || PROTOCOLS[0] : null),
    [selectedBook]
  );

  const detailScheduleRows = useMemo(() => {
    if (!selectedBook || !selectedBookProtocol) return [];
    const baseDate = selectedBook.firstVisitDateIso ? new Date(selectedBook.firstVisitDateIso) : new Date();
    return buildSchedule(selectedBookProtocol, baseDate, detailReceivedByIndex);
  }, [detailReceivedByIndex, selectedBook, selectedBookProtocol]);

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
      byDate.forEach((dose, index) => {
        if (dose.receivedDateIso) {
          nextMap[index] = new Date(dose.receivedDateIso);
        }
      });
      setDetailReceivedByIndex(nextMap);
      setDetailActiveDoseIndex(null);
    }
    setSelectedBookId(bookId);
    setView('detail');
  };

  const resetCreateForm = () => {
    setClientName('');
    setLocation('');
    setPetName('');
    setVetName('');
    setOwnerPhone('');
    setOwnerEmail('');
    setBookNotes('');
    setBookAttachment(null);
    setBookImage(null);
    setFirstVisitDate(new Date());
    setPetBirthDate(new Date());
    setProtocolId(PROTOCOLS[0].id);
    setShowProtocolMenu(false);
    setReceivedByIndex({});
    setActiveDoseIndex(null);
  };

  const saveBook = async () => {
    if (!isLoggedIn) {
      Alert.alert(t('alerts.requiredLogin'), t('books.loginHint'));
      return;
    }

    if (!clientName.trim() || !location.trim() || !petName.trim() || !vetName.trim()) {
      Alert.alert(t('alerts.missingData'), language === 'ar'
        ? 'يرجى إدخال اسم العميل والموقع واسم الحيوان واسم الطبيب البيطري.'
        : 'Please enter the client name, location, pet name, and veterinarian name.');
      return;
    }

    const records = scheduleRows.map((row) => ({
      petName: petName.trim(),
      petType: selectedProtocol.petType,
      vaccineName: row.vaccineName,
      dateIso: row.plannedDate.toISOString(),
      plannedDateIso: row.plannedDate.toISOString(),
      receivedDateIso: row.receivedDate ? new Date(row.receivedDate).toISOString() : null,
      notes: row.hint[language] || row.hint.ar,
      attachments: []
    }));

    const result = await createVaccineBook({
      clientName: clientName.trim(),
      location: location.trim(),
      petName: petName.trim(),
      petType: selectedProtocol.petType,
      firstVisitDateIso: firstVisitDate.toISOString(),
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
      Alert.alert(t('alerts.error'), result.messageKey ? t(result.messageKey) : result.message || t('alerts.error'));
      return;
    }

    Alert.alert(t('alerts.success'), t('alerts.savedBook'));
    resetCreateForm();
    openBookDetails(result.book.id);
  };

  const saveDetailDates = async () => {
    if (!selectedBook || !selectedBookProtocol) return;

    const existingRecordsByDate = [...(selectedBook.records || [])].sort(
      (a, b) => new Date(a.plannedDateIso || a.dateIso).getTime() - new Date(b.plannedDateIso || b.dateIso).getTime()
    );

    const nextRecords = detailScheduleRows.map((row, index) => {
      const old = existingRecordsByDate[index] || {};
      return {
        ...old,
        petName: selectedBook.petName,
        petType: selectedBook.petType,
        vaccineName: row.vaccineName,
        dateIso: row.plannedDate.toISOString(),
        plannedDateIso: row.plannedDate.toISOString(),
        receivedDateIso: row.receivedDate ? new Date(row.receivedDate).toISOString() : null,
        notes: old.notes || row.hint[language] || row.hint.ar,
        attachments: old.attachments || []
      };
    });

    const result = await updateVaccineBookRecords({
      bookId: selectedBook.id,
      records: nextRecords
    });

    if (!result.ok) {
      Alert.alert(t('alerts.error'), result.message || t('alerts.error'));
      return;
    }

    Alert.alert(t('alerts.success'), t('alerts.updatedBook'));
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
      Alert.alert(t('alerts.error'), t('alerts.failedFile'));
    }
  };

  const pickBookImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('alerts.warning'), t('alerts.permissionPhotos'));
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
      Alert.alert(t('alerts.error'), t('alerts.failedImage'));
    }
  };

  const exportBookPdf = async () => {
    if (!selectedBook) return;

    const rows = detailScheduleRows
      .map(
        (dose, index) =>
          `<tr>
            <td>${index + 1}</td>
            <td>${dose.vaccineName}</td>
            <td>${formatDate(dose.plannedDate, language)}</td>
            <td>${dose.receivedDate ? formatDate(dose.receivedDate, language) : '-'}</td>
          </tr>`
      )
      .join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; color: #1f3132; }
            h1 { margin-bottom: 8px; color: #2F5D62; }
            p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d9e5df; padding: 8px; text-align: left; }
            th { background: #eef7f1; }
          </style>
        </head>
        <body>
          <h1>${t('common.appName')} - ${t('books.detailTitle')}</h1>
          <p>${t('books.clientName')}: ${selectedBook.clientName}</p>
          <p>${t('books.location')}: ${selectedBook.location}</p>
          <p>${t('books.petName')}: ${selectedBook.petName}</p>
          <p>${t('books.vetName')}: ${selectedBook.vetName}</p>
          <p>${t('books.ownerPhone')}: ${selectedBook.ownerPhone || '-'}</p>
          <p>${t('books.ownerEmail')}: ${selectedBook.ownerEmail || '-'}</p>
          <p>${t('books.petBirthDate')}: ${selectedBook.petBirthDateIso ? formatDate(selectedBook.petBirthDateIso, language) : '-'}</p>
          <p>${t('books.firstVisitDate')}: ${selectedBook.firstVisitDateIso ? formatDate(selectedBook.firstVisitDateIso, language) : '-'}</p>
          <p>${t('books.notes')}: ${selectedBook.notes || '-'}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t('books.dose')}</th>
                <th>${t('books.plannedDate')}</th>
                <th>${t('books.actualDate')}</th>
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
        Alert.alert(t('alerts.success'), file.uri);
        return;
      }
      await Sharing.shareAsync(file.uri);
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.failedPdf'));
    }
  };

  const renderDatePicker = (value, onSelect, onClose) => (
    <DateTimePicker
      value={value}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={(event, selectedDate) => {
        if (Platform.OS !== 'ios') {
          onClose();
        }
        if (selectedDate) onSelect(selectedDate);
      }}
    />
  );

  if (view === 'detail' && selectedBook) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title={t('books.detailTitle')} subtitle={selectedBook.clientName} />
        <TouchableOpacity style={styles.backBtn} onPress={() => setView('list')}>
          <Text style={styles.backTxt}>{t('books.backToList')}</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.infoSection')}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.clientName')}: {selectedBook.clientName}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.location')}: {selectedBook.location}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.petName')}: {selectedBook.petName}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.vetName')}: {selectedBook.vetName}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.ownerPhone')}: {selectedBook.ownerPhone || '-'}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.ownerEmail')}: {selectedBook.ownerEmail || '-'}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.petBirthDate')}: {selectedBook.petBirthDateIso ? formatDate(selectedBook.petBirthDateIso, language) : '-'}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.firstVisitDate')}: {selectedBook.firstVisitDateIso ? formatDate(selectedBook.firstVisitDateIso, language) : '-'}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('common.files')}: {getAttachmentLabel(selectedBook.attachment)}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.notes')}: {selectedBook.notes || '-'}</Text>
            {selectedBook.image?.uri ? <Image source={{ uri: selectedBook.image.uri }} style={styles.bookImage} /> : null}
            <TouchableOpacity style={styles.exportBtn} onPress={exportBookPdf}>
              <Text style={styles.exportTxt}>{t('books.exportPdf')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.scheduleSection')}</Text>
            {detailScheduleRows.map((dose, index) => (
              <View key={`${dose.vaccineName}_${index}`} style={styles.doseCard}>
                <Text style={[styles.doseTitle, { textAlign: getTextAlign(isRTL) }]}>
                  {t('books.dose')} {index + 1}: {dose.vaccineName}
                </Text>
                <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>
                  {t('books.plannedDate')}: {formatDate(dose.plannedDate, language)}
                </Text>
                <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>
                  {t('books.actualDate')}: {dose.receivedDate ? formatDate(dose.receivedDate, language) : '-'}
                </Text>
                <View style={[styles.inlineRow, { flexDirection: getRowDirection(isRTL) }]}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => setDetailActiveDoseIndex(index)}>
                    <Text style={styles.smallBtnTxt}>
                      {dose.receivedDate ? `${t('books.actualDate')}: ${formatDate(dose.receivedDate, language)}` : t('books.enterActualDate')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.clearBtn]}
                    onPress={() =>
                      setDetailReceivedByIndex((prev) => {
                        const next = { ...prev };
                        delete next[index];
                        return next;
                      })
                    }
                  >
                    <Text style={styles.smallBtnTxt}>{t('common.clear')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {detailActiveDoseIndex !== null
              ? renderDatePicker(
                  detailReceivedByIndex[detailActiveDoseIndex] || new Date(),
                  (selectedDate) =>
                    setDetailReceivedByIndex((prev) => ({
                      ...prev,
                      [detailActiveDoseIndex]: selectedDate
                    })),
                  () => setDetailActiveDoseIndex(null)
                )
              : null}

            <TouchableOpacity style={styles.saveBtn} onPress={saveDetailDates}>
              <Text style={styles.saveTxt}>{t('books.saveChanges')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === 'create') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title={t('books.createTitle')} subtitle={t('books.listSubtitle')} />
        <TouchableOpacity style={styles.backBtn} onPress={() => setView('list')}>
          <Text style={styles.backTxt}>{t('books.backToList')}</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.ownerPetSection')}</Text>
            <Text style={[styles.helper, { textAlign: getTextAlign(isRTL) }]}>
              {t('books.helperLoggedIn')}: {currentProfile?.display_name || currentProfile?.username || currentUser?.email || t('books.currentUserMissing')}
            </Text>

            <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>{t('books.petImage')}</Text>
            <View style={[styles.inlineRow, { flexDirection: getRowDirection(isRTL) }]}>
              <TouchableOpacity style={styles.smallBtn} onPress={pickBookImage}>
                <Text style={styles.smallBtnTxt}>
                  {bookImage?.fileName ? bookImage.fileName : t('books.chooseImage')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, styles.clearBtn]} onPress={() => setBookImage(null)}>
                <Text style={styles.smallBtnTxt}>{t('common.clear')}</Text>
              </TouchableOpacity>
            </View>
            {bookImage?.uri ? <Image source={{ uri: bookImage.uri }} style={styles.bookImage} /> : null}

            <FormField label={t('books.clientName')} value={clientName} onChangeText={setClientName} placeholder={language === 'ar' ? 'اسم العميل الكامل' : 'Client full name'} />
            <FormField label={t('books.location')} value={location} onChangeText={setLocation} placeholder={language === 'ar' ? 'المدينة أو العنوان المختصر' : 'City or short address'} />
            <FormField label={t('books.petName')} value={petName} onChangeText={setPetName} placeholder={language === 'ar' ? 'مثال: لولو' : 'Example: Lulu'} />
            <FormField label={t('books.vetName')} value={vetName} onChangeText={setVetName} placeholder={language === 'ar' ? 'مثال: د. أحمد' : 'Example: Dr. Ahmed'} />
            <FormField label={t('books.ownerPhone')} value={ownerPhone} onChangeText={setOwnerPhone} placeholder="07xx xxx xxxx" keyboardType="phone-pad" />
            <FormField label={t('books.ownerEmail')} value={ownerEmail} onChangeText={setOwnerEmail} placeholder="owner@email.com" autoCapitalize="none" keyboardType="email-address" />

            <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>{t('books.petBirthDate')}</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowBirthPicker(true)}>
              <Text style={[styles.dateTxt, { textAlign: getTextAlign(isRTL) }]}>{formatDate(petBirthDate, language)}</Text>
            </TouchableOpacity>
            {showBirthPicker ? renderDatePicker(petBirthDate, setPetBirthDate, () => setShowBirthPicker(false)) : null}

            <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>
              {t('books.firstVisitDate')} ({t('books.firstVisitHint')})
            </Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFirstVisitPicker(true)}>
              <Text style={[styles.dateTxt, { textAlign: getTextAlign(isRTL) }]}>{formatDate(firstVisitDate, language)}</Text>
            </TouchableOpacity>
            {showFirstVisitPicker ? renderDatePicker(firstVisitDate, setFirstVisitDate, () => setShowFirstVisitPicker(false)) : null}
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.protocolSection')}</Text>
            <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>{t('books.protocol')}</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowProtocolMenu((prev) => !prev)}>
              <Text style={[styles.dropdownTxt, { textAlign: getTextAlign(isRTL) }]}>{selectedProtocol.label[language] || selectedProtocol.label.ar}</Text>
            </TouchableOpacity>
            {showProtocolMenu ? (
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
                    <Text style={[styles.dropdownItemTxt, { textAlign: getTextAlign(isRTL) }]}>
                      {item.label[language] || item.label.ar}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <FormField
              label={t('books.notes')}
              value={bookNotes}
              onChangeText={setBookNotes}
              placeholder={language === 'ar' ? 'أي ملاحظات عامة' : 'Any general notes'}
              multiline
            />

            <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>{t('books.generalFiles')}</Text>
            <View style={[styles.inlineRow, { flexDirection: getRowDirection(isRTL) }]}>
              <TouchableOpacity style={styles.smallBtn} onPress={pickPdfAttachment}>
                <Text style={styles.smallBtnTxt}>
                  {bookAttachment?.name ? bookAttachment.name : t('books.chooseFile')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, styles.clearBtn]} onPress={() => setBookAttachment(null)}>
                <Text style={styles.smallBtnTxt}>{t('common.clear')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.scheduleSection')}</Text>
            <Text style={[styles.helper, { textAlign: getTextAlign(isRTL) }]}>{t('books.helperSchedule')}</Text>
            {scheduleRows.map((row) => (
              <View key={row.index} style={styles.doseCard}>
                <Text style={[styles.doseTitle, { textAlign: getTextAlign(isRTL) }]}>
                  {t('books.dose')} {row.index + 1}: {row.vaccineName}
                </Text>
                <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>
                  {t('books.plannedDate')}: {formatDate(row.plannedDate, language)}
                </Text>
                <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{row.hint[language] || row.hint.ar}</Text>
                <View style={[styles.inlineRow, { flexDirection: getRowDirection(isRTL) }]}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => setActiveDoseIndex(row.index)}>
                    <Text style={styles.smallBtnTxt}>
                      {row.receivedDate ? `${t('books.actualDate')}: ${formatDate(row.receivedDate, language)}` : t('books.enterActualDate')}
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
                    <Text style={styles.smallBtnTxt}>{t('common.clear')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {activeDoseIndex !== null
              ? renderDatePicker(
                  receivedByIndex[activeDoseIndex] || new Date(),
                  (selectedDate) =>
                    setReceivedByIndex((prev) => ({
                      ...prev,
                      [activeDoseIndex]: selectedDate
                    })),
                  () => setActiveDoseIndex(null)
                )
              : null}

            <TouchableOpacity style={styles.saveBtn} onPress={saveBook}>
              <Text style={styles.saveTxt}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('books.title')} subtitle={t('books.listSubtitle')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isLoggedIn ? (
          <View style={styles.warningCard}>
            <Text style={[styles.warningTxt, { textAlign: getTextAlign(isRTL) }]}>{t('books.loginHint')}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.saveBtn} onPress={startCreate}>
          <Text style={styles.saveTxt}>{t('books.create')}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.infoSection')}</Text>
          {!vaccineBooksForUser.length ? <Text style={[styles.empty, { textAlign: getTextAlign(isRTL) }]}>{t('books.noBooks')}</Text> : null}
          {vaccineBooksForUser.map((book) => (
            <TouchableOpacity key={book.id} style={styles.bookRow} onPress={() => openBookDetails(book.id)}>
              <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.clientName')}: {book.clientName}</Text>
              <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.petName')}: {book.petName}</Text>
              <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.vetName')}: {book.vetName}</Text>
              <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.location')}: {book.location}</Text>
              <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.firstVisitDate')}: {book.firstVisitDateIso ? formatDate(book.firstVisitDateIso, language) : '-'}</Text>
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
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md
  },
  content: {
    paddingBottom: 120,
    gap: 12
  },
  warningCard: {
    backgroundColor: '#FFF2EF',
    borderWidth: 1,
    borderColor: '#F7CBC4',
    borderRadius: radius.md,
    padding: spacing.md
  },
  warningTxt: {
    color: colors.danger,
    fontWeight: '700'
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: '900',
    color: colors.secondary,
    marginBottom: spacing.sm
  },
  helper: {
    color: colors.textSoft,
    marginBottom: spacing.md,
    fontSize: typography.bodySm,
    lineHeight: 20
  },
  label: {
    marginBottom: 6,
    color: colors.secondary,
    fontWeight: '800',
    fontSize: typography.label
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    marginBottom: spacing.md,
    backgroundColor: '#fff'
  },
  dateTxt: {
    color: colors.text,
    fontWeight: '700',
    fontSize: typography.body
  },
  dropdownBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    marginBottom: spacing.sm,
    backgroundColor: '#fff'
  },
  dropdownTxt: {
    color: colors.text,
    fontWeight: '700',
    fontSize: typography.body
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff'
  },
  dropdownItemActive: {
    backgroundColor: '#E9F3EE'
  },
  dropdownItemTxt: {
    color: colors.text,
    fontWeight: '700'
  },
  doseCard: {
    backgroundColor: '#F8FBF8',
    borderWidth: 1,
    borderColor: '#E3ECE7',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  doseTitle: {
    fontWeight: '900',
    color: colors.secondary,
    marginBottom: 6,
    fontSize: typography.body
  },
  line: {
    color: colors.text,
    marginBottom: 5,
    fontSize: typography.bodySm
  },
  inlineRow: {
    gap: 8,
    marginTop: 6
  },
  smallBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#E9F3EE'
  },
  clearBtn: {
    flex: 0.45,
    backgroundColor: '#F1F4F3'
  },
  smallBtnTxt: {
    color: colors.secondary,
    fontWeight: '800',
    fontSize: typography.caption
  },
  saveBtn: {
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    alignItems: 'center'
  },
  saveTxt: {
    color: '#fff',
    fontWeight: '900',
    fontSize: typography.body
  },
  exportBtn: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.success,
    paddingVertical: 12,
    alignItems: 'center'
  },
  exportTxt: {
    color: '#fff',
    fontWeight: '900',
    fontSize: typography.bodySm
  },
  bookImage: {
    width: '100%',
    height: 190,
    borderRadius: radius.md,
    marginTop: spacing.md,
    resizeMode: 'cover'
  },
  backBtn: {
    borderRadius: radius.md,
    backgroundColor: '#F1F4F3',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: spacing.md
  },
  backTxt: {
    color: colors.secondary,
    fontWeight: '800'
  },
  empty: {
    color: colors.textSoft,
    fontSize: typography.body
  },
  bookRow: {
    borderTopWidth: 1,
    borderTopColor: '#EDF2EF',
    paddingTop: spacing.md,
    marginTop: spacing.sm
  }
});
