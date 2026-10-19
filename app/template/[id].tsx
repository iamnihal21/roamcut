import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import {
  templates,
  getEffectsForCategory,
} from '../../constants/templates';
import { colors, spacing, radius, glows } from '../../constants/theme';
import { PlayIcon, ShareIcon } from '../../src/components/icons';
import { useTranslation } from '../../src/hooks/useTranslation';
import { GlowButton } from '../../src/components/ui/GlowButton';

export default function TemplateDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTemplateName } = useTranslation();
  const [qrVisible, setQrVisible] = useState(false);

  const template = templates.find((tt) => tt.id === id);

  if (!template) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: colors.text }}>Template not found</Text>
      </View>
    );
  }

  const localizedName = getTemplateName(template.id, template.name);
  const effects = getEffectsForCategory(template.category);

  const similar = templates
    .filter((tt) => tt.category === template.category && tt.id !== template.id)
    .slice(0, 4);

  // SOW Section 14: QR Code Deep Link
  const deepLink = `roamcut://template/${template.id}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Modern Preview Section */}
      <LinearGradient
        colors={[template.color, '#0B0B14']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.preview}
      >
        <BlurView intensity={30} tint="light" style={styles.playOverlay}>
          <PlayIcon color="#fff" size={32} />
        </BlurView>

        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>~15s</Text>
        </View>

        {/* Gradient overlay so text is readable */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.previewBottom}
        >
          <Text style={styles.previewName}>{localizedName}</Text>
        </LinearGradient>
      </LinearGradient>

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{localizedName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{template.category}</Text>
            </View>
            <Text style={styles.metaText}>
              Up to {template.maxClips} clips
            </Text>
          </View>
        </View>
        
        {/* Glass QR Button */}
        <TouchableOpacity 
          style={styles.qrButton} 
          onPress={() => setQrVisible(true)}
        >
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <ShareIcon color={colors.primary} size={20} />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{template.description}</Text>

      {/* Effect Breakdown (Glassmorphism) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Effect breakdown</Text>
        <BlurView intensity={20} tint="dark" style={styles.effectsList}>
          {effects.map((effect, index) => (
            <View key={index} style={styles.effectRow}>
              <View style={styles.bullet} />
              <Text style={styles.effectText}>{effect}</Text>
            </View>
          ))}
        </BlurView>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>At a glance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{template.maxClips}</Text>
            <Text style={styles.statLabel}>Max clips</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>~15s</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>9:16</Text>
            <Text style={styles.statLabel}>Aspect</Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaWrapper}>
        <GlowButton
          title="Use Template"
          onPress={() => router.push(`/editor/${template.id}`)}
        />
      </View>

      {/* Similar templates */}
      {similar.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar templates</Text>
          <FlatList
            horizontal
            data={similar}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.replace(`/template/${item.id}`)}
                style={[styles.similarCard, glows.surface]}
              >
                <LinearGradient
                  colors={[item.color, '#000000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.similarName}>{getTemplateName(item.id, item.name)}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* QR Code Modal */}
      <Modal
        visible={qrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setQrVisible(false)}>
          <BlurView intensity={50} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Scan to use template</Text>
              <Text style={styles.modalSubtitle}>{localizedName}</Text>
              
              <View style={styles.qrWrap}>
                <QRCode
                  value={deepLink}
                  size={200}
                  color={colors.text}
                  backgroundColor={colors.surface}
                />
              </View>
              
              <Text style={styles.modalHint}>
                Have a friend scan this code to instantly open this template in RoamCut.
              </Text>
              
              <TouchableOpacity 
                style={styles.modalCloseBtn} 
                onPress={() => setQrVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Pressable>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  
  /* Preview */
  preview: {
    height: 480,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    marginLeft: -36,
    marginTop: -36,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  durationBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  previewBottom: {
    padding: spacing.xl,
    paddingTop: 60,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
  previewName: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },

  /* Header */
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: 'rgba(225,112,85,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pillText: { color: colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  metaText: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    fontWeight: '500',
  },

  /* Sections */
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  
  /* Effects */
  effectsList: {
    borderRadius: 16,
    padding: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  effectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  effectText: { color: colors.text, fontSize: 15, fontWeight: '500' },

  /* Stats */
  statsGrid: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: { color: colors.primary, fontSize: 24, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 4, fontWeight: '600', textTransform: 'uppercase' },

  /* CTA */
  ctaWrapper: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },

  /* Similar Templates */
  similarCard: {
    width: 140,
    height: 100,
    borderRadius: 16,
    padding: spacing.md,
    justifyContent: 'flex-end',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  similarName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  
  /* Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...glows.surface,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xl,
  },
  qrWrap: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.xl,
  },
  modalHint: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  modalCloseBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalCloseText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});