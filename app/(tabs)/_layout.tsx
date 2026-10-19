import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useTranslation } from '../../src/hooks/useTranslation';
import { colors, glows } from '../../constants/theme';
import { CompassIcon, ReelIcon, GalleryIcon, ProfileIcon } from '../../src/components/icons';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -4 },
        animation: 'shift',
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: t.tabs.home, 
          tabBarIcon: ({ color }) => <CompassIcon color={color as string} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="create" 
        options={{ 
          title: t.tabs.create, 
          tabBarIcon: ({ color }) => <ReelIcon color={color as string} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="gallery" 
        options={{ 
          title: t.tabs.gallery, 
          tabBarIcon: ({ color }) => <GalleryIcon color={color as string} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: t.tabs.profile, 
          tabBarIcon: ({ color }) => <ProfileIcon color={color as string} size={24} /> 
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    borderRadius: 30,
    height: 70,
    borderTopWidth: 0,
    paddingBottom: 10,
    paddingTop: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...glows.surface,
  },
});