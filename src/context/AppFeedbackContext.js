import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../components/BrandLogo';
import { Text } from '../components/Typography';
import { useLocalization } from './LocalizationContext';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { getRowDirection, getTextAlign } from '../utils/format';

const AppFeedbackContext = createContext(null);

const TYPE_CONFIG = {
  success: { icon: 'checkmark-circle', color: colors.success, background: '#EAF7F1' },
  warning: { icon: 'alert-circle', color: colors.warning, background: '#FFF6E8' },
  error: { icon: 'close-circle', color: colors.danger, background: '#FFF0F0' },
  info: { icon: 'information-circle', color: colors.info, background: '#EEF6FA' }
};

export function AppFeedbackProvider({ children }) {
  const { isRTL, t } = useLocalization();
  const loadingTokens = useRef(new Map());
  const [loading, setLoading] = useState({ visible: false, message: '' });
  const [dialog, setDialog] = useState(null);

  const inferType = useCallback((title) => {
    if (title === t('alerts.success')) return 'success';
    if (title === t('alerts.warning') || title === t('alerts.missingData') || title === t('alerts.requiredLogin')) return 'warning';
    if (title === t('alerts.error')) return 'error';
    return 'info';
  }, [t]);

  const showAlert = useCallback((title, message, buttons, options = {}) => {
    const actions = Array.isArray(buttons) && buttons.length
      ? buttons
      : [{ text: t('common.ok') }];

    setDialog({
      id: Date.now(),
      title,
      message,
      actions,
      type: options.type || inferType(title),
      dismissible: options.cancelable !== false
    });
  }, [inferType, t]);

  const hideAlert = useCallback(() => setDialog(null), []);

  const showLoading = useCallback((message) => {
    const token = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    loadingTokens.current.set(token, message || t('common.working'));
    setLoading({ visible: true, message: message || t('common.working') });
    return token;
  }, [t]);

  const hideLoading = useCallback((token) => {
    loadingTokens.current.delete(token);
    const remaining = Array.from(loadingTokens.current.values());
    setLoading({
      visible: remaining.length > 0,
      message: remaining[remaining.length - 1] || ''
    });
  }, []);

  const withLoading = useCallback(async (task, message) => {
    const token = showLoading(message);
    try {
      return await task();
    } finally {
      hideLoading(token);
    }
  }, [hideLoading, showLoading]);

  const runAction = (action) => {
    setDialog(null);
    if (action.onPress) requestAnimationFrame(action.onPress);
  };

  const dialogConfig = TYPE_CONFIG[dialog?.type] || TYPE_CONFIG.info;
  const value = useMemo(() => ({
    showAlert,
    hideAlert,
    showLoading,
    hideLoading,
    withLoading
  }), [hideAlert, hideLoading, showAlert, showLoading, withLoading]);

  return (
    <AppFeedbackContext.Provider value={value}>
      {children}

      <Modal
        visible={Boolean(dialog)}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => dialog?.dismissible && hideAlert()}
      >
        <View style={styles.overlay}>
          <View style={StyleSheet.absoluteFill} />
          <View style={styles.dialog} accessibilityViewIsModal>
            <View style={[styles.dialogTop, { flexDirection: getRowDirection(isRTL) }]}>
              <BrandLogo compact />
              <View style={[styles.iconWrap, { backgroundColor: dialogConfig.background }]}>
                <Ionicons name={dialogConfig.icon} size={28} color={dialogConfig.color} />
              </View>
            </View>
            <Text style={[styles.dialogTitle, { textAlign: getTextAlign(isRTL) }]}>{dialog?.title}</Text>
            {dialog?.message ? (
              <Text style={[styles.dialogMessage, { textAlign: getTextAlign(isRTL) }]}>{dialog.message}</Text>
            ) : null}
            <View style={[styles.actions, { flexDirection: getRowDirection(isRTL) }]}>
              {dialog?.actions.map((action, index) => {
                const isSecondary = action.style === 'cancel' || dialog.actions.length > 1 && index === 0;
                return (
                  <Pressable
                    key={`${action.text}-${index}`}
                    style={({ pressed }) => [
                      styles.actionButton,
                      isSecondary ? styles.secondaryButton : styles.primaryButton,
                      action.style === 'destructive' && styles.destructiveButton,
                      pressed && styles.pressed
                    ]}
                    onPress={() => runAction(action)}
                  >
                    <Text style={isSecondary ? styles.secondaryText : styles.primaryText}>{action.text}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={loading.visible} transparent statusBarTranslucent animationType="fade">
        <View style={styles.loadingOverlay} accessibilityViewIsModal accessibilityLabel={loading.message}>
          <View style={styles.loadingCard}>
            <View style={styles.loaderMark}>
              <ActivityIndicator size="large" color={colors.secondary} />
            </View>
            <Text style={[styles.loadingText, { textAlign: 'center' }]}>{loading.message}</Text>
          </View>
        </View>
      </Modal>
    </AppFeedbackContext.Provider>
  );
}

export function useAppFeedback() {
  const context = useContext(AppFeedbackContext);
  if (!context) throw new Error('useAppFeedback must be used inside AppFeedbackProvider.');
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(15, 31, 45, 0.48)'
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card
  },
  dialogTop: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dialogTitle: {
    color: colors.secondary,
    fontSize: typography.h3,
    fontWeight: '900'
  },
  dialogMessage: {
    color: colors.textSoft,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md
  },
  primaryButton: {
    backgroundColor: colors.secondary
  },
  secondaryButton: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  destructiveButton: {
    backgroundColor: colors.danger
  },
  primaryText: {
    color: '#fff',
    fontSize: typography.button,
    fontWeight: '900'
  },
  secondaryText: {
    color: colors.secondary,
    fontSize: typography.button,
    fontWeight: '900'
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(15, 31, 45, 0.36)'
  },
  loadingCard: {
    minWidth: 190,
    maxWidth: 300,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    ...shadows.card
  },
  loaderMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.md
  },
  loadingText: {
    color: colors.secondary,
    fontSize: typography.body,
    fontWeight: '800',
    lineHeight: 22
  }
});
