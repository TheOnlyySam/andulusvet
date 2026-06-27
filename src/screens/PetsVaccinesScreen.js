import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Text } from '../components/Typography';
import { Ionicons } from '@expo/vector-icons';
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
import { formatCurrency, formatDate, getRowDirection, getTextAlign } from '../utils/format';

function addMonths(baseDate, months) {
  const date = new Date(baseDate);
  date.setMonth(date.getMonth() + months);
  return date;
}

function addDays(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
}

const CREATE_BOOK_DRAFT_KEY = 'andulusvet_create_book_draft_v1';

const PROTOCOLS = [
  {
    id: 'cat_pch_korea',
    petType: 'cat',
    label: { ar: 'قطط - PCH (كوري)', en: 'Cats - PCH (Korean)' },
    steps: [
      { vaccineName: 'PCH', relation: { type: 'reference', months: 0 }, hint: { ar: 'الجرعة الأولى بتاريخ اول مراجعة', en: 'First dose on the first visit date' } },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      { vaccineName: 'Rabies', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      { vaccineName: 'PCH', relation: { type: 'index', index: 1, months: 6 }, hint: { ar: 'الجرعة الرابعة بعد 6 أشهر', en: 'Fourth dose after 6 months' } },
      {
        vaccineName: 'PCH',
        relation: { type: 'prev', months: 12 },
        hint: { ar: 'بعد سنة', en: 'After 1 year' },
        repeatEveryMonths: 12,
        repeatCount: 6,
        repeatHint: { ar: 'متابعة سنوية', en: 'Annual follow-up dose' }
      }
    ]
  },
  {
    id: 'cat_pch_netherlands',
    petType: 'cat',
    label: { ar: 'قطط - PCH (هولندا)', en: 'Cats - PCH (Netherlands)' },
    steps: [
      { vaccineName: 'PCH', relation: { type: 'reference', months: 0 }, hint: { ar: 'الجرعة الأولى بتاريخ اول مراجعة', en: 'First dose on the first visit date' } },
      { vaccineName: 'PCH', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      { vaccineName: 'Rabies', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      {
        vaccineName: 'PCH + Rabies',
        relation: { type: 'prev', months: 12 },
        hint: { ar: 'جرعة سنوية', en: 'Annual dose' },
        repeatEveryMonths: 12,
        repeatCount: 6,
        repeatHint: { ar: 'متابعة سنوية', en: 'Annual follow-up dose' }
      }
    ]
  },
  {
    id: 'cat_pchr',
    petType: 'cat',
    label: { ar: 'قطط - PCH (جمهورية التشيك)', en: 'Cats - PCH Czech Republic' },
    steps: [
      { vaccineName: 'PCHR', relation: { type: 'reference', months: 0 }, hint: { ar: 'الجرعة الأولى بتاريخ اول مراجعة', en: 'First dose on the first visit date' } },
      { vaccineName: 'PCHR', relation: { type: 'prev', months: 1 }, hint: { ar: 'بعد شهر', en: 'After 1 month' } },
      { vaccineName: 'Rabies', relation: { type: 'prev', months: 1 }, hint: { ar: 'داء الكلب', en: 'Rabies' } },
      {
        vaccineName: 'PCHR',
        relation: { type: 'prev', months: 12 },
        hint: { ar: 'بعد سنة', en: 'After 1 year' },
        repeatEveryMonths: 12,
        repeatCount: 6,
        repeatHint: { ar: 'متابعة سنوية', en: 'Annual follow-up dose' }
      }
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
      {
        vaccineName: 'DHPPi + Lepto + Rabies',
        relation: { type: 'prev', months: 12 },
        hint: { ar: 'جرعة سنوية', en: 'Annual dose' },
        repeatEveryMonths: 12,
        repeatCount: 6,
        repeatHint: { ar: 'متابعة سنوية', en: 'Annual follow-up dose' }
      }
    ]
  }
];

function expandSteps(protocol) {
  if (!protocol) return [];
  const expanded = [];

  protocol.steps.forEach((step) => {
    expanded.push(step);

    const repeatEveryMonths = Number(step.repeatEveryMonths || 0);
    const repeatCount = Number(step.repeatCount || 0);
    if (!repeatEveryMonths || !repeatCount) return;

    for (let repeatIndex = 0; repeatIndex < repeatCount; repeatIndex += 1) {
      expanded.push({
        ...step,
        relation: { type: 'prev', months: repeatEveryMonths },
        hint: step.repeatHint || step.hint
      });
    }
    expanded.push({
      ...step,
      relation: { type: 'prev', months: 36 },
      hint: { ar: 'بعد عمر 7 سنوات: كل 3 سنوات', en: 'After age 7: every 3 years' }
    });
  });

  return expanded;
}

function buildDewormingSchedule(referenceDate) {
  return Array.from({ length: 29 }, (_, index) => ({
    id: `deworming_${index}`,
    kind: 'deworming',
    doseType: 'Deworming',
    plannedDate: addMonths(referenceDate, index * 3),
    status: 'pending',
    notes: ''
  }));
}

function buildSchedule(protocol, referenceDate, receivedByIndex) {
  if (!protocol) return [];
  const steps = expandSteps(protocol);
  const rows = [];

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    let baseDate = new Date(referenceDate);

    if (step.relation.type === 'prev' && index > 0) {
      baseDate = rows[index - 1].effectiveDate;
    }

    if (step.relation.type === 'index') {
      baseDate = rows[step.relation.index]?.effectiveDate || new Date(referenceDate);
    }

    let plannedDate = new Date(baseDate);
    if (step.relation.months) {
      plannedDate = addMonths(plannedDate, step.relation.months);
    }
    if (step.relation.days) {
      plannedDate = addDays(plannedDate, step.relation.days);
    }
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
    updateVaccineBookRecords,
    VACCINE_BOOK_PRICE_IQD
  } = useContext(AppContext);

  const [view, setView] = useState('list');
  const [selectedBookId, setSelectedBookId] = useState(null);

  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [petName, setPetName] = useState('');
  const [petSex, setPetSex] = useState('male');
  const [petBreed, setPetBreed] = useState('');
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
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  const selectedProtocol = useMemo(
    () => PROTOCOLS.find((item) => item.id === protocolId) || PROTOCOLS[0],
    [protocolId]
  );

  const scheduleRows = useMemo(
    () => buildSchedule(selectedProtocol, firstVisitDate, receivedByIndex),
    [firstVisitDate, receivedByIndex, selectedProtocol]
  );
  const dewormingRows = useMemo(() => buildDewormingSchedule(firstVisitDate), [firstVisitDate]);

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

  useEffect(() => {
    let mounted = true;

    const loadDraft = async () => {
      try {
        const raw = await AsyncStorage.getItem(CREATE_BOOK_DRAFT_KEY);
        if (!raw || !mounted) return;
        const draft = JSON.parse(raw);
        setClientName(draft.clientName || '');
        setLocation(draft.location || '');
        setPetName(draft.petName || '');
        setPetSex(draft.petSex || 'male');
        setPetBreed(draft.petBreed || '');
        setVetName(draft.vetName || '');
        setOwnerPhone(draft.ownerPhone || '');
        setOwnerEmail(draft.ownerEmail || '');
        setBookNotes(draft.bookNotes || '');
        setBookAttachment(draft.bookAttachment || null);
        setBookImage(draft.bookImage || null);
        setProtocolId(draft.protocolId || PROTOCOLS[0].id);
        setReceivedByIndex(draft.receivedByIndex || {});
        if (draft.firstVisitDate) setFirstVisitDate(new Date(draft.firstVisitDate));
        if (draft.petBirthDate) setPetBirthDate(new Date(draft.petBirthDate));
      } finally {
        if (mounted) setIsDraftHydrated(true);
      }
    };

    loadDraft();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isDraftHydrated || view !== 'create') return;

    const draft = {
      clientName,
      location,
      petName,
      petSex,
      petBreed,
      vetName,
      ownerPhone,
      ownerEmail,
      bookNotes,
      bookAttachment,
      bookImage,
      firstVisitDate: firstVisitDate.toISOString(),
      petBirthDate: petBirthDate.toISOString(),
      protocolId,
      receivedByIndex
    };

    AsyncStorage.setItem(CREATE_BOOK_DRAFT_KEY, JSON.stringify(draft)).catch(() => null);
  }, [
    isDraftHydrated,
    view,
    clientName,
    location,
    petName,
    petSex,
    petBreed,
    vetName,
    ownerPhone,
    ownerEmail,
    bookNotes,
    bookAttachment,
    bookImage,
    firstVisitDate,
    petBirthDate,
    protocolId,
    receivedByIndex
  ]);

  const startCreate = () => {
    setView('create');
    setSelectedBookId(null);
  };

  const openBookDetails = (bookId) => {
    const book = vaccineBooksForUser.find((item) => item.id === bookId);
    if (book) {
      const byDate = [...(book.records || [])].filter((record) => record.recordType !== 'deworming').sort(
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
    setPetSex('male');
    setPetBreed('');
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
    AsyncStorage.removeItem(CREATE_BOOK_DRAFT_KEY).catch(() => null);
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

    const existingPetBook = vaccineBooksForUser.find((book) =>
      String(book.petName || '').trim().toLocaleLowerCase() === petName.trim().toLocaleLowerCase() &&
      String(book.petBirthDateIso || '').slice(0, 10) === petBirthDate.toISOString().slice(0, 10)
    );
    if (existingPetBook) {
      Alert.alert(
        t('alerts.warning'),
        language === 'ar'
          ? 'يوجد دفتر إلكتروني لهذا الحيوان بالفعل. افتح الدفتر الحالي لتجنب دفع الأجرة مرة أخرى.'
          : 'This pet already has an electronic book. Open the existing book to avoid paying the fee again.'
      );
      return;
    }

    const vaccineRecords = scheduleRows.map((row) => ({
      petName: petName.trim(),
      petType: selectedProtocol.petType,
      vaccineName: row.vaccineName,
      dateIso: row.plannedDate.toISOString(),
      plannedDateIso: row.plannedDate.toISOString(),
      receivedDateIso: row.receivedDate ? new Date(row.receivedDate).toISOString() : null,
      notes: row.hint[language] || row.hint.ar,
      attachments: []
    }));
    const dewormingRecords = dewormingRows.map((row) => ({
      petName: petName.trim(),
      petType: selectedProtocol.petType,
      vaccineName: row.doseType,
      recordType: 'deworming',
      status: row.status,
      dateIso: row.plannedDate.toISOString(),
      plannedDateIso: row.plannedDate.toISOString(),
      receivedDateIso: null,
      notes: row.notes,
      attachments: []
    }));

    const result = await createVaccineBook({
      clientName: clientName.trim(),
      location: location.trim(),
      petName: petName.trim(),
      petType: selectedProtocol.petType,
      petSex,
      petBreed: petBreed.trim(),
      firstVisitDateIso: firstVisitDate.toISOString(),
      petBirthDateIso: petBirthDate.toISOString(),
      ownerPhone: ownerPhone.trim(),
      ownerEmail: ownerEmail.trim(),
      vetName: vetName.trim(),
      protocol: selectedProtocol.id,
      notes: bookNotes.trim(),
      attachment: bookAttachment,
      image: bookImage,
      records: [...vaccineRecords, ...dewormingRecords]
    });

    if (!result.ok) {
      Alert.alert(t('alerts.error'), result.messageKey ? t(result.messageKey) : result.message || t('alerts.error'));
      return;
    }

    const nextStatus = result.book?.approvalStatus || result.book?.approval_status || 'approved';
    Alert.alert(
      t('alerts.success'),
      nextStatus === 'pending' ? t('alerts.savedBookPaymentPending') : t('alerts.savedBook')
    );
    resetCreateForm();
    openBookDetails(result.book.id);
  };

  const saveDetailDates = async () => {
    if (!selectedBook || !selectedBookProtocol) return;
    if ((selectedBook.paymentStatus || selectedBook.payment_status) !== 'paid') {
      Alert.alert(t('alerts.warning'), t('books.paymentRequired'));
      return;
    }

    const dewormingRecords = (selectedBook.records || []).filter((record) => record.recordType === 'deworming');
    const existingRecordsByDate = [...(selectedBook.records || [])].filter((record) => record.recordType !== 'deworming').sort(
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
      records: [...nextRecords, ...dewormingRecords]
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
            body { font-family: Arial, sans-serif; padding: 16px; color: #0f1f2d; }
            h1 { margin-bottom: 8px; color: #0f1f2d; }
            p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #cbe4e5; padding: 8px; text-align: left; }
            th { background: #e7f7f7; }
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
    const selectedBookIsPaid = (selectedBook.paymentStatus || selectedBook.payment_status) === 'paid';

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
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.petSex')}: {selectedBook.petSex === 'female' ? t('books.female') : t('books.male')}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.petBreed')}: {selectedBook.petBreed || '-'}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.vetName')}: {selectedBook.vetName}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.ownerPhone')}: {selectedBook.ownerPhone || '-'}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.ownerEmail')}: {selectedBook.ownerEmail || '-'}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>
              {t('books.requestStatus')}: {(selectedBook.approvalStatus || selectedBook.approval_status) === 'pending' ? t('books.statusPending') : t('books.statusApproved')}
            </Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>
              {t('books.paymentStatus')}: {(selectedBook.paymentStatus || selectedBook.payment_status) === 'paid' ? t('books.statusPaid') : t('books.statusUnpaid')}
            </Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>
              {t('books.bookFee')}: {formatCurrency(selectedBook.paymentAmountIqd || selectedBook.payment_amount_iqd || VACCINE_BOOK_PRICE_IQD, language)}
            </Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.petBirthDate')}: {selectedBook.petBirthDateIso ? formatDate(selectedBook.petBirthDateIso, language) : '-'}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.firstVisitDate')}: {selectedBook.firstVisitDateIso ? formatDate(selectedBook.firstVisitDateIso, language) : '-'}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('common.files')}: {getAttachmentLabel(selectedBook.attachment)}</Text>
            <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.notes')}: {selectedBook.notes || '-'}</Text>
            {selectedBook.image?.uri ? <Image source={{ uri: selectedBook.image.uri }} style={styles.bookImage} /> : null}
            {selectedBookIsPaid ? (
              <TouchableOpacity style={styles.exportBtn} onPress={exportBookPdf}>
                <Text style={styles.exportTxt}>{t('books.exportPdf')}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.paymentLockText, { textAlign: getTextAlign(isRTL) }]}>
                {t('books.paymentRequired')}
              </Text>
            )}
          </View>

          {selectedBookIsPaid ? (
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
          ) : null}
          {selectedBookIsPaid ? (
            <View style={styles.card}>
              <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.dewormingSchedule')}</Text>
              {(selectedBook.records || []).filter((record) => record.recordType === 'deworming').map((dose, index) => (
                <View key={dose.id || `deworm_${index}`} style={styles.doseCard}>
                  <Text style={[styles.doseTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.deworming')} {index + 1}</Text>
                  <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.ageDate')}: {formatDate(dose.plannedDateIso || dose.dateIso, language)}</Text>
                  <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.status')}: {t('books.statusPendingDose')}</Text>
                </View>
              ))}
            </View>
          ) : null}
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
            {currentProfile?.role !== 'admin' ? (
              <View style={styles.priceNotice}>
                <Text style={[styles.priceNoticeTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.bookFeeTitle')}</Text>
                <Text style={[styles.priceNoticeText, { textAlign: getTextAlign(isRTL) }]}>
                  {t('books.bookFeeNotice')}
                </Text>
              </View>
            ) : null}
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

            <FormField label={t('books.clientName')} value={clientName} onChangeText={setClientName} placeholder={language === 'ar' ? 'اسم العميل الكامل' : 'Client full name'} autoComplete="off" textContentType="none" importantForAutofill="no" />
            <FormField label={t('books.location')} value={location} onChangeText={setLocation} placeholder={language === 'ar' ? 'المدينة أو العنوان المختصر' : 'City or short address'} autoComplete="off" textContentType="none" importantForAutofill="no" />
            <FormField label={t('books.petName')} value={petName} onChangeText={setPetName} placeholder={language === 'ar' ? 'مثال: لولو' : 'Example: Lulu'} autoComplete="off" textContentType="none" importantForAutofill="no" />
            <Text style={[styles.label, { textAlign: getTextAlign(isRTL) }]}>{t('books.petSex')}</Text>
            <View style={[styles.inlineRow, { flexDirection: getRowDirection(isRTL), marginBottom: spacing.md }]}>
              {['male', 'female'].map((option) => (
                <TouchableOpacity key={option} style={[styles.smallBtn, petSex === option && styles.selectedOption]} onPress={() => setPetSex(option)}>
                  <Text style={styles.smallBtnTxt}>{t(`books.${option}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <FormField label={t('books.petBreed')} value={petBreed} onChangeText={setPetBreed} placeholder={language === 'ar' ? 'مثال: شيرازي' : 'Example: Persian'} autoComplete="off" />
            <FormField label={t('books.vetName')} value={vetName} onChangeText={setVetName} placeholder={language === 'ar' ? 'مثال: د. أحمد' : 'Example: Dr. Ahmed'} autoComplete="off" textContentType="none" importantForAutofill="no" />
            <FormField label={t('books.ownerPhone')} value={ownerPhone} onChangeText={setOwnerPhone} placeholder="07xx xxx xxxx" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
            <FormField label={t('books.ownerEmail')} value={ownerEmail} onChangeText={setOwnerEmail} placeholder="owner@email.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />

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
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.dewormingSchedule')}</Text>
            {dewormingRows.map((row, index) => (
              <View key={row.id} style={styles.doseCard}>
                <Text style={[styles.doseTitle, { textAlign: getTextAlign(isRTL) }]}>{t('books.deworming')} {index + 1}</Text>
                <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.ageDate')}: {formatDate(row.plannedDate, language)}</Text>
                <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('books.status')}: {t('books.statusPendingDose')}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('books.title')} subtitle={t('books.listSubtitle')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.booksHero}>
          <View style={styles.booksHeroGlow} />
          <View style={[styles.booksHeroRow, { flexDirection: getRowDirection(isRTL) }]}>
            <View style={styles.booksHeroIcon}><Ionicons name="medkit-outline" size={27} color="#fff" /></View>
            <View style={styles.booksHeroCopy}>
              <Text style={[styles.booksHeroTitle, { textAlign: getTextAlign(isRTL) }]}>{language === 'ar' ? 'ملفات صحية منظمة' : 'Organized health records'}</Text>
              <Text style={[styles.booksHeroSubtitle, { textAlign: getTextAlign(isRTL) }]}>{language === 'ar' ? 'تابع اللقاحات والمواعيد وحالة كل ملف بسهولة' : 'Track vaccines, appointments, and every record status'}</Text>
            </View>
          </View>
          <View style={[styles.booksHeroStat, { flexDirection: getRowDirection(isRTL) }]}>
            <Text style={styles.booksHeroNumber}>{vaccineBooksForUser.length}</Text>
            <Text style={styles.booksHeroStatText}>{language === 'ar' ? 'ملف في حسابك' : 'records in your account'}</Text>
          </View>
        </View>

        {!isLoggedIn ? (
          <View style={styles.warningCard}>
            <Ionicons name="lock-closed-outline" size={21} color={colors.danger} />
            <Text style={[styles.warningTxt, { textAlign: getTextAlign(isRTL) }]}>{t('books.loginHint')}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.createBookBtn} onPress={startCreate} activeOpacity={0.85}>
          <View style={styles.createBookIcon}><Ionicons name="add" size={22} color={colors.secondary} /></View>
          <Text style={styles.saveTxt}>
            {currentProfile?.role === 'admin' ? t('books.create') : t('books.createRequest')}
          </Text>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#fff" />
        </TouchableOpacity>

        <View style={[styles.recordsHeading, { flexDirection: getRowDirection(isRTL) }]}>
          <Text style={styles.recordsTitle}>{language === 'ar' ? 'ملفاتي' : 'My records'}</Text>
          <View style={styles.recordsCount}><Text style={styles.recordsCountText}>{vaccineBooksForUser.length}</Text></View>
        </View>

        {!vaccineBooksForUser.length ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}><Ionicons name="document-text-outline" size={31} color={colors.secondary} /></View>
            <Text style={styles.emptyTitle}>{t('books.noBooks')}</Text>
            <Text style={styles.emptySubtitle}>{language === 'ar' ? 'ابدأ بإنشاء ملف جديد لتنظيم اللقاحات والمواعيد' : 'Create a new record to organize vaccines and appointments'}</Text>
          </View>
        ) : null}

          {vaccineBooksForUser.map((book) => (
            <TouchableOpacity key={book.id} style={styles.bookRow} onPress={() => openBookDetails(book.id)}>
              <View style={[styles.bookTop, { flexDirection: getRowDirection(isRTL) }]}>
                {book.image?.uri ? <Image source={{ uri: book.image.uri }} style={styles.petThumb} /> : <View style={styles.petThumbFallback}><Ionicons name="paw" size={23} color={colors.secondary} /></View>}
                <View style={styles.bookMain}>
                  <Text numberOfLines={1} style={[styles.petName, { textAlign: getTextAlign(isRTL) }]}>{book.petName}</Text>
                  <Text numberOfLines={1} style={[styles.ownerName, { textAlign: getTextAlign(isRTL) }]}>{book.clientName}</Text>
                </View>
                <View style={styles.openIcon}><Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={19} color={colors.secondary} /></View>
              </View>

              <View style={[styles.statusRow, { flexDirection: getRowDirection(isRTL) }]}>
                <View style={[styles.statusBadge, (book.approvalStatus || book.approval_status) === 'pending' ? styles.statusPending : styles.statusSuccess]}>
                  <View style={[styles.statusDot, { backgroundColor: (book.approvalStatus || book.approval_status) === 'pending' ? colors.warning : colors.success }]} />
                  <Text style={styles.statusText}>{(book.approvalStatus || book.approval_status) === 'pending' ? t('books.statusPending') : t('books.statusApproved')}</Text>
                </View>
                <View style={[styles.statusBadge, (book.paymentStatus || book.payment_status) === 'paid' ? styles.statusSuccess : styles.statusPending]}>
                  <Ionicons name={(book.paymentStatus || book.payment_status) === 'paid' ? 'checkmark-circle-outline' : 'time-outline'} size={14} color={(book.paymentStatus || book.payment_status) === 'paid' ? colors.success : colors.warning} />
                  <Text style={styles.statusText}>{(book.paymentStatus || book.payment_status) === 'paid' ? t('books.statusPaid') : t('books.statusUnpaid')}</Text>
                </View>
              </View>

              <View style={styles.bookDivider} />
              <View style={[styles.bookMeta, { flexDirection: getRowDirection(isRTL) }]}>
                <View style={styles.metaItem}><Ionicons name="calendar-outline" size={16} color={colors.textSoft} /><Text style={styles.metaText}>{book.firstVisitDateIso ? formatDate(book.firstVisitDateIso, language) : '-'}</Text></View>
                <View style={styles.metaItem}><Ionicons name="wallet-outline" size={16} color={colors.textSoft} /><Text style={styles.metaText}>{formatCurrency(book.paymentAmountIqd || book.payment_amount_iqd || VACCINE_BOOK_PRICE_IQD, language)}</Text></View>
              </View>
            </TouchableOpacity>
          ))}
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
    padding: spacing.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  warningTxt: {
    color: colors.danger,
    fontWeight: '700'
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: '900',
    color: colors.secondary,
    marginBottom: spacing.md
  },
  helper: {
    color: colors.textSoft,
    marginBottom: spacing.md,
    fontSize: typography.bodySm,
    lineHeight: 20
  },
  priceNotice: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  priceNoticeTitle: {
    color: colors.secondary,
    fontSize: typography.label,
    fontWeight: '900',
    marginBottom: 4
  },
  priceNoticeText: {
    color: colors.text,
    fontSize: typography.bodySm,
    lineHeight: 20,
    fontWeight: '700'
  },
  paymentLockText: {
    color: colors.warning,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    fontSize: typography.bodySm,
    lineHeight: 20,
    fontWeight: '800'
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
    backgroundColor: colors.accentSoft
  },
  dropdownItemTxt: {
    color: colors.text,
    fontWeight: '700'
  },
  doseCard: {
    backgroundColor: '#F7FBFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
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
    backgroundColor: colors.accentSoft
  },
  clearBtn: {
    flex: 0.45,
    backgroundColor: colors.surfaceMuted
  },
  selectedOption: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.primaryDark
  },
  smallBtnTxt: {
    color: colors.secondary,
    fontWeight: '800',
    fontSize: typography.caption
  },
  saveBtn: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft
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
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    paddingVertical: 11,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft
  },
  booksHero: {
    backgroundColor: colors.secondary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadows.card
  },
  booksHeroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(108,197,199,0.14)',
    right: -55,
    top: -85
  },
  booksHeroRow: { alignItems: 'center', gap: spacing.md },
  booksHeroIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  booksHeroCopy: { flex: 1 },
  booksHeroTitle: { color: '#fff', fontSize: typography.h3, fontWeight: '900' },
  booksHeroSubtitle: { color: '#CFE0E2', fontSize: typography.bodySm, lineHeight: 20, marginTop: 4 },
  booksHeroStat: { alignItems: 'baseline', gap: 7, marginTop: spacing.lg },
  booksHeroNumber: { color: colors.accent, fontSize: typography.h2, fontWeight: '900' },
  booksHeroStatText: { color: '#fff', fontSize: typography.caption, fontWeight: '700' },
  createBookBtn: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.secondary, borderRadius: radius.lg, paddingHorizontal: spacing.md, ...shadows.soft },
  createBookIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  recordsHeading: { alignItems: 'center', gap: 8, marginTop: spacing.sm },
  recordsTitle: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900' },
  recordsCount: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  recordsCountText: { color: colors.secondary, fontSize: typography.caption, fontWeight: '900' },
  emptyCard: { alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.xl },
  emptyIcon: { width: 62, height: 62, borderRadius: 21, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle: { color: colors.secondary, fontSize: typography.body, fontWeight: '900', textAlign: 'center' },
  emptySubtitle: { color: colors.textSoft, fontSize: typography.bodySm, lineHeight: 20, textAlign: 'center', marginTop: 5 },
  bookTop: { alignItems: 'center', gap: spacing.sm },
  petThumb: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.surfaceMuted },
  petThumbFallback: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  bookMain: { flex: 1 },
  petName: { color: colors.secondary, fontSize: typography.h3, fontWeight: '900' },
  ownerName: { color: colors.textSoft, fontSize: typography.bodySm, marginTop: 3 },
  openIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F0F7F7', alignItems: 'center', justifyContent: 'center' },
  statusRow: { flexWrap: 'wrap', gap: 7, marginTop: spacing.md },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6 },
  statusPending: { backgroundColor: '#FFF6E7' },
  statusSuccess: { backgroundColor: '#EAF8F1' },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { color: colors.text, fontSize: typography.caption, fontWeight: '800' },
  bookDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  bookMeta: { alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: colors.textSoft, fontSize: typography.caption, fontWeight: '700' }
});
