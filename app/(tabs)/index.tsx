import { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { categories, Template } from '../../constants/templates';
import { getUnlockedTemplates } from '../../src/services/templates';
import { useAppStore } from '../../src/store/useAppStore';
import { colors, spacing, radius, glows } from '../../constants/theme';
import { useTranslation } from '../../src/hooks/useTranslation';
import {
  WaveIcon, MountainIcon, CityscapeIcon, TempleIcon,
  LeafIcon, FoodIcon, RoadIcon, LanternIcon,
} from '../../src/components/icons';

const TRENDING_IDS = ['golden_hour', 'neon_nights', 'open_road', 'festival_vibes'];

// Image Mapping for Templates
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

const getCategoryIcon = (category: string, color: string) => {
  switch (category) {
    case 'Beach': return <WaveIcon color={color} size={14} />;
    case 'Mountain': return <MountainIcon color={color} size={14} />;
    case 'City': return <CityscapeIcon color={color} size={14} />;
    case 'Heritage': return <TempleIcon color={color} size={14} />;
    case 'Forest': return <LeafIcon color={color} size={14} />;
    case 'Food': return <FoodIcon color={color} size={14} />;
    case 'Road Trip': return <RoadIcon color={color} size={14} />;
    case 'Local Culture': return <LanternIcon color={color} size={14} />;
    default: return <Ionicons name="grid-outline" size={14} color={color} />;
  }
};

function TemplateCard({ template, onPress, size = 'grid' }: any) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(0.96, { damping: 20, stiffness: 200 });
  };
  
  const onPressOut = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
  };

  const imageUrl = TEMPLATE_IMAGES[template.id] || TEMPLATE_IMAGES['golden_hour'];

  return (
    <Animated.View style={[size === 'grid' ? styles.cardWrap : undefined, animatedStyle]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[size === 'grid' ? styles.card : styles.trendingCard, glows.surface]}
      >
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>{template.name}</Text>
          <Text style={styles.cardCategory}>{template.category}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const installedPacks = useAppStore((s) => s.installedPacks);
  const isPro = useAppStore((s) => s.isPro);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const visibleTemplates = useMemo(() => getUnlockedTemplates(installedPacks, isPro), [installedPacks, isPro]);
  const trending = useMemo(() => TRENDING_IDS.map((id) => visibleTemplates.find((tt) => tt.id === id)).filter(Boolean) as Template[], [visibleTemplates]);

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleTemplates.filter((tt) => {
      const matchesQuery = q === '' || tt.name.toLowerCase().includes(q) || tt.category.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || tt.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [visibleTemplates, query, selectedCategory]);

  const showTrending = query.trim() === '' && selectedCategory === 'All';

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      data={filteredTemplates}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      contentContainerStyle={{ paddingTop: 60, paddingBottom: 100, gap: spacing.md }}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}
      ListHeaderComponent={
        <View>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t.home.title}</Text>
              <Text style={styles.subtitle}>{t.home.subtitle}</Text>
            </View>
            <TouchableOpacity style={styles.storeBtn} onPress={() => router.push('/pack-store')}>
              <Ionicons name="storefront" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <BlurView intensity={20} tint="dark" style={styles.searchBlur}>
              <Ionicons name="search" size={18} color={colors.muted} style={{ marginRight: 8 }} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search templates…"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
                autoCorrect={false}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.muted} />
                </Pressable>
              )}
            </BlurView>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories} style={{ marginBottom: spacing.lg }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <Pressable key={cat} onPress={() => setSelectedCategory(cat)} style={[styles.chip, active && styles.chipActive]}>
                  <View style={{ marginRight: 6 }}>{getCategoryIcon(cat, active ? '#fff' : colors.text)}</View>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {showTrending && trending.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={styles.sectionLabel}>Trending now</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: 8 }}>
                {trending.map((item) => (
                  <TemplateCard key={item.id} template={item} onPress={() => router.push(`/template/${item.id}`)} size="trending" />
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.sectionLabel}>
            {showTrending ? `All templates (${visibleTemplates.length})` : `${filteredTemplates.length} results`}
          </Text>
        </View>
      }
      renderItem={({ item }) => <TemplateCard template={item} onPress={() => router.push(`/template/${item.id}`)} />}
    />
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 4 },
  storeBtn: { backgroundColor: colors.surface, padding: 12, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  searchContainer: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, borderRadius: radius.button, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchBlur: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, height: 50 },
  searchInput: { flex: 1, color: colors.text, fontSize: 16, height: '100%' },

  categories: { paddingHorizontal: spacing.lg, alignItems: 'center', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary, ...glows.primary },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  sectionLabel: { color: colors.text, fontSize: 20, fontWeight: '700', paddingHorizontal: spacing.lg, marginBottom: spacing.sm, marginTop: spacing.md },

  cardWrap: { flex: 1, marginBottom: spacing.md },
  card: { height: 160, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end', ...glows.surface },
  trendingCard: { width: 220, height: 140, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end', ...glows.surface },
  cardOverlay: { padding: spacing.md, backgroundColor: 'rgba(0,0,0,0.2)' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardCategory: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
});