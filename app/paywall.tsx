import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, glows } from '../constants/theme';
import { useAppStore } from '../src/store/useAppStore';
import { GlowButton } from '../src/components/ui/GlowButton';

const FEATURES = [
  { label: 'Templates', free: '5', pro: 'All 20' },
  { label: 'Watermark', free: 'Yes', pro: 'None' },
  { label: 'Export quality', free: '720p', pro: '1080p' },
  { label: 'Reels per month', free: '3', pro: 'Unlimited' },
  { label: 'Priority processing', free: '—', pro: 'Yes' },
  { label: 'Template packs', free: '—', pro: 'All included' },
  { label: 'Ads', free: 'None', pro: 'None' },
];

const REGIONS = [
  { id: 'US', label: 'US' },
  { id: 'IN', label: 'India' },
] as const;

const PRICING = {
  US: [
    { id: 'monthly', title: 'Monthly', price: '$4.99', sub: 'per month' },
    { id: 'annual', title: 'Annual', price: '$39.99', sub: 'save 33% · best value', highlight: true },
  ],
  IN: [
    { id: 'monthly', title: 'Monthly', price: '₹149', sub: 'per month' },
    { id: 'annual', title: 'Annual', price: '₹1,199', sub: 'save 33% · best value', highlight: true },
  ],
};

export default function Paywall() {
  const router = useRouter();
  const setPro = useAppStore((s) => s.setPro);
  const [region, setRegion] = useState<'US' | 'IN'>('US');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const activate = () => {
    Alert.alert(
      'Confirm Subscription',
      'This is a sandbox environment. No real money will be charged.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            setIsPurchasing(true);
            setTimeout(() => {
              setIsPurchasing(false);
              setPro(true);
              Alert.alert('Success!', 'Welcome to RoamCut Pro. All features unlocked.');
              router.back();
            }, 1500);
          },
        },
      ]
    );
  };

  const choose = (plan: string) => {
    if (plan === 'free trial' || plan === 'Monthly' || plan === 'Annual') {
      activate();
    } else {
      Alert.alert('Prototype build', `In the real app this would start the ${plan} subscription via StoreKit / Play Billing.`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.headline}>RoamCut <Text style={{ color: colors.primary }}>Pro</Text></Text>
      <Text style={styles.tagline}>Every template. No watermark. Full quality.</Text>

      <BlurView intensity={20} tint="dark" style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeadCell, { flex: 1.4, textAlign: 'left' }]}>Feature</Text>
          <Text style={styles.tableHeadCell}>Free</Text>
          <Text style={[styles.tableHeadCell, { color: colors.primary }]}>Pro</Text>
        </View>
        {FEATURES.map((f, i) => (
          <View key={f.label} style={[styles.tableRow, i === FEATURES.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={[styles.tableCell, { flex: 1.4, textAlign: 'left', fontWeight: '500' }]}>{f.label}</Text>
            <Text style={styles.tableCellMuted}>{f.free}</Text>
            <Text style={[styles.tableCell, { color: colors.primary, fontWeight: '700' }]}>{f.pro}</Text>
          </View>
        ))}
      </BlurView>

      <View style={styles.regionWrap}>
        <Text style={styles.sectionTitle}>Region</Text>
        <View style={styles.regionRow}>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.regionChip, region === r.id && styles.regionChipActive]}
              onPress={() => setRegion(r.id)}
              disabled={isPurchasing}
            >
              <Text style={[styles.regionChipText, region === r.id && styles.regionChipTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Choose a plan</Text>
      {PRICING[region].map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[styles.priceCard, plan.highlight && styles.priceCardHighlight, isPurchasing && { opacity: 0.5 }]}
          onPress={() => choose(plan.title)}
          disabled={isPurchasing}
        >
          {plan.highlight && (
            <LinearGradient colors={['rgba(225,112,85,0.15)', 'rgba(225,112,85,0.02)']} style={StyleSheet.absoluteFill} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.priceTitle}>{plan.title}</Text>
            <Text style={styles.priceSub}>{plan.sub}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.priceAmount}>{plan.price}</Text>
            {plan.highlight && (
              <View style={styles.priceBadgeWrap}>
                <Text style={styles.priceBadge}>BEST VALUE</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ marginTop: spacing.xl }}>
        <GlowButton
          title={isPurchasing ? 'Processing...' : 'Start 7-day free trial'}
          onPress={() => choose('free trial')}
          loading={isPurchasing}
        />
      </View>

      <TouchableOpacity style={styles.restoreButton} onPress={() => Alert.alert('Restore', 'No purchases found for this account.')} disabled={isPurchasing}>
        <Text style={styles.restoreButtonText}>Restore purchases</Text>
      </TouchableOpacity>

      <Text style={styles.socialProof}>Joined by 12,000+ travelers this month</Text>

      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} disabled={isPurchasing}>
        <Text style={styles.closeButtonText}>Not now</Text>
      </TouchableOpacity>

      <Text style={styles.legal}>Prototype build. No real payments processed. Cancel anytime.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  headline: { color: colors.text, fontSize: 36, fontWeight: '800', textAlign: 'center', letterSpacing: -1 },
  tagline: { color: colors.muted, fontSize: 16, textAlign: 'center', marginTop: 8, marginBottom: spacing.xxl, fontWeight: '500' },
  
  table: { borderRadius: 24, padding: spacing.lg, marginBottom: spacing.xxl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tableHeader: { flexDirection: 'row', paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.sm },
  tableHeadCell: { flex: 1, color: colors.muted, fontSize: 12, fontWeight: '800', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  tableCell: { flex: 1, color: colors.text, fontSize: 15, textAlign: 'center' },
  tableCellMuted: { flex: 1, color: colors.muted, fontSize: 15, textAlign: 'center' },
  
  regionWrap: { marginBottom: spacing.xl },
  regionRow: { flexDirection: 'row', gap: spacing.sm },
  regionChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.button, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surface },
  regionChipActive: { borderColor: colors.primary, backgroundColor: 'rgba(225,112,85,0.1)' },
  regionChipText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  regionChipTextActive: { color: colors.primary },
  
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.lg, marginTop: spacing.md },
  priceCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, marginBottom: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  priceCardHighlight: { borderColor: colors.primary, ...glows.primary },
  priceTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  priceSub: { color: colors.muted, fontSize: 13, marginTop: 4 },
  priceAmount: { color: colors.text, fontSize: 24, fontWeight: '800' },
  priceBadgeWrap: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  priceBadge: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  
  restoreButton: { paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.md },
  restoreButtonText: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  socialProof: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: spacing.lg },
  closeButton: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  closeButtonText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  legal: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: spacing.md },
});