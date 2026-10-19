/**
 * A reel is a saved output record.
 * Extracted from the Zustand store into its own type file.
 */
export interface Reel {
  id: string;
  templateId: string;
  createdAt: number;
  videoUris: string[];
  intensity: number;
  mustUse: string[];
  mustAvoid: string[];
  /** Where the exported MP4 lives on disk (null until Section 5 fills it in) */
  outputUri?: string | null;
}