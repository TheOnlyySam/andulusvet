import React, { useContext } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider, AppContext } from './src/context/AppContext';
import { LocalizationProvider, useLocalization } from './src/context/LocalizationContext';
import { APP_ROUTES } from './src/constants/navigation';
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import CartScreen from './src/screens/CartScreen';
import PetsVaccinesScreen from './src/screens/PetsVaccinesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import AdminProductsScreen from './src/screens/AdminProductsScreen';
import AdminDiscountsScreen from './src/screens/AdminDiscountsScreen';
import AdminVaccinesScreen from './src/screens/AdminVaccinesScreen';
import ToastBanner from './src/components/ToastBanner';
import { colors, radius, shadows } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppTabs() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocalization();
  const { cartCount, toast } = useContext(AppContext);

  const routeNameByKey = {
    home: t('nav.home'),
    shop: t('nav.shop'),
    categories: t('nav.categories'),
    cart: t('nav.cart'),
    books: t('nav.books'),
    profile: t('nav.profile')
  };

  const iconByRoute = {
    [routeNameByKey.home]: 'home',
    [routeNameByKey.shop]: 'storefront',
    [routeNameByKey.categories]: 'grid',
    [routeNameByKey.cart]: 'cart',
    [routeNameByKey.books]: 'medkit',
    [routeNameByKey.profile]: 'person-circle'
  };

  return (
    <>
      <ToastBanner visible={Boolean(toast)} message={toast ? t(toast.messageKey) : ''} />
      <Tab.Navigator
        initialRouteName={routeNameByKey.home}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.secondary,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '800'
          },
          tabBarItemStyle: {
            direction: isRTL ? 'rtl' : 'ltr',
            paddingTop: 2
          },
          tabBarStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 70 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
            borderTopWidth: 0,
            backgroundColor: '#fff',
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            shadowColor: '#173436',
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
            ...shadows.card
          },
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? iconByRoute[route.name] : `${iconByRoute[route.name]}-outline`}
              size={focused ? size + 2 : size}
              color={color}
            />
          )
        })}
      >
        <Tab.Screen name={routeNameByKey.home} component={HomeScreen} />
        <Tab.Screen name={routeNameByKey.shop} component={ShopScreen} />
        <Tab.Screen name={routeNameByKey.categories} component={CategoriesScreen} />
        <Tab.Screen
          name={routeNameByKey.cart}
          component={CartScreen}
          options={{
            tabBarBadge: cartCount ? cartCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: colors.accent,
              color: colors.secondary,
              fontWeight: '900',
              top: 4
            }
          }}
        />
        <Tab.Screen name={routeNameByKey.books} component={PetsVaccinesScreen} />
        <Tab.Screen name={routeNameByKey.profile} component={ProfileScreen} />
      </Tab.Navigator>
    </>
  );
}

function AppShell() {
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      primary: colors.secondary,
      card: '#ffffff',
      border: colors.border,
      text: colors.text
    }
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={APP_ROUTES.tabs} component={AppTabs} />
        <Stack.Screen name={APP_ROUTES.signIn} component={SignInScreen} />
        <Stack.Screen name={APP_ROUTES.signUp} component={SignUpScreen} />
        <Stack.Screen name={APP_ROUTES.privacyPolicy} component={PrivacyPolicyScreen} />
        <Stack.Screen name={APP_ROUTES.termsOfService} component={TermsOfServiceScreen} />
        <Stack.Screen name={APP_ROUTES.notifications} component={NotificationsScreen} />
        <Stack.Screen name={APP_ROUTES.adminHome} component={AdminHomeScreen} />
        <Stack.Screen name={APP_ROUTES.adminProducts} component={AdminProductsScreen} />
        <Stack.Screen name={APP_ROUTES.adminDiscounts} component={AdminDiscountsScreen} />
        <Stack.Screen name={APP_ROUTES.adminVaccines} component={AdminVaccinesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LocalizationProvider>
      <AppProvider>
        <SafeAreaProvider>
          <View style={styles.root}>
            <StatusBar
              barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
              backgroundColor={colors.background}
            />
            <AppShell />
          </View>
        </SafeAreaProvider>
      </AppProvider>
    </LocalizationProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  }
});
