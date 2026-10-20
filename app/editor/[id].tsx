// import { useEffect, useMemo, useState } from 'react';
// import {
//   View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, Dimensions, AccessibilityInfo,
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker';
// import Slider from '@react-native-community/slider';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import * as Haptics from 'expo-haptics';
// import Animated, { FadeInDown } from 'react-native-reanimated';
// import { BlurView } from 'expo-blur';

// import { useAppStore } from '../../src/store/useAppStore';
// import { templates } from '../../constants/templates';
// import { colors, spacing, radius, glows } from '../../constants/theme';
// import { PlayIcon, AddIcon, ReelIcon } from '../../src/components/icons';
// import { useTranslation } from '../../src/hooks/useTranslation';
// import { GlowButton } from '../../src/components/ui/GlowButton';
// import { VideoPlayerModal } from '../../src/components/ui/VideoPlayerModal';

// const SCREEN_WIDTH = Dimensions.get('window').width;
// const PREVIEW_HEIGHT = Math.round((SCREEN_WIDTH - spacing.lg * 2) * 9 / 16);
// const THUMB_WIDTH = 64;
// const THUMB_HEIGHT = 90;

// function formatTime(sec: number) {
//   if (!sec || sec < 0) return '0:00';
//   const m = Math.floor(sec / 60);
//   const s = Math.floor(sec % 60);
//   return `${m}:${s.toString().padStart(2, '0')}`;
// }

// export default function Editor() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const { t, getTemplateName } = useTranslation();

//   const template = templates.find((t) => t.id === id);
//   const maxClips = template?.maxClips ?? 10;
//   const localizedName = template ? getTemplateName(template.id, template.name) : 'Template';

//   const {
//     selectedVideos, setSelectedVideos, clipDurations, setClipDurations, focusedClipIndex,
//     setFocusedClipIndex, removeVideo, intensity, setIntensity, mustUse, mustAvoid,
//     toggleMustUse, toggleMustAvoid, resetEditor, selectedTemplateId, setSelectedTemplate,
//   } = useAppStore();

//   const [picking, setPicking] = useState(false);
//   const [reduceMotion, setReduceMotion] = useState(false);
//   const [playerVisible, setPlayerVisible] = useState(false);

//   useEffect(() => {
//     AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
//     const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
//     return () => listener.remove();
//   }, []);

//   useEffect(() => {
//     if (selectedTemplateId !== id) {
//       resetEditor();
//       setSelectedTemplate(id as string);
//     }
//   }, [id]);

//   const atLimit = selectedVideos.length >= maxClips;
//   const canExport = selectedVideos.length > 0;

//   const focusedUri = selectedVideos[focusedClipIndex] ?? selectedVideos[0] ?? null;
//   const focusedDuration = focusedUri ? clipDurations[focusedUri] ?? 0 : 0;
//   const focusedDurationLabel = focusedDuration ? formatTime(focusedDuration) : '—';

//   const totalDuration = useMemo(
//     () => selectedVideos.reduce((sum, uri) => sum + (clipDurations[uri] ?? 0), 0),
//     [selectedVideos, clipDurations]
//   );

//   const positionAtFocus = useMemo(() => {
//     let pos = 0;
//     for (let i = 0; i < focusedClipIndex; i++) pos += clipDurations[selectedVideos[i]] ?? 0;
//     pos += focusedDuration / 2;
//     return pos;
//   }, [focusedClipIndex, selectedVideos, clipDurations, focusedDuration]);

//   const progress = totalDuration > 0 ? Math.min(1, positionAtFocus / totalDuration) : 0;

//   const pickVideos = async () => {
//     if (picking) return;
//     setPicking(true);
//     try {
//       const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!perm.granted) {
//         Alert.alert('Permission needed', 'RoamCut needs access to your videos.');
//         return;
//       }
//       const remaining = maxClips - selectedVideos.length;
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ['videos'], allowsMultipleSelection: true, selectionLimit: remaining, quality: 1,
//       });
//       if (!result.canceled && result.assets) {
//         const newUris = result.assets.map((a) => a.uri);
//         const newDurations: Record<string, number> = {};
//         result.assets.forEach((a) => {
//           const sec = a.duration ? Math.round(a.duration / 1000) : 15;
//           newDurations[a.uri] = sec;
//         });
//         const merged = Array.from(new Set([...selectedVideos, ...newUris]));
//         const trimmed = merged.slice(0, maxClips);
//         const mergedDurations: Record<string, number> = {};
//         trimmed.forEach((uri) => {
//           mergedDurations[uri] = newDurations[uri] ?? clipDurations[uri] ?? 15;
//         });
//         setSelectedVideos(trimmed);
//         setClipDurations(mergedDurations);
//       }
//     } catch {
//       Alert.alert('Something went wrong', 'Could not open your library.');
//     } finally {
//       setPicking(false);
//     }
//   };

//   const confirmRemove = (uri: string) => {
//     Alert.alert('Remove clip?', 'This clip will be removed from your reel.', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Remove', style: 'destructive', onPress: () => removeVideo(uri) },
//     ]);
//   };

//   const startOver = () => {
//     Alert.alert('Start over?', 'All clips and settings will be cleared.', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Start over', style: 'destructive', onPress: () => resetEditor() },
//     ]);
//   };

//   const groups = useMemo(() => {
//     const mustUseClips = selectedVideos.filter((u) => mustUse.includes(u));
//     const avoidClips = selectedVideos.filter((u) => mustAvoid.includes(u));
//     const neutralClips = selectedVideos.filter((u) => !mustUse.includes(u) && !mustAvoid.includes(u));
//     return [
//       { label: t.editor.mustUse, items: mustUseClips, color: colors.success },
//       { label: t.editor.neutral, items: neutralClips, color: colors.muted },
//       { label: t.editor.mustAvoid, items: avoidClips, color: colors.error },
//     ].filter((g) => g.items.length > 0);
//   }, [selectedVideos, mustUse, mustAvoid, t]);

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: insets.bottom + 120 }}
//       showsVerticalScrollIndicator={false}
//     >
//       <View style={styles.header}>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.templateName}>{localizedName}</Text>
//           <Text style={styles.templateMeta}>
//             {selectedVideos.length} / {maxClips} {t.editor.clips} · {mustUse.length} use · {mustAvoid.length} avoid
//           </Text>
//         </View>
//         {selectedVideos.length > 0 && (
//           <TouchableOpacity onPress={startOver} style={styles.startOver}>
//             <Text style={styles.startOverText}>{t.editor.startOver}</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={[styles.preview, { borderColor: template?.color ?? colors.primary, height: PREVIEW_HEIGHT }]}>
//         {focusedUri ? (
//           <>
//             <Image source={{ uri: focusedUri }} style={styles.previewImage} />
//             <View style={styles.previewShade} />
            
//             <TouchableOpacity style={styles.playButton} onPress={() => setPlayerVisible(true)} activeOpacity={0.8}>
//               <PlayIcon color="#fff" size={26} />
//             </TouchableOpacity>

//             <View style={styles.previewBadge}>
//               <Text style={styles.previewBadgeText}>{t.editor.preview}</Text>
//             </View>
//             <View style={styles.previewDuration}>
//               <Text style={styles.previewDurationText}>{focusedDurationLabel}</Text>
//             </View>
//             <View style={styles.watermark}>
//               <Text style={styles.watermarkText}>RoamCut</Text>
//             </View>
//           </>
//         ) : (
//           <View style={styles.previewEmpty}>
//             <ReelIcon color={colors.muted} size={40} />
//             <Text style={styles.previewEmptyText}>{t.editor.preview}</Text>
//           </View>
//         )}
//       </View>

//       {selectedVideos.length > 0 && (
//         <View style={styles.scrubberBlock}>
//           <View style={styles.scrubberBar}>
//             <View style={[styles.scrubberFill, { width: `${progress * 100}%` }]} />
//             <View style={[styles.playhead, { left: `${progress * 100}%` }]} />
//           </View>

//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
//             {selectedVideos.map((uri, i) => {
//               const active = i === focusedClipIndex;
//               return (
//                 <TouchableOpacity
//                   key={uri}
//                   onPress={() => setFocusedClipIndex(i)}
//                   style={[styles.thumbWrap, active && { borderColor: template?.color ?? colors.primary }]}
//                   activeOpacity={0.8}
//                 >
//                   <Image source={{ uri }} style={styles.thumb} />
//                   <View style={styles.thumbIndex}>
//                     <Text style={styles.thumbIndexText}>{i + 1}</Text>
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>

//           <Text style={styles.scrubberMeta}>
//             {t.editor.clip} {focusedClipIndex + 1} of {selectedVideos.length} · {formatTime(positionAtFocus)} / {formatTime(totalDuration)}
//           </Text>
//         </View>
//       )}

//       <TouchableOpacity
//         style={[styles.pickButton, atLimit && styles.pickButtonDisabled]}
//         onPress={pickVideos}
//         disabled={atLimit || picking}
//       >
//         <AddIcon color={atLimit ? colors.muted : colors.primary} size={20} />
//         <Text style={[styles.pickButtonText, atLimit && styles.pickButtonTextDisabled]}>
//           {atLimit ? t.editor.clipLimit : t.editor.addClips}
//         </Text>
//       </TouchableOpacity>

//       {selectedVideos.length === 0 ? (
//         <View style={styles.emptyState}>
//           <Text style={styles.emptyTitle}>{t.editor.emptyTitle}</Text>
//           <Text style={styles.emptyText}>{t.editor.emptyText}</Text>
//         </View>
//       ) : (
//         groups.map((group) => (
//           <View key={group.label} style={styles.groupBlock}>
//             <View style={styles.groupHeader}>
//               <View style={[styles.groupDot, { backgroundColor: group.color }]} />
//               <Text style={styles.groupLabel}>{group.label} · {group.items.length}</Text>
//             </View>

//             {group.items.map((uri) => {
//               const dur = clipDurations[uri] ?? 0;
//               const isUse = mustUse.includes(uri);
//               const isAvoid = mustAvoid.includes(uri);
//               const globalIndex = selectedVideos.indexOf(uri);
//               return (
//                 <Animated.View
//                   key={uri}
//                   entering={reduceMotion ? undefined : FadeInDown.delay(globalIndex * 50).springify()}
//                   style={styles.clipRow}
//                 >
//                   <TouchableOpacity onLongPress={() => confirmRemove(uri)} onPress={() => setFocusedClipIndex(globalIndex)} activeOpacity={0.85}>
//                     <Image source={{ uri }} style={styles.clipThumb} />
//                     <View style={styles.clipDurBadge}>
//                       <Text style={styles.clipDurText}>{dur ? formatTime(dur) : '—'}</Text>
//                     </View>
//                   </TouchableOpacity>

//                   <View style={styles.clipBody}>
//                     <Text style={styles.clipTitle}>{t.editor.clip} {globalIndex + 1}</Text>
//                     <Text style={styles.clipMeta}>{dur ? formatTime(dur) : 'Unknown length'}</Text>
//                   </View>

//                   <View style={styles.clipActions}>
//                     <TouchableOpacity
//                       onPress={() => toggleMustUse(uri)}
//                       style={[styles.pill, isUse && { backgroundColor: colors.success, borderColor: colors.success }]}
//                     >
//                       <Text style={[styles.pillText, isUse && styles.pillTextActive]}>Use</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => toggleMustAvoid(uri)}
//                       style={[styles.pill, isAvoid && { backgroundColor: colors.error, borderColor: colors.error }]}
//                     >
//                       <Text style={[styles.pillText, isAvoid && styles.pillTextActive]}>Avoid</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </Animated.View>
//               );
//             })}
//           </View>
//         ))
//       )}

//       <BlurView intensity={20} tint="dark" style={styles.intensityBlock}>
//         <View style={styles.intensityHeader}>
//           <Text style={styles.intensityLabel}>{t.editor.intensity}</Text>
//           <View style={styles.intensityBadge}>
//             <Text style={styles.intensityValue}>{intensity}</Text>
//           </View>
//         </View>
//         <Slider
//           style={styles.slider}
//           minimumValue={1}
//           maximumValue={10}
//           step={1}
//           value={intensity}
//           onValueChange={(v) => {
//             const val = Math.round(v);
//             if (val !== intensity) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//             setIntensity(val);
//           }}
//           minimumTrackTintColor={colors.primary}
//           maximumTrackTintColor="rgba(255,255,255,0.1)"
//           thumbTintColor={colors.primary}
//         />
//         <View style={styles.intensityTicks}>
//           <Text style={styles.tickText}>{t.editor.subtle}</Text>
//           <Text style={styles.tickText}>{t.editor.balanced}</Text>
//           <Text style={styles.tickText}>{t.editor.bold}</Text>
//         </View>
//       </BlurView>

//       <View style={styles.floatingBottom}>
//         {/* THIS IS THE ONLY WAY TO GO TO EXPORT */}
//         <GlowButton
//           title={canExport ? t.editor.exportReel : t.editor.pickVideo}
//           onPress={() => router.push(`/export/${id}`)}
//           disabled={!canExport}
//         />
//       </View>

//       <VideoPlayerModal 
//         visible={playerVisible} 
//         videoUri={focusedUri} 
//         onClose={() => setPlayerVisible(false)} 
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background },
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
//   templateName: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
//   templateMeta: { color: colors.muted, fontSize: 13, marginTop: 2, fontWeight: '500' },
//   startOver: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.button, backgroundColor: 'rgba(255,255,255,0.05)' },
//   startOverText: { color: colors.text, fontSize: 13, fontWeight: '600' },
//   preview: { marginHorizontal: spacing.lg, borderRadius: 20, borderWidth: 2, overflow: 'hidden', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...glows.surface },
//   previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
//   previewShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.25)' },
//   playButton: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
//   previewBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
//   previewBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
//   previewDuration: { position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
//   previewDurationText: { color: '#fff', fontSize: 12, fontWeight: '700' },
//   watermark: { position: 'absolute', bottom: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(225,112,85,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
//   watermarkText: { color: '#fff', fontSize: 10, fontWeight: '800' },
//   previewEmpty: { alignItems: 'center', gap: spacing.sm },
//   previewEmptyText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
//   scrubberBlock: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
//   scrubberBar: { height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: 'visible', position: 'relative' },
//   scrubberFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
//   playhead: { position: 'absolute', top: -4, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#fff', marginLeft: -7 },
//   strip: { gap: spacing.sm, paddingVertical: spacing.md },
//   thumbWrap: { width: THUMB_WIDTH, height: THUMB_HEIGHT, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
//   thumb: { width: '100%', height: '100%', resizeMode: 'cover', backgroundColor: colors.surface },
//   thumbIndex: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
//   thumbIndexText: { color: '#fff', fontSize: 10, fontWeight: '800' },
//   scrubberMeta: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 4, fontWeight: '500' },
//   pickButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: spacing.md, borderRadius: radius.button, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginHorizontal: spacing.lg, marginTop: spacing.lg },
//   pickButtonDisabled: { opacity: 0.5 },
//   pickButtonText: { color: colors.text, fontSize: 15, fontWeight: '700' },
//   pickButtonTextDisabled: { color: colors.muted },
//   emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.xl },
//   emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
//   emptyText: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
//   groupBlock: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
//   groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
//   groupDot: { width: 8, height: 8, borderRadius: 4 },
//   groupLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
//   clipRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: spacing.sm, marginBottom: 8, gap: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
//   clipThumb: { width: 48, height: 64, borderRadius: 8, backgroundColor: colors.background },
//   clipDurBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
//   clipDurText: { color: '#fff', fontSize: 9, fontWeight: '800' },
//   clipBody: { flex: 1 },
//   clipTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
//   clipMeta: { color: colors.muted, fontSize: 12, marginTop: 2, fontWeight: '500' },
//   clipActions: { flexDirection: 'row', gap: spacing.xs },
//   pill: { paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radius.button, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minWidth: 58, alignItems: 'center' },
//   pillText: { color: colors.text, fontSize: 11, fontWeight: '700' },
//   pillTextActive: { color: '#fff' },
//   intensityBlock: { marginHorizontal: spacing.lg, marginTop: spacing.xl, padding: spacing.lg, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
//   intensityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
//   intensityLabel: { color: colors.text, fontSize: 18, fontWeight: '700' },
//   intensityBadge: { backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...glows.primary },
//   intensityValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
//   slider: { width: '100%', height: 40 },
//   intensityTicks: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: spacing.xs },
//   tickText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
//   floatingBottom: { position: 'absolute', bottom: 30, left: spacing.lg, right: spacing.lg },
// });

import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Dimensions, AccessibilityInfo,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { useAppStore } from '../../src/store/useAppStore';
import { templates } from '../../constants/templates';
import { colors, spacing, radius, glows } from '../../constants/theme';
import { PlayIcon, AddIcon, ReelIcon } from '../../src/components/icons';
import { useTranslation } from '../../src/hooks/useTranslation';
import { GlowButton } from '../../src/components/ui/GlowButton';
import { VideoPlayerModal } from '../../src/components/ui/VideoPlayerModal';
import { useCustomAlert } from '../../src/components/ui/CustomAlert';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_HEIGHT = Math.round((SCREEN_WIDTH - spacing.lg * 2) * 9 / 16);
const THUMB_WIDTH = 64;
const THUMB_HEIGHT = 90;

function formatTime(sec: number) {
  if (!sec || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Editor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, getTemplateName } = useTranslation();
  const { showAlert } = useCustomAlert();

  const template = templates.find((t) => t.id === id);
  const maxClips = template?.maxClips ?? 10;
  const localizedName = template ? getTemplateName(template.id, template.name) : 'Template';

  const {
    selectedVideos, setSelectedVideos, clipDurations, setClipDurations, focusedClipIndex,
    setFocusedClipIndex, removeVideo, intensity, setIntensity, mustUse, mustAvoid,
    toggleMustUse, toggleMustAvoid, resetEditor, selectedTemplateId, setSelectedTemplate,
  } = useAppStore();

  const [picking, setPicking] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (selectedTemplateId !== id) {
      resetEditor();
      setSelectedTemplate(id as string);
    }
  }, [id]);

  const atLimit = selectedVideos.length >= maxClips;
  const canExport = selectedVideos.length > 0;

  const focusedUri = selectedVideos[focusedClipIndex] ?? selectedVideos[0] ?? null;
  const focusedDuration = focusedUri ? clipDurations[focusedUri] ?? 0 : 0;
  const focusedDurationLabel = focusedDuration ? formatTime(focusedDuration) : '—';

  const totalDuration = useMemo(
    () => selectedVideos.reduce((sum, uri) => sum + (clipDurations[uri] ?? 0), 0),
    [selectedVideos, clipDurations]
  );

  const positionAtFocus = useMemo(() => {
    let pos = 0;
    for (let i = 0; i < focusedClipIndex; i++) pos += clipDurations[selectedVideos[i]] ?? 0;
    pos += focusedDuration / 2;
    return pos;
  }, [focusedClipIndex, selectedVideos, clipDurations, focusedDuration]);

  const progress = totalDuration > 0 ? Math.min(1, positionAtFocus / totalDuration) : 0;

  const pickVideos = async () => {
    if (picking) return;
    setPicking(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert({ title: 'Permission needed', message: 'RoamCut needs access to your videos.' });
        return;
      }
      const remaining = maxClips - selectedVideos.length;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'], allowsMultipleSelection: true, selectionLimit: remaining, quality: 1,
      });
      if (!result.canceled && result.assets) {
        const newUris = result.assets.map((a) => a.uri);
        const newDurations: Record<string, number> = {};
        result.assets.forEach((a) => {
          const sec = a.duration ? Math.round(a.duration / 1000) : 15;
          newDurations[a.uri] = sec;
        });
        const merged = Array.from(new Set([...selectedVideos, ...newUris]));
        const trimmed = merged.slice(0, maxClips);
        const mergedDurations: Record<string, number> = {};
        trimmed.forEach((uri) => {
          mergedDurations[uri] = newDurations[uri] ?? clipDurations[uri] ?? 15;
        });
        setSelectedVideos(trimmed);
        setClipDurations(mergedDurations);
      }
    } catch {
      showAlert({ title: 'Error', message: 'Could not open your library.' });
    } finally {
      setPicking(false);
    }
  };

  const confirmRemove = (uri: string) => {
    showAlert({
      title: 'Remove clip?',
      message: 'This clip will be removed from your reel.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeVideo(uri) },
      ]
    });
  };

  const startOver = () => {
    showAlert({
      title: 'Start over?',
      message: 'All clips and settings will be cleared.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start over', style: 'destructive', onPress: () => resetEditor() },
      ]
    });
  };

  const groups = useMemo(() => {
    const mustUseClips = selectedVideos.filter((u) => mustUse.includes(u));
    const avoidClips = selectedVideos.filter((u) => mustAvoid.includes(u));
    const neutralClips = selectedVideos.filter((u) => !mustUse.includes(u) && !mustAvoid.includes(u));
    return [
      { label: t.editor.mustUse, items: mustUseClips, color: colors.success },
      { label: t.editor.neutral, items: neutralClips, color: colors.muted },
      { label: t.editor.mustAvoid, items: avoidClips, color: colors.error },
    ].filter((g) => g.items.length > 0);
  }, [selectedVideos, mustUse, mustAvoid, t]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: insets.bottom + 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.templateName}>{localizedName}</Text>
          <Text style={styles.templateMeta}>
            {selectedVideos.length} / {maxClips} {t.editor.clips} · {mustUse.length} use · {mustAvoid.length} avoid
          </Text>
        </View>
        {selectedVideos.length > 0 && (
          <TouchableOpacity onPress={startOver} style={styles.startOver}>
            <Text style={styles.startOverText}>{t.editor.startOver}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.preview, { borderColor: template?.color ?? colors.primary, height: PREVIEW_HEIGHT }]}>
        {focusedUri ? (
          <>
            <Image source={{ uri: focusedUri }} style={styles.previewImage} />
            <View style={styles.previewShade} />
            <TouchableOpacity style={styles.playButton} onPress={() => setPlayerVisible(true)} activeOpacity={0.8}>
              <PlayIcon color="#fff" size={26} />
            </TouchableOpacity>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>{t.editor.preview}</Text>
            </View>
            <View style={styles.previewDuration}>
              <Text style={styles.previewDurationText}>{focusedDurationLabel}</Text>
            </View>
            <View style={styles.watermark}>
              <Text style={styles.watermarkText}>RoamCut</Text>
            </View>
          </>
        ) : (
          <View style={styles.previewEmpty}>
            <ReelIcon color={colors.muted} size={40} />
            <Text style={styles.previewEmptyText}>{t.editor.preview}</Text>
          </View>
        )}
      </View>

      {selectedVideos.length > 0 && (
        <View style={styles.scrubberBlock}>
          <View style={styles.scrubberBar}>
            <View style={[styles.scrubberFill, { width: `${progress * 100}%` }]} />
            <View style={[styles.playhead, { left: `${progress * 100}%` }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
            {selectedVideos.map((uri, i) => {
              const active = i === focusedClipIndex;
              return (
                <TouchableOpacity
                  key={uri}
                  onPress={() => setFocusedClipIndex(i)}
                  style={[styles.thumbWrap, active && { borderColor: template?.color ?? colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri }} style={styles.thumb} />
                  <View style={styles.thumbIndex}>
                    <Text style={styles.thumbIndexText}>{i + 1}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.scrubberMeta}>
            {t.editor.clip} {focusedClipIndex + 1} of {selectedVideos.length} · {formatTime(positionAtFocus)} / {formatTime(totalDuration)}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.pickButton, atLimit && styles.pickButtonDisabled]}
        onPress={pickVideos}
        disabled={atLimit || picking}
      >
        <AddIcon color={atLimit ? colors.muted : colors.primary} size={20} />
        <Text style={[styles.pickButtonText, atLimit && styles.pickButtonTextDisabled]}>
          {atLimit ? t.editor.clipLimit : t.editor.addClips}
        </Text>
      </TouchableOpacity>

      {selectedVideos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t.editor.emptyTitle}</Text>
          <Text style={styles.emptyText}>{t.editor.emptyText}</Text>
        </View>
      ) : (
        groups.map((group) => (
          <View key={group.label} style={styles.groupBlock}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupDot, { backgroundColor: group.color }]} />
              <Text style={styles.groupLabel}>{group.label} · {group.items.length}</Text>
            </View>
            {group.items.map((uri) => {
              const dur = clipDurations[uri] ?? 0;
              const isUse = mustUse.includes(uri);
              const isAvoid = mustAvoid.includes(uri);
              const globalIndex = selectedVideos.indexOf(uri);
              return (
                <Animated.View
                  key={uri}
                  entering={reduceMotion ? undefined : FadeInDown.delay(globalIndex * 50).springify()}
                  style={styles.clipRow}
                >
                  <TouchableOpacity onLongPress={() => confirmRemove(uri)} onPress={() => setFocusedClipIndex(globalIndex)} activeOpacity={0.85}>
                    <Image source={{ uri }} style={styles.clipThumb} />
                    <View style={styles.clipDurBadge}>
                      <Text style={styles.clipDurText}>{dur ? formatTime(dur) : '—'}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.clipBody}>
                    <Text style={styles.clipTitle}>{t.editor.clip} {globalIndex + 1}</Text>
                    <Text style={styles.clipMeta}>{dur ? formatTime(dur) : 'Unknown length'}</Text>
                  </View>
                  <View style={styles.clipActions}>
                    <TouchableOpacity
                      onPress={() => toggleMustUse(uri)}
                      style={[styles.pill, isUse && { backgroundColor: colors.success, borderColor: colors.success }]}
                    >
                      <Text style={[styles.pillText, isUse && styles.pillTextActive]}>Use</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleMustAvoid(uri)}
                      style={[styles.pill, isAvoid && { backgroundColor: colors.error, borderColor: colors.error }]}
                    >
                      <Text style={[styles.pillText, isAvoid && styles.pillTextActive]}>Avoid</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        ))
      )}

      <BlurView intensity={20} tint="dark" style={styles.intensityBlock}>
        <View style={styles.intensityHeader}>
          <Text style={styles.intensityLabel}>{t.editor.intensity}</Text>
          <View style={styles.intensityBadge}>
            <Text style={styles.intensityValue}>{intensity}</Text>
          </View>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={intensity}
          onValueChange={(v) => {
            const val = Math.round(v);
            if (val !== intensity) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIntensity(val);
          }}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="rgba(255,255,255,0.1)"
          thumbTintColor={colors.primary}
        />
        <View style={styles.intensityTicks}>
          <Text style={styles.tickText}>{t.editor.subtle}</Text>
          <Text style={styles.tickText}>{t.editor.balanced}</Text>
          <Text style={styles.tickText}>{t.editor.bold}</Text>
        </View>
      </BlurView>

      <View style={styles.floatingBottom}>
        <GlowButton
          title={canExport ? t.editor.exportReel : t.editor.pickVideo}
          onPress={() => router.push(`/export/${id}`)}
          disabled={!canExport}
        />
      </View>

      <VideoPlayerModal 
        visible={playerVisible} 
        videoUri={focusedUri} 
        onClose={() => setPlayerVisible(false)} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  templateName: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  templateMeta: { color: colors.muted, fontSize: 13, marginTop: 2, fontWeight: '500' },
  startOver: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.button, backgroundColor: 'rgba(255,255,255,0.05)' },
  startOverText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  preview: { marginHorizontal: spacing.lg, borderRadius: 20, borderWidth: 2, overflow: 'hidden', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...glows.surface },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  previewShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.25)' },
  playButton: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  previewBadge: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  previewBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  previewDuration: { position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  previewDurationText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  watermark: { position: 'absolute', bottom: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(225,112,85,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  watermarkText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  previewEmpty: { alignItems: 'center', gap: spacing.sm },
  previewEmptyText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  scrubberBlock: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  scrubberBar: { height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: 'visible', position: 'relative' },
  scrubberFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  playhead: { position: 'absolute', top: -4, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#fff', marginLeft: -7 },
  strip: { gap: spacing.sm, paddingVertical: spacing.md },
  thumbWrap: { width: THUMB_WIDTH, height: THUMB_HEIGHT, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumb: { width: '100%', height: '100%', resizeMode: 'cover', backgroundColor: colors.surface },
  thumbIndex: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  thumbIndexText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  scrubberMeta: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 4, fontWeight: '500' },
  pickButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: spacing.md, borderRadius: radius.button, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginHorizontal: spacing.lg, marginTop: spacing.lg },
  pickButtonDisabled: { opacity: 0.5 },
  pickButtonText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  pickButtonTextDisabled: { color: colors.muted },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  groupBlock: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  clipRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: spacing.sm, marginBottom: 8, gap: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  clipThumb: { width: 48, height: 64, borderRadius: 8, backgroundColor: colors.background },
  clipDurBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  clipDurText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  clipBody: { flex: 1 },
  clipTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  clipMeta: { color: colors.muted, fontSize: 12, marginTop: 2, fontWeight: '500' },
  clipActions: { flexDirection: 'row', gap: spacing.xs },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radius.button, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minWidth: 58, alignItems: 'center' },
  pillText: { color: colors.text, fontSize: 11, fontWeight: '700' },
  pillTextActive: { color: '#fff' },
  intensityBlock: { marginHorizontal: spacing.lg, marginTop: spacing.xl, padding: spacing.lg, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  intensityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  intensityLabel: { color: colors.text, fontSize: 18, fontWeight: '700' },
  intensityBadge: { backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...glows.primary },
  intensityValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  slider: { width: '100%', height: 40 },
  intensityTicks: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: spacing.xs },
  tickText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  floatingBottom: { position: 'absolute', bottom: 30, left: spacing.lg, right: spacing.lg },
});