import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, glows } from '../../../constants/theme';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertOptions = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

type CustomAlertContextType = {
  showAlert: (options: AlertOptions) => void;
};

const CustomAlertContext = createContext<CustomAlertContextType | undefined>(undefined);

export const CustomAlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({ title: '' });

  const showAlert = (options: AlertOptions) => {
    setConfig({
      ...options,
      buttons: options.buttons || [{ text: 'OK', style: 'default' }],
    });
    setVisible(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handlePress = (btn: AlertButton) => {
    setVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (btn.onPress) btn.onPress();
  };

  return (
    <CustomAlertContext.Provider value={{ showAlert }}>
      {children}
      
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Animated.View entering={ZoomIn.duration(200)} style={styles.alertBox}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
            
            <View style={styles.content}>
              <Text style={styles.title}>{config.title}</Text>
              {config.message && <Text style={styles.message}>{config.message}</Text>}
              
              <View style={styles.buttonRow}>
                {config.buttons?.map((btn, i) => {
                  const isDestructive = btn.style === 'destructive';
                  const isCancel = btn.style === 'cancel';
                  
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.button,
                        isDestructive && styles.buttonDestructive,
                        isCancel && styles.buttonCancel,
                        !isDestructive && !isCancel && styles.buttonDefault,
                      ]}
                      onPress={() => handlePress(btn)}
                    >
                      <Text style={[
                        styles.buttonText,
                        (isDestructive || !isCancel) && { color: '#fff' },
                        isCancel && { color: colors.muted }
                      ]}>
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </CustomAlertContext.Provider>
  );
};

export const useCustomAlert = () => {
  const context = useContext(CustomAlertContext);
  if (!context) throw new Error('useCustomAlert must be used within CustomAlertProvider');
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  alertBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...glows.surface,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDefault: {
    backgroundColor: colors.primary,
    ...glows.primary,
  },
  buttonDestructive: {
    backgroundColor: colors.error,
  },
  buttonCancel: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});