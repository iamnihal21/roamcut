

import { useMemo, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppStore } from '../../src/store/useAppStore';
import { templates } from '../../constants/templates';
import { colors, spacing, radius, glows } from '../../constants/theme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { Reel } from '../../types/Reel';
import { TrashIcon, GridIcon, ListIcon, PlayIcon } from '../../src/components/icons';
import { VideoPlayerModal } from '../../src/components/ui/VideoPlayerModal';
import { useCustomAlert } from '../../src/components/ui/CustomAlert';

const TEMPLATE_IMAGES: Record<string, string> = {
  golden_hour: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  ocean_drift: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80',
  island_vibes: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
  summit_rush: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  cloud_walker: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80',
  neon_nights: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
  street_pulse: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
  metro_flow: 'https://images.unsplash.com/photo-1519582362782-99c9c6e2c4b9?w=800&q=80',
  ancient_stories: 'https://images.unsplash.com/photo-1548625361-ec853762f569?w=800&q=80',
  temple_trail: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
  jungle_book: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
  green_escape: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  taste_trail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  street_eats: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  open_road: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  highway_dreams: 'https://images.unsplash.com/photo-1473042904451-00171c69419d?w=800&q=80',
  festival_vibes: 'https://images.unsplash.com/photo-1533174000241-5c1b63c4c0e7?w=800&q=80',
  market_walk: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?w=800&q=80',
  village_life: 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=800&q=80',
};

type ViewMode = 'list' | 'grid';
type RowData = Reel[];

function buildSections(reels: Reel[], isGrid: boolean) {
  const groups: Record<string, Reel[]> = {};
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  reels.forEach((reel) => {
    const d = new Date(reel.createdAt);
    let key = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    if (d.toDateString() === today.toDateString()) key = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Yesterday';
    if (!groups[key]) groups[key] = [];
    groups[key].push(reel);
  });

  return Object.keys(groups).map((title) => {
    const items = groups[title];
    const rows: RowData[] = [];
    if (isGrid) {
      for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
    } else {
      items.forEach((item) => rows.push([item]));
    }
    return { title, data: rows };
  });
}

export default function Gallery() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showAlert } = useCustomAlert();
  const reels = useAppStore((s) => s.reels);
  const setReels = useAppStore.setState;
  const loadReelForEdit = useAppStore((s) => s.loadReelForEdit);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [playingUri, setPlayingUri] = useState<string | null>(null);

  const sections = useMemo(() => buildSections(reels, viewMode === 'grid'), [reels, viewMode]);
  const totalClips = reels.reduce((sum, r) => sum + r.videoUris.length, 0);
  const usageMB = Math.min(900, reels.length * 45 + 30);

  const deleteReel = (id: string) => {
    showAlert({
      title: t.gallery.deleteConfirmTitle,
      message: t.gallery.deleteConfirmMessage,
      buttons: [
        { text: t.gallery.cancel, style: 'cancel' },
        { text: t.gallery.delete, style: 'destructive', onPress: () => setReels((state) => ({ reels: state.reels.filter((r) => r.id !== id) })) },
      ]
    });
  };

  const reEditReel = (reel: Reel) => {
    loadReelForEdit(reel);
    router.push(`/editor/${reel.templateId}`);
  };

  const renderListItem = (item: Reel) => {
    const template = templates.find((t2) => t2.id === item.templateId);
    const imageUrl = TEMPLATE_IMAGES[item.templateId] || TEMPLATE_IMAGES['golden_hour'];

    return (
      <View key={item.id} style={styles.card}>
        <TouchableOpacity onPress={() => setPlayingUri(item.outputUri || item.videoUris[0])} style={{ position: 'relative' }}>
          <Image source={{ uri: imageUrl }} style={styles.thumb} />
          <View style={styles.playIconWrap}>
            <PlayIcon color="#fff" size={14} />
          </View>
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{template?.name ?? item.templateId}</Text>
          <Text style={styles.cardMeta}>{item.videoUris.length} clips · intensity {item.intensity}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => reEditReel(item)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteReel(item.id)}>
            <TrashIcon color={colors.error} size={18} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGridItem = (item: Reel) => {
    const template = templates.find((t2) => t2.id === item.templateId);
    const imageUrl = TEMPLATE_IMAGES[item.templateId] || TEMPLATE_IMAGES['golden_hour'];

    return (
      <View key={item.id} style={styles.gridCard}>
        <TouchableOpacity
          style={styles.gridThumbWrap}
          onPress={() => setPlayingUri(item.outputUri || item.videoUris[0])}
          activeOpacity={0.8}
        >
          <Image source={{ uri: imageUrl }} style={styles.gridThumb} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />
          <View style={styles.gridPlayIconWrap}>
            <PlayIcon color="#fff" size={24} />
          </View>
          <View style={styles.gridBadge}>
            <Text style={styles.gridBadgeText}>{item.videoUris.length} clips</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.gridTitle} numberOfLines={1}>{template?.name ?? item.templateId}</Text>
        <View style={styles.gridActions}>
          <TouchableOpacity onPress={() => reEditReel(item)}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteReel(item.id)}>
            <TrashIcon color={colors.error} size={16} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t.gallery.title}</Text>
          <Text style={styles.subtitle}>{reels.length} reels · {totalClips} clips · {usageMB} MB</Text>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.toggleWrap}>
          <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}>
            <ListIcon color={viewMode === 'list' ? '#fff' : colors.muted} size={16} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('grid')} style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}>
            <GridIcon color={viewMode === 'grid' ? '#fff' : colors.muted} size={16} />
          </TouchableOpacity>
        </BlurView>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(row) => row.map((r) => r.id).join('-')}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((reel) => viewMode === 'list' ? renderListItem(reel) : renderGridItem(reel))}
            {viewMode === 'grid' && row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t.gallery.empty}</Text>
            <Text style={styles.emptyText}>{t.gallery.emptyHint}</Text>
            <TouchableOpacity style={[styles.emptyButton, glows.primary]} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.emptyButtonText}>{t.gallery.browseTemplates}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <VideoPlayerModal
        visible={!!playingUri}
        videoUri={playingUri}
        onClose={() => setPlayingUri(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center' },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4, fontWeight: '500' },
  toggleWrap: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.button, padding: 4, gap: 4, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  toggleBtn: { padding: 8, borderRadius: radius.button - 4 },
  toggleBtnActive: { backgroundColor: colors.primary, ...glows.primary },
  listContent: { paddingBottom: 120 },
  sectionHeader: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md },

  card: { flex: 1, flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', ...glows.surface },
  thumb: { width: 60, height: 80, borderRadius: 8, backgroundColor: colors.accent },
  playIconWrap: { position: 'absolute', top: 33, left: 23, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, marginLeft: spacing.md },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cardMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  cardActions: { gap: spacing.sm },
  editButton: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.button, backgroundColor: 'rgba(225,112,85,0.15)', alignItems: 'center' },
  editButtonText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  deleteButton: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.button, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)', alignItems: 'center' },

  gridCard: { flex: 1 },
  gridThumbWrap: { height: 220, borderRadius: 16, overflow: 'hidden', marginBottom: spacing.sm, ...glows.surface },
  gridThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridPlayIconWrap: { position: 'absolute', top: '45%', left: '45%', width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  gridBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  gridBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  gridTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  gridActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, paddingHorizontal: 4 },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.sm },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  emptyButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 14, borderRadius: radius.button },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});