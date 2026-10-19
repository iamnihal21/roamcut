import { getAllTemplates } from '../src/services/templates';
import type { Template } from '../types/Template';

// Re-export so files that previously imported Template from here still work
export type { Template };

// All templates (regardless of access) — used by editor/detail to look up by id
export const templates: Template[] = getAllTemplates();

export const categories = [
  'All',
  'Beach',
  'Mountain',
  'City',
  'Heritage',
  'Forest',
  'Food',
  'Road Trip',
  'Local Culture',
];

export function getEffectsForCategory(category: string): string[] {
  const map: Record<string, string[]> = {
    Beach: ['Warm LUT', 'Lens flare overlay', 'Slow dissolves', 'Wave-synced pacing'],
    Mountain: ['Cool-tone LUT', 'Dramatic speed ramps', 'Epic transitions', 'Altitude overlay'],
    City: ['High-contrast LUT', 'Fast cuts', 'Glitch transitions', 'Light leak overlays'],
    Heritage: ['Desaturated warm LUT', 'Slow pans', 'Film grain', 'Vintage vignette'],
    Forest: ['Green-boost LUT', 'Organic transitions', 'Ambient audio mix', 'Macro-style crop'],
    Food: ['Saturated warm LUT', 'Close-crop focus', 'Steam / sizzle cues'],
    'Road Trip': ['Cinematic LUT', 'Letterbox bars', 'Speed ramp montage', 'Distance counter overlay'],
    'Local Culture': ['Vibrant LUT', 'Rhythmic beat cuts', 'Text in local script'],
  };
  return map[category] ?? [];
}

export const trendingTemplateIds = ['golden_hour', 'neon_nights', 'open_road', 'festival_vibes'];