import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { useAppStore } from '../src/store/useAppStore';
import { scheduleWeeklyInspiration } from '../src/services/notifications';


const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const { t } = useTranslation();
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const slides = [
    {
      icon: 'compass-outline' as const,
      title: t.onboarding.slide1Title,
      text: t.onboarding.slide1Text,
    },
    {
      icon: 'grid-outline' as const,
      title: t.onboarding.slide2Title,
      text: t.onboarding.slide2Text,
    },
    {
      icon: 'flash-outline' as const,
      title: t.onboarding.slide3Title,
      text: t.onboarding.slide3Text,
    },
  ];
  const language = useAppStore((s) => s.language);

  const finish = () => {
    setOnboarded(true);
    scheduleWeeklyInspiration(language); // <-- Add this
    router.replace('/(tabs)');
  };

  const next = () => {
    if (index < slides.length - 1) {
      const nextIndex = index + 1;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setIndex(nextIndex);
    } else {
      finish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) setIndex(newIndex);
  };

  const isLast = index === slides.length - 1;



  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        {!isLast && (
          <TouchableOpacity style={styles.skipButton} onPress={finish}>
            <Text style={styles.skipText}>{t.onboarding.skip}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, isLast && { flex: 1 }]}
          onPress={next}
        >
          <Text style={styles.nextText}>
            {isLast ? t.onboarding.start : t.onboarding.next}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: 80,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  text: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: 60,
    gap: spacing.md,
  },
  skipButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  nextButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});