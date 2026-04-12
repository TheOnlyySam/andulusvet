import React, { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { buildCheckoutSummary } from '../services/orderService';

const STORAGE_KEYS = {
  users: 'andulusvet_users_v1',
  session: 'andulusvet_session_v1',
  vaccineBooks: 'andulusvet_vaccine_books_v5'
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
  const [toast, setToast] = useState(null);

  useEffect(() => {
    bootstrap();
    registerNotifications();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const registerNotifications = async () => {
    await Notifications.requestPermissionsAsync();
  };

  const bootstrap = async () => {
    try {
      await AsyncStorage.multiRemove([
        'andulusvet_vaccines',
        'andulusvet_vaccine_books_v1',
        'andulusvet_vaccine_books_v2',
        'andulusvet_vaccine_books_v3',
        'andulusvet_vaccine_books_v4'
      ]);

      const [rawUsers, rawSession, rawBooks] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.users),
        AsyncStorage.getItem(STORAGE_KEYS.session),
        AsyncStorage.getItem(STORAGE_KEYS.vaccineBooks)
      ]);

      if (rawUsers) setUsers(JSON.parse(rawUsers));
      if (rawSession) setCurrentUserId(rawSession);
      if (rawBooks) setVaccineBooks(JSON.parse(rawBooks));
    } catch (error) {
      console.log('Unable to bootstrap app state', error);
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

  const currentUser = useMemo(() => users.find((user) => user.id === currentUserId) || null, [users, currentUserId]);
  const isLoggedIn = Boolean(currentUser);

  const vaccineBooksForUser = useMemo(
    () => vaccineBooks.filter((book) => book.userId === currentUserId),
    [vaccineBooks, currentUserId]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const cartSummary = useMemo(() => buildCheckoutSummary(cart), [cart]);

  const authSignUp = async ({ username, password }) => {
    const cleanUsername = sanitizeUsername(username);
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { ok: false, messageKey: 'profile.missingAuth' };
    }

    const exists = users.some((user) => user.username === cleanUsername);
    if (exists) {
      return { ok: false, message: 'Username already exists.' };
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

    const user = users.find((item) => item.username === cleanUsername && item.password === cleanPassword);
    if (!user) {
      return { ok: false, message: 'Invalid username or password.' };
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
        title: 'Vaccine Reminder',
        body: `${vaccineName} is due for ${petName}`
      },
      trigger: {
        date: new Date(dateIso)
      }
    });
  };

  const createVaccineBook = async ({
    clientName,
    location,
    petName,
    petType,
    firstVisitDateIso,
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
      return { ok: false, messageKey: 'alerts.requiredLogin' };
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
      clientName,
      location,
      petName,
      petType,
      firstVisitDateIso,
      referenceDateIso: firstVisitDateIso,
      petBirthDateIso: petBirthDateIso || null,
      ownerPhone: ownerPhone || '',
      ownerEmail: ownerEmail || '',
      vetName,
      protocol,
      notes: notes || '',
      attachment: attachment || null,
      image: image || null,
      createdAt: new Date().toISOString(),
      records: enrichedRecords
    };

    const next = [book, ...vaccineBooks];
    await persistBooks(next);
    return { ok: true, book };
  };

  const updateVaccineBookRecords = async ({ bookId, records }) => {
    const target = vaccineBooks.find((book) => book.id === bookId && book.userId === currentUserId);
    if (!target) {
      return { ok: false, message: 'Vaccine file was not found.' };
    }

    const next = vaccineBooks.map((book) => {
      if (book.id !== target.id) return book;

      return {
        ...book,
        records: records || []
      };
    });

    await persistBooks(next);
    return { ok: true };
  };

  const showToast = (messageKey) => setToast({ id: uid('toast'), messageKey });

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) => (
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        ));
      }

      return [...prev, { ...product, qty: 1 }];
    });
    showToast('alerts.addedToCart');
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

  const clearCatalogFilters = () => {
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedAnimalType(null);
    setSelectedLifeStage(null);
    setSelectedFoodFocus(null);
  };

  const value = {
    cart,
    cartCount,
    cartSummary,
    addToCart,
    removeFromCart,
    changeQty,
    clearCart,
    clearCatalogFilters,
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
    currentUserId,
    isLoggedIn,
    authSignUp,
    authSignIn,
    authSignOut,
    vaccineBooksForUser,
    createVaccineBook,
    updateVaccineBookRecords,
    toast,
    setToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
