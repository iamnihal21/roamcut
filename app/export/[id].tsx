import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Animated as RNAnimated,
  Easing,
  ScrollView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing as REasing,
} from 'react-native-reanimated';
// FIXED IMPORT HERE:
import * as MediaLibrary from 'expo-media-library/legacy';

import { useAppStore } from '../../src/store/useAppStore';
import { templates } from '../../constants/templates';
import { colors, spacing, radius } from '../../constants/theme';
import { CheckIcon, ShareIcon, CompassIcon } from '../../src/components/icons';
import { Confetti } from '../../src/components/Confetti';
import { useTranslation } from '../../src/hooks/useTranslation';
import { processReel } from '../../src/services/ffmpeg';

const FACTS = [
  { emoji: '🌅', text: 'Iceland has no mosquitoes at all — perfect for outdoor shoots.', gradient: ['#F39C12', '#E17055'] as const },
  { emoji: '🗻', text: 'Japan has more than 5.5 million vending machines — great candid b-roll.', gradient: ['#74B9FF', '#0F3460'] as const },
  { emoji: '🏝️', text: 'Banff’s Moraine Lake only appears turquoise for a few summer weeks.', gradient: ['#00B894', '#0984E3'] as const },
  { emoji: '🌊', text: 'Sunset at the equator happens in under 5 minutes — shoot fast.', gradient: ['#FD79A8', '#6C5CE7'] as const },
  { emoji: '🛶', text: 'Venice has 391 bridges — pack light for that gondola shot.', gradient: ['#A29BFE', '#0F3460'] as const },
  { emoji: '🏔️', text: 'Lisbon is built on 7 hills — drone shots look unreal at golden hour.', gradient: ['#FDCB6E', '#E17055'] as const },
];

const PLATFORMS = [
  { id: 'native', label: 'More' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
] as const;

type PlatformId = (typeof PLATFORMS)[number]['id'];
type Resolution = '720p' | '1080p';

function formatDuration(sec: number) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Export() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, language, getTemplateName } = useTranslation();

  const {
    selectedVideos,
    clipDurations,
    intensity,
    mustUse,
    mustAvoid,
    addReel,
    isPro,
    reels,
  } = useAppStore();

  const template = templates.find((t) => t.id === id);
  const localizedName = template ? getTemplateName(template.id, template.name) : '';

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [statusText, setStatusText] = useState('Initializing...');

  const [platform, setPlatform] = useState<PlatformId>('native');
  const [resolution, setResolution] = useState<Resolution>(isPro ? '1080p' : '720p');
  const [watermark, setWatermark] = useState(true);

  const pulse = useMemo(() => new RNAnimated.Value(0.85), []);
  const spinValue = useSharedValue(0);

  useEffect(() => {
    if (!done) {
      spinValue.value = withRepeat(withTiming(1, { duration: 2000, easing: REasing.linear }), -1, false);
    } else {
      spinValue.value = withTiming(0, { duration: 500 });
    }
  }, [done]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value * 360}deg` }],
  }));

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setFactIndex((i) => (i + 1) % FACTS.length);
    }, 2500);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        RNAnimated.timing(pulse, { toValue: 0.85, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const checkReelLimit = () => {
    if (isPro) return true;
    const now = new Date();
    const reelsThisMonth = reels.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    if (reelsThisMonth.length >= 3) {
      Alert.alert(
        'Monthly Limit Reached',
        'Free tier is limited to 3 reels per month. Upgrade to RoamCut Pro for unlimited exports.',
        [
          { text: 'Not now', style: 'cancel', onPress: () => router.back() },
          { text: 'Go Pro', onPress: () => router.replace('/paywall') },
        ]
      );
      return false;
    }
    return true;
  };

  // THE REAL FFMPEG PROCESSING EFFECT
  useEffect(() => {
    if (done) return;

    let isMounted = true;

    if (!checkReelLimit()) return;

    if (!template || selectedVideos.length === 0) {
      Alert.alert("Debug Error", "Missing template or videos");
      return;
    }

    const runExport = async () => {
      try {
        setStatusText('Processing...');
        const resultUri = await processReel({
          template: template,
          clips: selectedVideos,
          intensity,
          mustUse,
          mustAvoid,
          onProgress: (realProgress) => {
            if (isMounted) {
              setProgress(realProgress);
              setStatusText(`Processing... ${Math.round(realProgress * 100)}%`);
            }
          }
        });

        if (isMounted) {
          setProgress(1);
          setStatusText('Done!');
          setDone(true);

          addReel({
            id: Date.now().toString(),
            templateId: id as string,
            createdAt: Date.now(),
            videoUris: selectedVideos,
            intensity,
            mustUse,
            mustAvoid,
          });

          // Save to Gallery using the legacy API
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
              await MediaLibrary.createAssetAsync(resultUri);
              Alert.alert("Success", "Video saved to gallery!");
            } else {
              Alert.alert("Permission Needed", "Please allow access to save the video to your gallery.");
            }
          } catch (e) {
            console.log("Gallery save failed", e);
          }
        }
      } catch (error: any) {
        // The service already triggers the Alert. We just log and reset here.
        console.error("Export UI caught error:", error);
        setStatusText(`Error: ${error.message}`);
        if (isMounted) setProgress(0);
      }
    };

    runExport();

    return () => { isMounted = false; };
  }, []);

  const totalDuration = useMemo(
    () => selectedVideos.reduce((sum, uri) => sum + (clipDurations[uri] ?? 0), 0),
    [selectedVideos, clipDurations]
  );

  const estimatedSeconds = 15 + selectedVideos.length * 4;
  const remaining = Math.max(0, Math.round(estimatedSeconds * (1 - progress)));
  const currentFact = FACTS[factIndex];

  const trySetResolution = (next: Resolution) => {
    if (next === '1080p' && !isPro) {
      Alert.alert('Pro feature', '1080p export is available on RoamCut Pro. Upgrade to unlock.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Go Pro', onPress: () => router.push('/paywall') },
      ]);
      return;
    }
    setResolution(next);
  };

  const tryToggleWatermark = (next: boolean) => {
    if (!isPro && !next) {
      Alert.alert('Pro feature', 'Removing the watermark is available on RoamCut Pro.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Go Pro', onPress: () => router.push('/paywall') },
      ]);
      return;
    }
    setWatermark(next);
  };

  const platformLabel = PLATFORMS.find((p) => p.id === platform)?.label ?? 'More';

  const handleShare = () => {
    const templateHashtag = `#RoamCut${template?.name?.replace(/\s+/g, '') ?? 'Travel'}`;
    let message = '';
    if (language === 'hi') message = `RoamCut से बनाया गया — ${localizedName} ${templateHashtag} #RoamCut`;
    else if (language === 'ja') message = `RoamCutで作成 — ${localizedName} ${templateHashtag} #RoamCut`;
    else if (language === 'de') message = `Erstellt mit RoamCut — ${localizedName} ${templateHashtag} #RoamCut`;
    else if (language === 'ar') message = `تم الإنشاء بواسطة RoamCut — ${localizedName} ${templateHashtag} #RoamCut`;
    else message = `Made with RoamCut — ${localizedName} ${templateHashtag} #RoamCut`;
    Share.share({ message });
  };

  if (!done) {
    const RADIUS = 60;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const strokeDashoffset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);

    return (
      <View style={styles.container}>
        <Text style={styles.processingTitle}>{t.export.creating}</Text>
        <Text style={styles.processingSubtitle}>{statusText}</Text>

        <RNAnimated.View style={[styles.postcardWrap, { opacity: pulse }]}>
          <LinearGradient colors={currentFact.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.postcard}>
            <Text style={styles.postcardEmoji}>{currentFact.emoji}</Text>
            <Text style={styles.postcardLabel}>YOUR NEXT STOP</Text>
          </LinearGradient>
        </RNAnimated.View>

        <View style={styles.factCard}>
          <Text style={styles.factLabel}>{t.export.didYouKnow}</Text>
          <Text style={styles.factText}>{currentFact.text}</Text>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.circularWrapper}>
            <Svg width={RADIUS * 2 + 20} height={RADIUS * 2 + 20}>
              <Circle cx={RADIUS + 10} cy={RADIUS + 10} r={RADIUS} stroke={colors.surface} strokeWidth={8} fill="none" />
              <Circle cx={RADIUS + 10} cy={RADIUS + 10} r={RADIUS} stroke={colors.primary} strokeWidth={8} fill="none" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform={`rotate(-90 ${RADIUS + 10} ${RADIUS + 10})`} />
            </Svg>
            <Animated.View style={[styles.compassCenter, spinStyle]}>
              <CompassIcon color={colors.primary} size={50} />
            </Animated.View>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
            <Text style={styles.eta}>~{remaining}s left · {selectedVideos.length} clips</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Confetti />
      <ScrollView style={styles.container} contentContainerStyle={styles.successContent} showsVerticalScrollIndicator={false}>
        <View style={styles.successDot}>
          <CheckIcon color="#fff" size={36} />
        </View>
        <Text style={styles.successTitle}>{t.export.exportComplete}</Text>
        <Text style={styles.successSubtitle}>{localizedName} · {selectedVideos.length} clips</Text>

        <View style={styles.beforeAfterBlock}>
          <TouchableOpacity style={styles.baToggle} onPress={() => setShowBeforeAfter(!showBeforeAfter)}>
            <Text style={styles.baToggleText}>{showBeforeAfter ? t.export.hideBeforeAfter : t.export.beforeAfter}</Text>
          </TouchableOpacity>

          {showBeforeAfter && selectedVideos.length > 0 && (
            <View style={styles.baContainer}>
              <View style={styles.baHalf}>
                <Image source={{ uri: selectedVideos[0] }} style={styles.baImage} />
                <View style={styles.baBadge}><Text style={styles.baBadgeText}>BEFORE</Text></View>
              </View>
              <View style={styles.baHalf}>
                <Image source={{ uri: selectedVideos[0] }} style={styles.baImage} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: template?.color ?? colors.primary, opacity: 0.4 }]} />
                <View style={styles.baBadge}><Text style={styles.baBadgeText}>AFTER</Text></View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.export.summaryTemplate}</Text>
            <Text style={styles.summaryValue}>{localizedName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.export.summaryClips}</Text>
            <Text style={styles.summaryValue}>{selectedVideos.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.export.summaryDuration}</Text>
            <Text style={styles.summaryValue}>{formatDuration(totalDuration)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.export.summaryIntensity}</Text>
            <Text style={styles.summaryValue}>{intensity} / 10</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t.export.shareTo}</Text>
        <View style={styles.chipRow}>
          {PLATFORMS.map((p) => {
            const active = platform === p.id;
            return (
              <TouchableOpacity key={p.id} style={[styles.optionChip, active && styles.optionChipActive]} onPress={() => setPlatform(p.id)}>
                <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{t.export.resolution}</Text>
        <View style={styles.chipRow}>
          {(['720p', '1080p'] as Resolution[]).map((r) => {
            const active = resolution === r;
            const locked = r === '1080p' && !isPro;
            return (
              <TouchableOpacity key={r} style={[styles.optionChip, active && !locked && styles.optionChipActive, locked && styles.optionChipLocked]} onPress={() => trySetResolution(r)}>
                <Text style={[styles.optionChipText, active && !locked && styles.optionChipTextActive, locked && styles.optionChipTextLocked]}>{r}</Text>
                {locked && <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.watermarkRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.watermarkLabel}>{t.export.watermark}</Text>
            <Text style={styles.watermarkHint}>{isPro ? t.export.watermarkProHint : t.export.watermarkFreeHint}</Text>
          </View>
          <Switch value={isPro ? watermark : true} onValueChange={tryToggleWatermark} disabled={!isPro} trackColor={{ false: colors.surface, true: colors.primary }} thumbColor="#fff" />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleShare} accessibilityRole="button">
          <View style={{ marginRight: spacing.sm }}><ShareIcon color="#fff" size={18} /></View>
          <Text style={styles.primaryButtonText}>{t.export.shareToPlatform} {platformLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(tabs)/gallery')}>
          <Text style={styles.secondaryButtonText}>{t.export.goToGallery}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.ghostButtonText}>{t.export.backToHome}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  processingTitle: { color: colors.text, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 80 },
  processingSubtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  postcardWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  postcard: { height: 200, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  postcardEmoji: { fontSize: 80 },
  postcardLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginTop: spacing.sm },
  factCard: { marginHorizontal: spacing.lg, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.card, borderLeftWidth: 3, borderLeftColor: colors.primary },
  factLabel: { color: colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.xs },
  factText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  progressBlock: { marginHorizontal: spacing.lg, marginTop: spacing.xl },
  circularWrapper: { alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xl },
  compassCenter: { position: 'absolute' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  percent: { color: colors.text, fontSize: 18, fontWeight: '700' },
  eta: { color: colors.muted, fontSize: 13 },
  successContent: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  successDot: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  successTitle: { color: colors.text, fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  successSubtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  beforeAfterBlock: { marginBottom: spacing.xl },
  baToggle: { alignItems: 'center', paddingVertical: spacing.sm },
  baToggleText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  baContainer: { flexDirection: 'row', height: 220, borderRadius: radius.card, overflow: 'hidden', marginTop: spacing.sm, gap: 2 },
  baHalf: { flex: 1, position: 'relative' },
  baImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  baBadge: { position: 'absolute', bottom: 8, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  baBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  summaryCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.xl },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  summaryLabel: { color: colors.muted, fontSize: 14 },
  summaryValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  optionChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.button, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.surface },
  optionChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionChipLocked: { opacity: 0.55, borderColor: colors.muted },
  optionChipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  optionChipTextActive: { color: '#fff' },
  optionChipTextLocked: { color: colors.muted },
  proBadge: { marginLeft: spacing.sm, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, backgroundColor: colors.primary },
  proBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  watermarkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.card, marginBottom: spacing.xl },
  watermarkLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  watermarkHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  primaryButton: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: colors.surface, paddingVertical: spacing.lg, borderRadius: radius.button, alignItems: 'center', marginTop: spacing.md },
  secondaryButtonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  ghostButton: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  ghostButtonText: { color: colors.muted, fontSize: 14 },
});