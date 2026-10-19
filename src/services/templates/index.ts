import { Template } from '../../../types/Template';

const MANIFESTS: Record<string, any> = {
  golden_hour: require('../../../templates/golden_hour.json'),
  ocean_drift: require('../../../templates/ocean_drift.json'),
  island_vibes: require('../../../templates/island_vibes.json'),
  summit_rush: require('../../../templates/summit_rush.json'),
  cloud_walker: require('../../../templates/cloud_walker.json'),
  neon_nights: require('../../../templates/neon_nights.json'),
  street_pulse: require('../../../templates/street_pulse.json'),
  metro_flow: require('../../../templates/metro_flow.json'),
  ancient_stories: require('../../../templates/ancient_stories.json'),
  temple_trail: require('../../../templates/temple_trail.json'),
  jungle_book: require('../../../templates/jungle_book.json'),
  green_escape: require('../../../templates/green_escape.json'),
  taste_trail: require('../../../templates/taste_trail.json'),
  street_eats: require('../../../templates/street_eats.json'),
  open_road: require('../../../templates/open_road.json'),
  highway_dreams: require('../../../templates/highway_dreams.json'),
  festival_vibes: require('../../../templates/festival_vibes.json'),
  market_walk: require('../../../templates/market_walk.json'),
  village_life: require('../../../templates/village_life.json'),
};

// Templates included in the free tier
export const FREE_TEMPLATES = [
  'golden_hour',
  'neon_nights',
  'taste_trail',
  'open_road',
  'festival_vibes',
];

// Which templates each pack unlocks
export const PACK_CONTENTS: Record<string, string[]> = {
  tropical_escape: ['ocean_drift', 'island_vibes', 'summit_rush', 'cloud_walker', 'ancient_stories'],
  city_pulse: ['street_pulse', 'metro_flow', 'temple_trail', 'jungle_book', 'green_escape'],
  wanderer: ['street_eats', 'highway_dreams', 'market_walk', 'village_life'],
};

export function loadTemplate(id: string): Template {
  const raw = MANIFESTS[id];
  if (!raw) throw new Error(`Template manifest not found: ${id}`);

  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    color: raw.color,
    description: raw.description,
    maxClips: raw.maxClips,
    scenePack: raw.scene_pack,
    storyIntent: raw.story_intent,
    outputPace: raw.output_pace,
  };
}

export function getAllTemplates(): Template[] {
  return Object.keys(MANIFESTS).map(loadTemplate);
}

/**
 * What the user is allowed to see based on their tier + installed packs.
 */
export function getUnlockedTemplates(
  installedPacks: string[],
  isPro: boolean
): Template[] {
  if (isPro) return getAllTemplates();

  const unlockedIds = new Set<string>(FREE_TEMPLATES);
  installedPacks.forEach((packId) => {
    (PACK_CONTENTS[packId] ?? []).forEach((id) => unlockedIds.add(id));
  });

  return Array.from(unlockedIds)
    .map((id) => MANIFESTS[id])
    .filter(Boolean)
    .map((raw) => loadTemplate(raw.id));
}

export function mapClipsToSlots(
  template: Template,
  clips: string[],
  mustUse: string[],
  mustAvoid: string[]
): Array<{ slotIndex: number; clipUri: string }> {
  const available = clips.filter((c) => !mustAvoid.includes(c));
  const prioritized = [
    ...available.filter((c) => mustUse.includes(c)),
    ...available.filter((c) => !mustUse.includes(c)),
  ];
  const { slots } = template.storyIntent;
  const mapped: Array<{ slotIndex: number; clipUri: string }> = [];
  for (let i = 0; i < slots.length; i++) {
    if (prioritized.length === 0) break;
    mapped.push({ slotIndex: i, clipUri: prioritized[i % prioritized.length] });
  }
  return mapped;
}