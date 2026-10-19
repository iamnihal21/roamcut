import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

export default function Create() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Reel</Text>
      <Text style={styles.subtitle}>Pick a template first, then choose your videos.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)')}>
        <Text style={styles.buttonText}>Browse Templates</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: spacing.sm },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radius.button,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});