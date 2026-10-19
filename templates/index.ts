import { Template } from '../types/Template';

// Map of all available template manifests
const MANIFESTS: Record<string, any> = {
  golden_hour: require('../../../templates/golden_hour.json'),
};

export function loadTemplate(id: string): Template {
  const raw = MANIFESTS[id];
  if (!raw) {
    throw new Error(`Template manifest not found: ${id}`);
  }

  // Convert snake_case JSON to camelCase TypeScript interfaces
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

export function mapClipsToSlots(
  template: Template,
  clips: string[],
  mustUse: string[],
  mustAvoid: string[]
): Array<{ slotIndex: number; clipUri: string }> {
  // Filter out avoided clips
  const available = clips.filter((c) => !mustAvoid.includes(c));
  
  // Put must-use clips first, then the rest
  const prioritized = [
    ...available.filter((c) => mustUse.includes(c)),
    ...available.filter((c) => !mustUse.includes(c)),
  ];

  const { slots } = template.storyIntent;
  const mapped: Array<{ slotIndex: number; clipUri: string }> = [];

  // Map clips to slots sequentially. If we have fewer clips than slots,
  // we cycle through the available clips.
  for (let i = 0; i < slots.length; i++) {
    if (prioritized.length === 0) break;
    const clip = prioritized[i % prioritized.length];
    mapped.push({ slotIndex: i, clipUri: clip });
  }

  return mapped;
}