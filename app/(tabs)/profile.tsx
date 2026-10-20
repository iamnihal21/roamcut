import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../src/store/useAppStore';
import { colors, spacing, radius, glows, gradients } from '../../constants/theme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { LANGUAGES } from '../../constants/languages';
import { registerForNotificationsAsync, triggerTestNotification } from '../../src/services/notifications';
import { CrownIcon } from '../../src/components/icons';
import { useCustomAlert } from '../../src/components/ui/CustomAlert';

export default function Profile() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { reels, isPro, notificationsEnabled, setNotificationsEnabled, setPro } = useAppStore();
  const [reducedMotion, setReducedMotion] = useState(false);
  const { showAlert } = useCustomAlert();

  const usageMB = Math.min(900, reels.length * 45 + 30);
  const currentLanguage = LANGUAGES.find(l => l.code === language)?.label || 'English';

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await registerForNotificationsAsync();
      if (!granted) {
        showAlert({ title: 'Permission Required', message: 'Please enable notifications in your device settings.' });
      }
      setNotificationsEnabled(granted);
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{t.profile.title}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.subscription}</Text>
        {isPro ? (
          <LinearGradient colors={['rgba(0,184,148,0.2)', 'rgba(0,184,148,0.05)']} style={[styles.upsellCard, { borderColor: colors.success }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CrownIcon color={colors.success} size={20} />
                <Text style={[styles.upsellTitle, { color: colors.success }]}>RoamCut Pro</Text>
              </View>
              <Text style={styles.upsellText}>All 20 templates · no watermark · 1080p</Text>
            </View>
          </LinearGradient>
        ) : (
          <TouchableOpacity style={[styles.upsellCard, glows.primary]} onPress={() => router.push('/paywall')}>
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.upsellTitle, { color: '#fff' }]}>{t.profile.freePlan}</Text>
              <Text style={[styles.upsellText, { color: 'rgba(255,255,255,0.8)' }]}>{t.profile.freePlanDetail}</Text>
            </View>
            <View style={styles.upsellBadge}>
              <Text style={styles.upsellBadgeText}>{t.profile.upgrade}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.language}</Text>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/language')}>
          <Text style={styles.rowLabel}>{currentLanguage}</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.preferences}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t.profile.notifications}</Text>
          <Switch value={notificationsEnabled} onValueChange={handleNotificationToggle} trackColor={{ false: colors.surface, true: colors.primary }} thumbColor="#fff" />
        </View>
        {notificationsEnabled && (
          <TouchableOpacity style={[styles.row, { justifyContent: 'center' }]} onPress={() => triggerTestNotification(language)}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Send Test Notification</Text>
          </TouchableOpacity>
        )}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t.profile.reducedMotion}</Text>
          <Switch value={reducedMotion} onValueChange={setReducedMotion} trackColor={{ false: colors.surface, true: colors.primary }} thumbColor="#fff" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.storage}</Text>
        <View style={styles.storageCard}>
          <Text style={styles.storageUsed}>{usageMB} MB <Text style={{ fontSize: 14, color: colors.muted }}>/ 1000 MB</Text></Text>
          <View style={styles.storageBar}>
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.storageFill, { width: `${Math.min(100, (usageMB / 1000) * 100)}%` }]} />
          </View>
          <Text style={styles.storageMeta}>{reels.length} reels · {t.profile.onDeviceOnly}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.about}</Text>
        <TouchableOpacity style={styles.row} onPress={() => showAlert({ title: 'RoamCut', message: 'Version 1.0.0' })}>
          <Text style={styles.rowLabel}>{t.profile.version}</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/tips')}>
          <Text style={styles.rowLabel}>Tips & What's New</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => showAlert({ title: 'RoamCut', message: 'Thanks for using RoamCut!' })}>
          <Text style={styles.rowLabel}>{t.profile.rateApp}</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>{t.profile.footer}</Text>

      <TouchableOpacity style={styles.devBtn} onPress={() => { setPro(!isPro); useAppStore.setState({ reels: [] }); showAlert({ title: 'Dev Mode', message: `Switched to ${!isPro ? 'PRO' : 'FREE'}` }); }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>[DEV ONLY] Toggle {isPro ? 'Free' : 'Pro'} Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: 120 },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: spacing.md, textTransform: 'uppercase' },
  
  upsellCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  upsellTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  upsellText: { color: colors.muted, fontSize: 13, marginTop: 4 },
  upsellBadge: { backgroundColor: '#fff', paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.button },
  upsellBadgeText: { color: colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  rowLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  rowValue: { color: colors.muted, fontSize: 15 },
  rowChevron: { color: colors.muted, fontSize: 22, fontWeight: '300' },
  
  storageCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  storageUsed: { color: colors.text, fontSize: 18, fontWeight: '700' },
  storageBar: { height: 10, backgroundColor: colors.background, borderRadius: 5, overflow: 'hidden', marginTop: spacing.md },
  storageFill: { height: '100%', borderRadius: 5 },
  storageMeta: { color: colors.muted, fontSize: 12, marginTop: spacing.md, fontWeight: '500' },
  
  footer: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: spacing.xl, fontWeight: '500' },
  devBtn: { marginTop: 30, padding: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
});