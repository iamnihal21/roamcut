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

  const onPressIn = () => scale.value = withSpring(0.96, { damping: 20, stiffness: 200 });
  const onPressOut = () => scale.value = withSpring(1, { damping: 20, stiffness: 200 });

  return (
    <Animated.View style={[size === 'grid' ? styles.cardWrap : undefined, animatedStyle]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[size === 'grid' ? styles.card : styles.trendingCard, glows.surface]}
      >
        <LinearGradient
          colors={[template.color, '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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

          {/* Glassmorphism Search Bar */}
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
  cardOverlay: { padding: spacing.md, backgroundColor: 'rgba(0,0,0,0.3)' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardCategory: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
});