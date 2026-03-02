import React, { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = 'andulusvet_vaccines';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true
  })
});

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAnimalType, setSelectedAnimalType] = useState(null);
  const [selectedLifeStage, setSelectedLifeStage] = useState(null);
  const [selectedFoodFocus, setSelectedFoodFocus] = useState(null);
  const [vaccineBook, setVaccineBook] = useState([]);

  useEffect(() => {
    loadVaccines();
    registerNotifications();
  }, []);

  const registerNotifications = async () => {
    await Notifications.requestPermissionsAsync();
  };

  const loadVaccines = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setVaccineBook(JSON.parse(raw));
      }
    } catch (e) {
      console.log('تعذر تحميل دفتر اللقاحات', e);
    }
  };

  const saveVaccines = async (next) => {
    setVaccineBook(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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

  const addVaccineRecord = async ({ petName, vaccineName, dateIso, notes }) => {
    const notificationId = await scheduleNotification(petName, vaccineName, dateIso);

    const record = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      petName,
      vaccineName,
      dateIso,
      notes,
      notificationId
    };

    const next = [record, ...vaccineBook];
    await saveVaccines(next);
  };

  const addVaccinePlan = async (records) => {
    const enriched = [];

    for (const item of records) {
      const notificationId = await scheduleNotification(
        item.petName,
        item.vaccineName,
        item.dateIso
      );

      enriched.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...item,
        notificationId
      });
    }

    const next = [...enriched, ...vaccineBook];
    await saveVaccines(next);
  };

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
    vaccineBook,
    addVaccineRecord,
    addVaccinePlan
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
