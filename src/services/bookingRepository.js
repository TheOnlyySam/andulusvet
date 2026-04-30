import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '../lib/supabase';

const STORAGE_KEY = 'andulusvet_vaccine_books_v6';
const VACCINE_BOOK_PRICE_IQD = 5000;

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
    approval_status: payload.approval_status || payload.approvalStatus || 'approved',
    approved_at: payload.approved_at || payload.approvedAt || null,
    payment_status: payload.payment_status || payload.paymentStatus || 'paid',
    payment_amount_iqd: Number(payload.payment_amount_iqd || payload.paymentAmountIqd || 0),
    book_count: Number(payload.book_count || payload.bookCount || 1),
    paid_at: payload.paid_at || payload.paidAt || null,
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
  const approvalStatus = book.approvalStatus || book.approval_status || 'approved';

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
    approvalStatus,
    approvedAt: book.approvedAt || book.approved_at || null,
    paymentStatus: book.paymentStatus || book.payment_status || (approvalStatus === 'pending' ? 'unpaid' : 'paid'),
    paymentAmountIqd: Number(book.paymentAmountIqd || book.payment_amount_iqd || VACCINE_BOOK_PRICE_IQD),
    bookCount: Number(book.bookCount || book.book_count || 1),
    paidAt: book.paidAt || book.paid_at || null,
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
  const insertBook = async (bookPayload) =>
    supabase
      .from('vaccine_books')
      .insert(bookPayload)
      .select()
      .single();

  let bookResponse = await insertBook(toVaccineBookRow(payload));
  const missingColumnMessage = String(bookResponse.error?.message || '').toLowerCase();
  const optionalColumnMissing =
    missingColumnMessage.includes('approval_status') ||
    missingColumnMessage.includes('payment_status') ||
    missingColumnMessage.includes('payment_amount_iqd') ||
    missingColumnMessage.includes('book_count') ||
    missingColumnMessage.includes('paid_at');

  if (optionalColumnMissing) {
    const fallbackPayload = toVaccineBookRow(payload);
    delete fallbackPayload.approval_status;
    delete fallbackPayload.approved_at;
    delete fallbackPayload.payment_status;
    delete fallbackPayload.payment_amount_iqd;
    delete fallbackPayload.book_count;
    delete fallbackPayload.paid_at;
    bookResponse = await insertBook(fallbackPayload);
  }

  if (bookResponse.error) throw bookResponse.error;
  const book = bookResponse.data;

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

export async function updateVaccineBookApproval({ bookId, approvalStatus }) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const books = await getLocalBooks();
    const next = books.map((book) =>
      book.id === bookId
        ? {
            ...book,
            approvalStatus,
            approval_status: approvalStatus,
            approvedAt: approvalStatus === 'approved' ? new Date().toISOString() : null,
            approved_at: approvalStatus === 'approved' ? new Date().toISOString() : null
          }
        : book
    );
    await setLocalBooks(next);
    return true;
  }

  const patch = {
    approval_status: approvalStatus,
    approved_at: approvalStatus === 'approved' ? new Date().toISOString() : null
  };

  const { error } = await supabase
    .from('vaccine_books')
    .update(patch)
    .eq('id', bookId);

  if (error) throw error;
  return true;
}

export async function updateVaccineBookPayment({ bookId, paymentStatus }) {
  const supabase = getSupabaseClient();
  const paidAt = paymentStatus === 'paid' ? new Date().toISOString() : null;
  const approvalStatus = paymentStatus === 'paid' ? 'approved' : 'pending';

  if (!supabase) {
    const books = await getLocalBooks();
    const next = books.map((book) =>
      book.id === bookId
        ? {
            ...book,
            paymentStatus,
            payment_status: paymentStatus,
            paidAt,
            paid_at: paidAt,
            approvalStatus,
            approval_status: approvalStatus,
            approvedAt: paidAt,
            approved_at: paidAt
          }
        : book
    );
    await setLocalBooks(next);
    return true;
  }

  const patch = {
    payment_status: paymentStatus,
    paid_at: paidAt,
    approval_status: approvalStatus,
    approved_at: paidAt
  };

  const { error } = await supabase
    .from('vaccine_books')
    .update(patch)
    .eq('id', bookId);

  if (!error) return true;

  const fallbackPatch = {
    approval_status: approvalStatus,
    approved_at: paidAt
  };

  const { error: fallbackError } = await supabase
    .from('vaccine_books')
    .update(fallbackPatch)
    .eq('id', bookId);

  if (fallbackError) throw fallbackError;
  return true;
}
