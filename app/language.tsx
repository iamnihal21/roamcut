import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { LANGUAGES } from '../constants/languages';
import { colors, spacing, radius } from '../constants/theme';

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage } = useAppStore();

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    if (code === 'ar') {
      if (Platform.OS === 'web') {
        window.alert('RTL Layout enabled. The page will now refresh to apply the changes.');
        window.location.reload();
      } else {
        Alert.alert(
          'RTL Layout Enabled',
          'You must restart the app for the right-to-left layout to take effect.',
          [{ text: 'OK' }]
        );
      }
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => {
          const active = language === item.code;
          return (
            <TouchableOpacity
              style={[styles.row, active && styles.rowActive]}
              onPress={() => handleLanguageChange(item.code)}
            >
              <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                {item.label}
              </Text>
              {active && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    marginBottom: spacing.sm,
  },
  rowActive: { borderWidth: 1, borderColor: colors.primary },
  rowLabel: { color: colors.text, fontSize: 16 },
  rowLabelActive: { color: colors.primary, fontWeight: '600' },
  check: { color: colors.primary, fontSize: 18, fontWeight: '700' },
});