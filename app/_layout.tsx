import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Constants from 'expo-constants';

import { useAppStore } from '../src/store/useAppStore';
import { colors } from '../constants/theme';

// Safely load Notifications only if NOT in Expo Go, to prevent the ExpoTopicSubscriptionModule crash
let Notifications: any = null;
if (Constants.appOwnership !== 'expo') {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (hydrated) return;
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !fontsLoaded) return;
    const inOnboarding = segments[0] === 'onboarding';

    if (!hasOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasOnboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasOnboarded, hydrated, fontsLoaded, segments]);

  if (!hydrated || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        animationDuration: 600,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="template/[id]" options={{ title: 'Template' }} />
      <Stack.Screen name="editor/[id]" options={{ title: 'Editor' }} />
      <Stack.Screen name="export/[id]" options={{ title: 'Export' }} />
      <Stack.Screen name="pack-store" options={{ title: 'Template Packs' }} />
      <Stack.Screen name="tips" options={{ title: 'Tips & Tricks' }} />
      <Stack.Screen name="language" options={{ title: 'Language' }} />
      <Stack.Screen 
        name="paywall" 
        options={{ 
          presentation: 'modal', 
          title: 'RoamCut Pro',
          animation: 'slide_from_bottom' 
        }} 
      />
    </Stack>
  );
}