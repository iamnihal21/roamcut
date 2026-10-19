/**
 * Output Pace — the rhythm and timing of a template.
 * Section 6, Layer 3: defines how the reel MOVES.
 */
export interface OutputPace {
  /** Beats per minute of the audio track this template expects */
  bpm: number;
  /** Beat positions in seconds, e.g. [0.5, 1.0, 1.5, ...] */
  beatMarkers: number[];
  /** Total reel duration in seconds */
  targetDuration: number;
  /** How cuts align to beats */
  cutStyle: CutStyle;
}

export type CutStyle =
  | 'on_beat'
  | 'between_beats'
  | 'freeform';