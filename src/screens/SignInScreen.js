import React, { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FormField from '../components/FormField';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { APP_ROUTES } from '../constants/navigation';
import { useLocalization } from '../context/LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getTextAlign } from '../utils/format';

export default function SignInScreen() {
  const navigation = useNavigation();
  const { authSignIn } = useContext(AppContext);
  const { isRTL, t } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    const result = await authSignIn({ email, password });

    if (!result.ok) {
      Alert.alert(t('alerts.warning'), result.messageKey ? t(result.messageKey) : result.message || t('alerts.error'));
      return;
    }

    Alert.alert(t('alerts.success'), t('profile.signInSuccess'));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={t('profile.signIn')} subtitle={t('profile.signInSubtitle')} showLanguage />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={[styles.heroTitle, { textAlign: getTextAlign(isRTL) }]}>{t('profile.signInHero')}</Text>
          <Text style={[styles.heroText, { textAlign: getTextAlign(isRTL) }]}>{t('profile.authHint')}</Text>
        </View>
        <View style={styles.formCard}>
          <FormField
            label={t('profile.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="name@example.com"
          />
          <FormField
            label={t('profile.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            placeholder="********"
          />
          <Pressable style={styles.primaryButton} onPress={submit}>
            <Text style={styles.primaryText}>{t('profile.signIn')}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate(APP_ROUTES.signUp)}>
            <Text style={styles.secondaryText}>{t('profile.createAccountPrompt')}</Text>
          </Pressable>
          <View style={styles.legalRow}>
            <Pressable onPress={() => navigation.navigate(APP_ROUTES.privacyPolicy)}>
              <Text style={styles.legalLink}>{t('profile.privacyPolicy')}</Text>
            </Pressable>
            <Text style={styles.legalDivider}>•</Text>
            <Pressable onPress={() => navigation.navigate(APP_ROUTES.termsOfService)}>
              <Text style={styles.legalLink}>{t('profile.termsOfService')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md
  },
  content: {
    paddingBottom: spacing.xxl
  },
  heroCard: {
    backgroundColor: colors.secondary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card
  },
  heroTitle: {
    color: '#fff',
    fontSize: typography.h2,
    fontWeight: '900'
  },
  heroText: {
    color: '#DDEDEA',
    fontSize: typography.body,
    marginTop: spacing.sm,
    lineHeight: 23
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  primaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center'
  },
  primaryText: {
    color: '#fff',
    fontSize: typography.button,
    fontWeight: '900'
  },
  secondaryButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: 12
  },
  secondaryText: {
    color: colors.primaryDeep,
    fontSize: typography.bodySm,
    fontWeight: '800'
  },
  legalRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  legalLink: {
    color: colors.textSoft,
    fontSize: typography.caption,
    fontWeight: '700'
  },
  legalDivider: {
    color: colors.border,
    fontSize: typography.caption
  }
});
