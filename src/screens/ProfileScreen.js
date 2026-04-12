import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign } from '../utils/format';

export default function ProfileScreen() {
  const { isReady, isLoggedIn, currentUser, authSignIn, authSignUp, authSignOut } = useContext(AppContext);
  const { isRTL, t } = useLocalization();
  const [authMode, setAuthMode] = useState('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitAuth = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(t('alerts.missingData'), t('profile.missingAuth'));
      return;
    }

    const action = authMode === 'signin' ? authSignIn : authSignUp;
    const result = await action({ username, password });

    if (!result.ok) {
      Alert.alert(t('alerts.warning'), result.messageKey ? t(result.messageKey) : result.message || t('alerts.error'));
      return;
    }

    setPassword('');
    Alert.alert(t('alerts.success'), authMode === 'signin' ? t('profile.signInSuccess') : t('profile.signUpSuccess'));
  };

  const logout = async () => {
    await authSignOut();
    Alert.alert(t('alerts.success'), t('profile.logoutSuccess'));
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title={t('profile.title')} subtitle={t('common.loading')} showLanguage />
        <View style={styles.card}>
          <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('profile.title')} subtitle={t('profile.localHint')} showLanguage />

      {isLoggedIn ? (
        <View style={styles.card}>
          <Text style={[styles.line, { textAlign: getTextAlign(isRTL) }]}>
            {t('profile.username')}: {currentUser.username}
          </Text>
          <Text style={[styles.hint, { textAlign: getTextAlign(isRTL) }]}>{t('profile.localHint')}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.btnTxt}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={[styles.modeRow, { flexDirection: getRowDirection(isRTL) }]}>
            <TouchableOpacity
              style={[styles.modeBtn, authMode === 'signin' && styles.modeBtnActive]}
              onPress={() => setAuthMode('signin')}
            >
              <Text style={[styles.modeTxt, authMode === 'signin' && styles.modeTxtActive]}>{t('profile.signIn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, authMode === 'signup' && styles.modeBtnActive]}
              onPress={() => setAuthMode('signup')}
            >
              <Text style={[styles.modeTxt, authMode === 'signup' && styles.modeTxtActive]}>{t('profile.signUp')}</Text>
            </TouchableOpacity>
          </View>

          <FormField
            label={t('profile.username')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="example_user"
          />
          <FormField
            label={t('profile.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="********"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={submitAuth}>
            <Text style={styles.btnTxt}>{authMode === 'signin' ? t('profile.signIn') : t('profile.signUp')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md
  },
  card: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    padding: spacing.lg,
    ...shadows.card
  },
  line: {
    color: colors.text,
    marginBottom: 10,
    fontWeight: '700',
    fontSize: typography.body
  },
  hint: {
    color: colors.textSoft,
    marginBottom: spacing.lg,
    fontSize: typography.bodySm,
    lineHeight: 20
  },
  modeRow: {
    gap: 8,
    marginBottom: spacing.md
  },
  modeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F7FBF9'
  },
  modeBtnActive: {
    borderColor: colors.secondary,
    backgroundColor: '#E9F3EE'
  },
  modeTxt: {
    color: colors.textSoft,
    fontWeight: '700'
  },
  modeTxtActive: {
    color: colors.secondary
  },
  submitBtn: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    alignItems: 'center'
  },
  logoutBtn: {
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    paddingVertical: 14,
    alignItems: 'center'
  },
  btnTxt: {
    color: '#fff',
    fontWeight: '900',
    fontSize: typography.body
  }
});
