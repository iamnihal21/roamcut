import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../constants/theme';

const TIPS = [
  {
    icon: 'flash-outline',
    title: 'Export faster',
    text: 'Tag your best clips with "Must Use" to speed up processing.',
  },
  {
    icon: 'color-palette-outline',
    title: 'Perfect colour',
    text: 'Adjust the intensity slider to control LUT strength.',
  },
  {
    icon: 'musical-notes-outline',
    title: 'Sync to the beat',
    text: 'Templates use beat markers to time your cuts automatically.',
  },
];

const UPDATES = [
  {
    version: 'v1.0.0',
    title: 'RoamCut Launch',
    features: ['20 templates across 8 categories', 'On-device processing', 'Pro export options'],
  },
];

export default function Tips() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Tips & Tricks</Text>
      
      <FlatList
        horizontal
        data={TIPS}
        keyExtractor={(item) => item.title}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name={item.icon as any} size={24} color={colors.primary} />
            </View>
            <Text style={styles.tipTitle}>{item.title}</Text>
            <Text style={styles.tipText}>{item.text}</Text>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>What's New</Text>
      {UPDATES.map((update) => (
        <View key={update.version} style={styles.updateCard}>
          <View style={styles.updateHeader}>
            <Text style={styles.updateVersion}>{update.version}</Text>
            <Text style={styles.updateDate}>{update.title}</Text>
          </View>
          {update.features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 80, paddingBottom: spacing.xxl },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: spacing.xl },
  sectionTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  tipCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(225,112,85,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tipTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  tipText: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  updateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  updateHeader: { marginBottom: spacing.md },
  updateVersion: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  updateDate: { color: colors.text, fontSize: 14, marginTop: 2 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted,
    marginRight: spacing.md,
  },
  featureText: { color: colors.text, fontSize: 14 },
  backButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backButtonText: { color: colors.muted, fontSize: 14 },
});