import React, { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STORAGE_KEYS = {
  users: 'andulusvet_users_v1',
  session: 'andulusvet_session_v1',
  vaccineBooks: 'andulusvet_vaccine_books_v4'
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true
  })
});

export const AppContext = createContext(null);

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeUsername(username) {
  return username.trim().toLowerCase();
}

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAnimalType, setSelectedAnimalType] = useState(null);
  const [selectedLifeStage, setSelectedLifeStage] = useState(null);
  const [selectedFoodFocus, setSelectedFoodFocus] = useState(null);

  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [vaccineBooks, setVaccineBooks] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    bootstrap();
    registerNotifications();
  }, []);

  const registerNotifications = async () => {
    await Notifications.requestPermissionsAsync();
  };

  const bootstrap = async () => {
    try {
      await AsyncStorage.multiRemove([
        'andulusvet_vaccines',
        'andulusvet_vaccine_books_v1',
        'andulusvet_vaccine_books_v2',
        'andulusvet_vaccine_books_v3'
      ]);

      const [rawUsers, rawSession, rawBooks] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.users),
        AsyncStorage.getItem(STORAGE_KEYS.session),
        AsyncStorage.getItem(STORAGE_KEYS.vaccineBooks)
      ]);

      if (rawUsers) setUsers(JSON.parse(rawUsers));
      if (rawSession) setCurrentUserId(rawSession);
      if (rawBooks) setVaccineBooks(JSON.parse(rawBooks));
    } catch (e) {
      console.log('تعذر تحميل بيانات التطبيق', e);
    } finally {
      setIsReady(true);
    }
  };

  const persistUsers = async (next) => {
    setUsers(next);
    await AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(next));
  };

  const persistSession = async (userId) => {
    setCurrentUserId(userId);
    if (userId) {
      await AsyncStorage.setItem(STORAGE_KEYS.session, userId);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.session);
    }
  };

  const persistBooks = async (next) => {
    setVaccineBooks(next);
    await AsyncStorage.setItem(STORAGE_KEYS.vaccineBooks, JSON.stringify(next));
  };

  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) || null, [users, currentUserId]);
  const isLoggedIn = Boolean(currentUser);

  const vaccineBooksForUser = useMemo(
    () => vaccineBooks.filter((book) => book.userId === currentUserId),
    [vaccineBooks, currentUserId]
  );

  const authSignUp = async ({ username, password }) => {
    const cleanUsername = sanitizeUsername(username);
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { ok: false, message: 'يرجى إدخال اسم مستخدم وكلمة مرور.' };
    }

    const exists = users.some((u) => u.username === cleanUsername);
    if (exists) {
      return { ok: false, message: 'اسم المستخدم مستخدم مسبقا.' };
    }

    const nextUser = {
      id: uid('user'),
      username: cleanUsername,
      password: cleanPassword,
      createdAt: new Date().toISOString()
    };

    const nextUsers = [nextUser, ...users];
    await persistUsers(nextUsers);
    await persistSession(nextUser.id);

    return { ok: true, user: nextUser };
  };

  const authSignIn = async ({ username, password }) => {
    const cleanUsername = sanitizeUsername(username);
    const cleanPassword = password.trim();

    const user = users.find((u) => u.username === cleanUsername && u.password === cleanPassword);
    if (!user) {
      return { ok: false, message: 'بيانات الدخول غير صحيحة.' };
    }

    await persistSession(user.id);
    return { ok: true, user };
  };

  const authSignOut = async () => {
    await persistSession(null);
  };

  const scheduleNotification = async (petName, vaccineName, dateIso) => {
    if (new Date(dateIso).getTime() <= Date.now()) {
      return null;
    }

    return Notifications.scheduleNotificationAsync({
      content: {
        title: 'تذكير اللقاح',
        body: `حان موعد ${vaccineName} للحيوان ${petName}`
      },
      trigger: {
        date: new Date(dateIso)
      }
    });
  };

  const createVaccineBook = async ({
    petName,
    petType,
    referenceDateIso,
    petBirthDateIso,
    ownerPhone,
    ownerEmail,
    vetName,
    protocol,
    notes,
    attachment,
    image,
    records
  }) => {
    if (!currentUserId) {
      return { ok: false, message: 'يرجى تسجيل الدخول أولا.' };
    }

    const enrichedRecords = [];
    for (const item of records) {
      const notificationId = await scheduleNotification(item.petName, item.vaccineName, item.dateIso);
      enrichedRecords.push({
        id: uid('dose'),
        ...item,
        notificationId
      });
    }

    const book = {
      id: uid('book'),
      userId: currentUserId,
      petName,
      petType,
      referenceDateIso,
      petBirthDateIso: petBirthDateIso || null,
      ownerPhone: ownerPhone || '',
      ownerEmail: ownerEmail || '',
      vetName,
      protocol,
      notes: notes || '',
      attachment: attachment || '',
      image: image || null,
      createdAt: new Date().toISOString(),
      records: enrichedRecords
    };

    const next = [book, ...vaccineBooks];
    await persistBooks(next);
    return { ok: true, book };
  };

  const addManualDoseToBook = async ({ bookId, vaccineName, dateIso, notes }) => {
    const target = vaccineBooks.find((book) => book.id === bookId && book.userId === currentUserId);
    if (!target) {
      return { ok: false, message: 'دفتر اللقاح غير موجود.' };
    }

    const notificationId = await scheduleNotification(target.petName, vaccineName, dateIso);
    const nextDose = {
      id: uid('dose'),
      petName: target.petName,
      petType: target.petType,
      vaccineName,
      dateIso,
      notes,
      notificationId
    };

    const next = vaccineBooks.map((book) =>
      book.id === target.id ? { ...book, records: [nextDose, ...(book.records || [])] } : book
    );

    await persistBooks(next);
    return { ok: true };
  };

  const updateVaccineBookRecords = async ({ bookId, records }) => {
    const target = vaccineBooks.find((book) => book.id === bookId && book.userId === currentUserId);
    if (!target) {
      return { ok: false, message: 'دفتر اللقاح غير موجود.' };
    }

    const next = vaccineBooks.map((book) =>
      book.id === target.id ? { ...book, records: records || [] } : book
    );

    await persistBooks(next);
    return { ok: true };
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const value = {
    cart,
    cartTotal,
    addToCart,
    removeFromCart,
    changeQty,
    clearCart,
    selectedBrand,
    setSelectedBrand,
    selectedCategory,
    setSelectedCategory,
    selectedAnimalType,
    setSelectedAnimalType,
    selectedLifeStage,
    setSelectedLifeStage,
    selectedFoodFocus,
    setSelectedFoodFocus,
    isReady,
    users,
    currentUser,
    isLoggedIn,
    authSignUp,
    authSignIn,
    authSignOut,
    vaccineBooksForUser,
    createVaccineBook,
    addManualDoseToBook,
    updateVaccineBookRecords
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
