import React from 'react';
import { I18nManager, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import CartScreen from './src/screens/CartScreen';
import PetsVaccinesScreen from './src/screens/PetsVaccinesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
}

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    primary: colors.secondary,
    card: '#ffffff',
    border: colors.border,
    text: colors.text
  }
};

function AppTabs() {
  const insets = useSafeAreaInsets();

  const iconByRoute = {
    الرئيسية: 'home',
    المتجر: 'storefront',
    التصنيفات: 'grid',
    السلة: 'cart',
    'الحيوانات واللقاحات': 'medkit',
    حسابي: 'person-circle'
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        initialRouteName="الرئيسية"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.secondary,
          tabBarInactiveTintColor: '#7e87a0',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? iconByRoute[route.name] : `${iconByRoute[route.name]}-outline`}
              size={size}
              color={color}
            />
          ),
          tabBarStyle: {
            height: 68 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: '#fff'
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '800'
          }
        })}
      >
        <Tab.Screen name="الرئيسية" component={HomeScreen} />
        <Tab.Screen name="المتجر" component={ShopScreen} />
        <Tab.Screen name="التصنيفات" component={CategoriesScreen} />
        <Tab.Screen name="السلة" component={CartScreen} />
        <Tab.Screen name="الحيوانات واللقاحات" component={PetsVaccinesScreen} />
        <Tab.Screen name="حسابي" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar
            barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
            backgroundColor={colors.primary}
          />
          <AppTabs />
        </View>
      </SafeAreaProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg
  }
});
