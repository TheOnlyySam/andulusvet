import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { getAuthBootstrap, signInWithRole, signOutUser, signUpWithRole } from '../services/authService';
import { fetchProfile, upsertProfile } from '../services/profileService';
import { fetchProductsFromRepository, createProductInRepository } from '../services/catalogRepository';
import { fetchDiscountRulesFromRepository, createDiscountRuleInRepository } from '../services/discountRepository';
import {
  fetchVaccineBooks,
  createVaccineBookRecord,
  updateVaccineBookApproval,
  updateVaccineBookPayment,
  updateVaccineBookSchedule
} from '../services/bookingRepository';
import { createNotification, fetchNotifications, markNotificationsRead } from '../services/notificationService';
import { calculateDiscounts } from '../services/discountService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true
  })
});

export const AppContext = createContext(null);
const BOOTSTRAP_TIMEOUT_MS = 12000;
const VACCINE_BOOK_PRICE_IQD = 5000;

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Bootstrap timed out.')), timeoutMs);
    })
  ]);
}

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAnimalType, setSelectedAnimalType] = useState(null);
  const [selectedLifeStage, setSelectedLifeStage] = useState(null);
  const [selectedFoodFocus, setSelectedFoodFocus] = useState(null);

  const [isReady, setIsReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [discountRules, setDiscountRules] = useState([]);
  const [vaccineBooks, setVaccineBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [isBooksLoading, setIsBooksLoading] = useState(false);

  useEffect(() => {
    bootstrap();
    Notifications.requestPermissionsAsync().catch(() => null);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const refreshCatalog = useCallback(async () => {
    setIsCatalogLoading(true);
    try {
      const [productsResult, discountsResult] = await Promise.allSettled([
        fetchProductsFromRepository(),
        fetchDiscountRulesFromRepository()
      ]);

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value);
      } else {
        console.log('Unable to refresh products', productsResult.reason);
      }

      if (discountsResult.status === 'fulfilled') {
        setDiscountRules(discountsResult.value);
      } else {
        console.log('Unable to refresh discount rules', discountsResult.reason);
      }
    } finally {
      setIsCatalogLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async (userId, role) => {
    if (!userId || !role) {
      setNotifications([]);
      return;
    }

    setIsNotificationsLoading(true);
    try {
      const nextNotifications = await fetchNotifications({ userId, role });
      setNotifications(nextNotifications);
    } finally {
      setIsNotificationsLoading(false);
    }
  }, []);

  const refreshVaccineBooks = useCallback(async (userId, role) => {
    if (!userId || !role) {
      setVaccineBooks([]);
      return;
    }

    setIsBooksLoading(true);
    try {
      const nextBooks = await fetchVaccineBooks({ userId, role });
      setVaccineBooks(nextBooks);
    } finally {
      setIsBooksLoading(false);
    }
  }, []);

  const hydrateUserState = useCallback(async (user) => {
    if (!user) {
      setSession(null);
      setCurrentUser(null);
      setCurrentProfile(null);
      setNotifications([]);
      setVaccineBooks([]);
      return;
    }

    setSession({ user });
    setCurrentUser(user);
    const profile = await fetchProfile(user);
    setCurrentProfile(profile);
    await Promise.all([
      refreshNotifications(user.id, profile?.role || 'customer'),
      refreshVaccineBooks(user.id, profile?.role || 'customer')
    ]);
  }, [refreshNotifications, refreshVaccineBooks]);

  const bootstrap = useCallback(async () => {
    try {
      try {
        const authState = await withTimeout(getAuthBootstrap(), BOOTSTRAP_TIMEOUT_MS);
        await withTimeout(hydrateUserState(authState.user), BOOTSTRAP_TIMEOUT_MS);
      } catch (error) {
        console.log('Unable to bootstrap auth state', error);
      }

      await withTimeout(refreshCatalog(), BOOTSTRAP_TIMEOUT_MS);
    } catch (error) {
      console.log('Unable to bootstrap app state', error);
    } finally {
      setIsReady(true);
    }
  }, [hydrateUserState, refreshCatalog]);

  const showToast = (messageKey) => setToast({ id: uid('toast'), messageKey });

  const authSignUp = async ({ email, displayName, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword || !cleanDisplayName) {
      return { ok: false, messageKey: 'profile.missingAuth' };
    }

    try {
      const user = await signUpWithRole({
        identifier: cleanEmail,
        password: cleanPassword,
        metadata: {
          username: cleanEmail.split('@')[0],
          display_name: cleanDisplayName,
          role: 'customer'
        }
      });

      const profile = await upsertProfile({
        user,
        username: cleanEmail.split('@')[0],
        displayName: cleanDisplayName,
        role: 'customer'
      });

      setCurrentProfile(profile);
      await hydrateUserState(user);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const authSignIn = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const user = await signInWithRole({
        identifier: cleanEmail,
        password: cleanPassword
      });

      await hydrateUserState(user);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const authSignOut = async () => {
    await signOutUser();
    await hydrateUserState(null);
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
    if (!currentUser?.id) {
      return { ok: false, messageKey: 'alerts.requiredLogin' };
    }

    try {
      const enrichedRecords = [];
      for (const item of records) {
        const notificationId = await scheduleNotification(item.petName, item.vaccineName, item.dateIso);
        enrichedRecords.push({
          ...item,
          notificationId,
          created_at: new Date().toISOString()
        });
      }

      const payload = {
        userId: currentUser.id,
        user_id: currentUser.id,
        client_name: clientName,
        location,
        pet_name: petName,
        pet_type: petType,
        first_visit_date_iso: firstVisitDateIso,
        firstVisitDateIso,
        pet_birth_date_iso: petBirthDateIso || null,
        owner_phone: ownerPhone || '',
        owner_email: ownerEmail || '',
        vet_name: vetName,
        protocol,
        approval_status: currentProfile?.role === 'admin' ? 'approved' : 'pending',
        approved_at: currentProfile?.role === 'admin' ? new Date().toISOString() : null,
        payment_status: currentProfile?.role === 'admin' ? 'paid' : 'unpaid',
        payment_amount_iqd: VACCINE_BOOK_PRICE_IQD,
        book_count: 1,
        paid_at: currentProfile?.role === 'admin' ? new Date().toISOString() : null,
        notes: notes || '',
        attachment: attachment || null,
        image: image || null,
        created_at: new Date().toISOString(),
        records: enrichedRecords
      };

      const book = await createVaccineBookRecord(payload);

      if (currentProfile?.role === 'admin') {
        await createNotification({
          title: { ar: 'تم إنشاء ملف لقاح', en: 'A vaccine file was created' },
          message: { ar: `${clientName} - ${petName}`, en: `${clientName} - ${petName}` },
          audience: 'user',
          type: 'booking',
          is_read: false,
          user_id: currentUser.id
        });
      } else {
        await createNotification({
          title: { ar: 'طلب دفتر لقاح جديد', en: 'New digital vaccine book request' },
          message: {
            ar: `${clientName} - ${petName} بانتظار دفع ٥,٠٠٠ د.ع`,
            en: `${clientName} - ${petName} is awaiting IQD 5,000 payment`
          },
          audience: 'all',
          type: 'booking',
          is_read: false
        });
      }
      await refreshVaccineBooks(currentUser.id, currentProfile?.role || 'customer');
      await refreshNotifications(currentUser.id, currentProfile?.role || 'customer');
      return { ok: true, book };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const updateVaccineBookRecords = async ({ bookId, records }) => {
    try {
      await updateVaccineBookSchedule({ bookId, records });
      await refreshVaccineBooks(currentUser?.id, currentProfile?.role || 'customer');
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const approveVaccineBook = async (bookId) => {
    if (!isAdmin) {
      return { ok: false, message: 'Admin access is required.' };
    }

    try {
      await updateVaccineBookApproval({ bookId, approvalStatus: 'approved' });
      await refreshVaccineBooks(currentUser?.id, currentProfile?.role || 'customer');
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const markVaccineBookPaid = async (bookId) => {
    if (!isAdmin) {
      return { ok: false, message: 'Admin access is required.' };
    }

    try {
      await updateVaccineBookPayment({ bookId, paymentStatus: 'paid' });
      await refreshVaccineBooks(currentUser?.id, currentProfile?.role || 'customer');
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const createAdminProduct = async (payload) => {
    if (!isAdmin) {
      throw new Error('Admin access is required.');
    }
    const created = await createProductInRepository({
      ...payload,
      created_by: currentUser?.id || null
    });
    await refreshCatalog();
    await createNotification({
      title: { ar: 'تمت إضافة منتج جديد', en: 'A new product was added' },
      message: payload.name,
      audience: 'user',
      type: 'product',
      is_read: false,
      user_id: currentUser?.id || null
    });
    await refreshNotifications(currentUser?.id, currentProfile?.role || 'customer');
    return created;
  };

  const createAdminDiscount = async (payload) => {
    if (!isAdmin) {
      throw new Error('Admin access is required.');
    }
    const created = await createDiscountRuleInRepository({
      ...payload,
      created_by: currentUser?.id || null
    });
    await refreshCatalog();
    await createNotification({
      title: { ar: 'تم إنشاء خصم جديد', en: 'A new discount was created' },
      message: payload.label,
      audience: 'user',
      type: 'discount',
      is_read: false,
      user_id: currentUser?.id || null
    });
    await refreshNotifications(currentUser?.id, currentProfile?.role || 'customer');
    return created;
  };

  const markAllNotificationsAsRead = async () => {
    const unreadIds = notifications
      .filter((item) => !(item.isRead || item.is_read))
      .filter((item) => isAdmin || item.userId === currentUser?.id || item.user_id === currentUser?.id)
      .map((item) => item.id);

    if (!unreadIds.length) {
      return;
    }

    await markNotificationsRead(unreadIds);
    await refreshNotifications(currentUser?.id, currentProfile?.role || 'customer');
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

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const cartSummary = useMemo(
    () => calculateDiscounts(cart, discountRules),
    [cart, discountRules]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((item) => !(item.isRead || item.is_read)).length,
    [notifications]
  );

  const isLoggedIn = Boolean(currentUser);
  const isAdmin = currentProfile?.role === 'admin';
  const vaccineBooksForUser = useMemo(() => {
    if (isAdmin) return vaccineBooks;
    return vaccineBooks.filter((book) => (book.userId || book.user_id) === currentUser?.id);
  }, [currentUser?.id, isAdmin, vaccineBooks]);

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
    isLoggedIn,
    isAdmin,
    session,
    currentUser,
    currentProfile,
    authSignUp,
    authSignIn,
    authSignOut,
    products,
    discountRules,
    vaccineBooks,
    vaccineBooksForUser,
    notifications,
    unreadNotificationsCount,
    isCatalogLoading,
    isNotificationsLoading,
    isBooksLoading,
    refreshCatalog,
    refreshNotifications,
    refreshVaccineBooks,
    createVaccineBook,
    updateVaccineBookRecords,
    approveVaccineBook,
    markVaccineBookPaid,
    VACCINE_BOOK_PRICE_IQD,
    createAdminProduct,
    createAdminDiscount,
    markAllNotificationsAsRead,
    toast,
    setToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
