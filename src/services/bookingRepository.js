import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '../lib/supabase';

const STORAGE_KEY = 'andulusvet_vaccine_books_v6';

function toBookingRecordRow(record, vaccineBookId) {
  return {
    vaccine_book_id: vaccineBookId || record.vaccine_book_id || record.vaccineBookId,
    pet_name: record.pet_name || record.petName || '',
    pet_type: record.pet_type || record.petType || '',
    vaccine_name: record.vaccine_name || record.vaccineName || '',
    date_iso: record.date_iso || record.dateIso || null,
    planned_date_iso: record.planned_date_iso || record.plannedDateIso || record.date_iso || record.dateIso || null,
    received_date_iso: record.received_date_iso || record.receivedDateIso || null,
    notes: record.notes || '',
    attachments: record.attachments || []
  };
}

function toVaccineBookRow(payload) {
  return {
    user_id: payload.user_id || payload.userId,
    client_name: payload.client_name || payload.clientName || '',
    location: payload.location || '',
    pet_name: payload.pet_name || payload.petName || '',
    pet_type: payload.pet_type || payload.petType || '',
    first_visit_date_iso: payload.first_visit_date_iso || payload.firstVisitDateIso || '',
    pet_birth_date_iso: payload.pet_birth_date_iso || payload.petBirthDateIso || null,
    owner_phone: payload.owner_phone || payload.ownerPhone || '',
    owner_email: payload.owner_email || payload.ownerEmail || '',
    vet_name: payload.vet_name || payload.vetName || '',
    protocol: payload.protocol || null,
    notes: payload.notes || '',
    attachment: payload.attachment || null,
    image: payload.image || null
  };
}

function normalizeBookingRecord(record) {
  return {
    ...record,
    petName: record.petName || record.pet_name || '',
    petType: record.petType || record.pet_type || '',
    vaccineName: record.vaccineName || record.vaccine_name || '',
    dateIso: record.dateIso || record.date_iso || null,
    plannedDateIso: record.plannedDateIso || record.planned_date_iso || record.dateIso || record.date_iso || null,
    receivedDateIso: record.receivedDateIso || record.received_date_iso || null
  };
}

function normalizeBook(book) {
  return {
    ...book,
    userId: book.userId || book.user_id,
    clientName: book.clientName || book.client_name || '',
    petName: book.petName || book.pet_name || '',
    petType: book.petType || book.pet_type || '',
    firstVisitDateIso: book.firstVisitDateIso || book.first_visit_date_iso || '',
    petBirthDateIso: book.petBirthDateIso || book.pet_birth_date_iso || '',
    ownerPhone: book.ownerPhone || book.owner_phone || '',
    ownerEmail: book.ownerEmail || book.owner_email || '',
    vetName: book.vetName || book.vet_name || '',
    records: (book.records || book.booking_records || []).map(normalizeBookingRecord)
  };
}

async function getLocalBooks() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function setLocalBooks(books) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export async function fetchVaccineBooks({ role, userId }) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const books = await getLocalBooks();
    const filtered = role === 'admin' ? books : books.filter((book) => (book.userId || book.user_id) === userId);
    return filtered.map(normalizeBook);
  }

  let query = supabase
    .from('vaccine_books')
    .select('*, booking_records(*)')
    .order('created_at', { ascending: false });

  if (role !== 'admin') {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((item) => ({
    ...normalizeBook(item),
    records: (item.booking_records || []).map(normalizeBookingRecord)
  }));
}

export async function createVaccineBookRecord(payload) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const books = await getLocalBooks();
    const next = [payload, ...books];
    await setLocalBooks(next);
    return normalizeBook(payload);
  }

  const { records = [] } = payload;
  const { data: book, error: bookError } = await supabase
    .from('vaccine_books')
    .insert(toVaccineBookRow(payload))
    .select()
    .single();

  if (bookError) throw bookError;

  if (records.length) {
    const { error: recordsError } = await supabase
      .from('booking_records')
      .insert(
        records.map((record) => toBookingRecordRow(record, book.id))
      );

    if (recordsError) throw recordsError;
  }

  return {
    ...normalizeBook(book),
    records: records.map(normalizeBookingRecord)
  };
}

export async function updateVaccineBookSchedule({ bookId, records }) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const books = await getLocalBooks();
    const next = books.map((book) => (book.id === bookId ? { ...book, records } : book));
    await setLocalBooks(next);
    return true;
  }

  const { error: deleteError } = await supabase
    .from('booking_records')
    .delete()
    .eq('vaccine_book_id', bookId);

  if (deleteError) throw deleteError;

  if (records.length) {
    const { error: insertError } = await supabase
      .from('booking_records')
      .insert(
        records.map((record) => toBookingRecordRow(record, bookId))
      );

    if (insertError) throw insertError;
  }

  return true;
}
