import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppStore } from '../src/store/useAppStore';
import { PACK_CONTENTS, loadTemplate } from '../src/services/templates';
import { colors, spacing, radius } from '../constants/theme';

const PACKS = [
  {
    id: 'tropical_escape',
    name: 'Tropical Escape',
    description: 'Beaches, islands, mountains, heritage.',
    color: '#00B894',
    size: '24 MB',
  },
  {
    id: 'city_pulse',
    name: 'City Pulse',
    description: 'Urban energy, temples, forests.',
    color: '#A29BFE',
    size: '18 MB',
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    description: 'Food, road trips, local culture.',
    color: '#E17055',
    size: '22 MB',
  },
];

export default function PackStore() {
  const router = useRouter();
  const installedPacks = useAppStore((s) => s.installedPacks);
  const installPack = useAppStore((s) => s.installPack);
  const uninstallPack = useAppStore((s) => s.uninstallPack);
  const isPro = useAppStore((s) => s.isPro);

  const [downloading, setDownloading] = useState<Record<string, number>>({});

  const startDownload = (id: string) => {
    if (downloading[id] !== undefined) return;
    setDownloading((prev) => ({ ...prev, [id]: 0 }));

    const interval = setInterval(() => {
      setDownloading((prev) => {
        const current = prev[id] ?? 0;
        
        if (current >= 0.9) {
          clearInterval(interval);
          // Schedule the install AFTER the state update finishes.
          // This prevents the React "update during render" crash.
          setTimeout(() => installPack(id), 10);
          return { ...prev, [id]: 1 };
        }
        
        return { ...prev, [id]: current + 0.1 };
      });
    }, 200);
  };

  const confirmRemove = (id: string, name: string) => {
    // React Native Web doesn't support Alert.alert, so we use the browser API.
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Remove ${name}? Templates from this pack will disappear from your Home screen.`
      );
      if (confirmed) uninstallPack(id);
      return;
    }

    // Native iOS / Android Alert
    Alert.alert(
      `Remove ${name}?`,
      'Templates from this pack will disappear from your Home screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => uninstallPack(id),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Template Packs</Text>
      <Text style={styles.subtitle}>
        {isPro
          ? 'Pro unlocks every pack automatically.'
          : 'Download packs to unlock more templates.'}
      </Text>

      {PACKS.map((pack) => {
        const contents = PACK_CONTENTS[pack.id] ?? [];
        const installed = installedPacks.includes(pack.id);
        const progress = downloading[pack.id];
        const isDownloading = progress !== undefined && progress < 1;

        return (
          <View key={pack.id} style={styles.card}>
            <View style={[styles.preview, { backgroundColor: pack.color }]}>
              <Ionicons name="layers" size={32} color="rgba(255,255,255,0.5)" />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.headerRow}>
                <Text style={styles.cardTitle}>{pack.name}</Text>
                <Text style={styles.cardSize}>{pack.size}</Text>
              </View>
              <Text style={styles.cardDesc}>{pack.description}</Text>

              <View style={styles.actionRow}>
                <Text style={styles.templateCount}>
                  {contents.length} templates
                </Text>

                {installed || isPro ? (
                  <View style={styles.doneButton}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.doneText}>
                      {isPro && !installed ? 'Included' : 'Installed'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => startDownload(pack.id)}
                    disabled={isDownloading}
                  >
                    <Text style={styles.downloadText}>
                      {isDownloading ? 'Downloading…' : 'Download'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {isDownloading && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(progress ?? 0) * 100}%` },
                    ]}
                  />
                </View>
              )}

              {/* Tiny chip preview of contents */}
              <View style={styles.templateList}>
                {contents.slice(0, 4).map((tid) => {
                  const t = loadTemplate(tid);
                  return (
                    <View
                      key={tid}
                      style={[styles.templateChip, { borderColor: t.color }]}
                    >
                      <Text style={styles.templateChipText}>{t.name}</Text>
                    </View>
                  );
                })}
                {contents.length > 4 && (
                  <Text style={styles.moreText}>+{contents.length - 4} more</Text>
                )}
              </View>

              {installed && !isPro && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => confirmRemove(pack.id, pack.name)}
                >
                  <Text style={styles.removeBtnText}>Remove pack</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 80, paddingBottom: spacing.xxl },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold' },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  cardSize: { color: colors.muted, fontSize: 11 },
  cardDesc: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateCount: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  downloadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.button,
  },
  downloadText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.button,
  },
  doneText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  progressBar: {
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  templateList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.sm,
  },
  templateChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  templateChipText: { color: colors.text, fontSize: 9 },
  moreText: { color: colors.muted, fontSize: 9, alignSelf: 'center' },
  removeBtn: {
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  removeBtnText: { color: colors.error, fontSize: 11, fontWeight: '600' },
  backButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backButtonText: { color: colors.muted, fontSize: 14 },
});