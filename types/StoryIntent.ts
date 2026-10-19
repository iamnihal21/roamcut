/**
 * Story Intent — the narrative structure of a template.
 * Section 6, Layer 2: defines what the reel MEANS.
 */
export interface StoryIntent {
  /** Ordered list of story slots. Each slot is a position in the narrative */
  slots: StorySlot[];
  /** Optional text overlay applied on top of the reel */
  textOverlay?: TextOverlay;
}

export interface StorySlot {
  /** What kind of shot fills this slot */
  type: SlotType;
  /** Ideal duration in seconds for this slot */
  duration: number;
  /** Optional hint for what subject this slot prefers (e.g., 'face', 'landscape') */
  subjectHint?: string;
}

export type SlotType =
  | 'wide'      // establishing shot, context
  | 'detail'    // close-up, texture
  | 'action'    // movement, energy
  | 'reflection' // slow, contemplative
  | 'transition'; // transitional beauty shot

export interface TextOverlay {
  position: 'top' | 'center' | 'bottom';
  font: string;
  color?: string;
}