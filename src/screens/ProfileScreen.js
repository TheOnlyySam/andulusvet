import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  const { isReady, isLoggedIn, currentUser, authSignIn, authSignUp, authSignOut } = useContext(AppContext);
  const [authMode, setAuthMode] = useState('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitAuth = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('بيانات ناقصة', 'يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    const action = authMode === 'signin' ? authSignIn : authSignUp;
    const result = await action({ username, password });

    if (!result.ok) {
      Alert.alert('تنبيه', result.message || 'تعذر تنفيذ العملية.');
      return;
    }

    setPassword('');
    Alert.alert('نجاح', authMode === 'signin' ? 'تم تسجيل الدخول.' : 'تم إنشاء الحساب وتسجيل الدخول.');
  };

  const logout = async () => {
    await authSignOut();
    Alert.alert('تم', 'تم تسجيل الخروج.');
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.title}>حسابي</Text>
        <View style={styles.card}>
          <Text style={styles.line}>جاري تحميل البيانات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>حسابي</Text>

      {isLoggedIn ? (
        <View style={styles.card}>
          <Text style={styles.line}>اسم المستخدم: {currentUser.username}</Text>
          <Text style={styles.hint}>هذا حساب محلي محفوظ على نفس الجهاز.</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.btnTxt}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, authMode === 'signin' && styles.modeBtnActive]}
              onPress={() => setAuthMode('signin')}
            >
              <Text style={[styles.modeTxt, authMode === 'signin' && styles.modeTxtActive]}>تسجيل الدخول</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, authMode === 'signup' && styles.modeBtnActive]}
              onPress={() => setAuthMode('signup')}
            >
              <Text style={[styles.modeTxt, authMode === 'signup' && styles.modeTxtActive]}>إنشاء حساب</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>اسم المستخدم</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="example_user"
            placeholderTextColor="#8f99b0"
            textAlign="right"
          />

          <Text style={styles.label}>كلمة المرور</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="********"
            placeholderTextColor="#8f99b0"
            textAlign="right"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={submitAuth}>
            <Text style={styles.btnTxt}>{authMode === 'signin' ? 'دخول' : 'تسجيل'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.secondary,
    textAlign: 'right',
    marginTop: 4
  },
  card: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    padding: 16
  },
  line: {
    textAlign: 'right',
    color: colors.text,
    marginBottom: 10,
    fontWeight: '700'
  },
  hint: {
    textAlign: 'right',
    color: colors.muted,
    marginBottom: 16
  },
  modeRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 14
  },
  modeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f7f8fb'
  },
  modeBtnActive: {
    borderColor: colors.secondary,
    backgroundColor: '#e9efff'
  },
  modeTxt: {
    color: colors.muted,
    fontWeight: '700'
  },
  modeTxtActive: {
    color: colors.secondary
  },
  label: {
    textAlign: 'right',
    color: colors.secondary,
    marginBottom: 6,
    fontWeight: '800'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: colors.text,
    backgroundColor: '#fff'
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    alignItems: 'center'
  },
  logoutBtn: {
    borderRadius: 12,
    backgroundColor: '#b42318',
    paddingVertical: 12,
    alignItems: 'center'
  },
  btnTxt: {
    color: '#fff',
    fontWeight: '900'
  }
});
