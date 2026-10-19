import { ScenePack } from './ScenePack';
import { StoryIntent } from './StoryIntent';
import { OutputPace } from './OutputPace';

/**
 * A complete template is the combination of three layers.
 * Section 6: this replaces the current flat mock data.
 */
export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  /** UI-only: colour shown on the template card */
  color: string;
  /** UI-only: max clips the template accepts */
  maxClips: number;
  /** UI-only: short user-facing description */
  description: string;
  /** Layer 1 */
  scenePack: ScenePack;
  /** Layer 2 */
  storyIntent: StoryIntent;
  /** Layer 3 */
  outputPace: OutputPace;
}

export type TemplateCategory =
  | 'Beach'
  | 'Mountain'
  | 'City'
  | 'Heritage'
  | 'Forest'
  | 'Food'
  | 'Road Trip'
  | 'Local Culture';