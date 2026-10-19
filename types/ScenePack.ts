/**
 * Scene Pack — the visual recipe for a template.
 * Section 6, Layer 1: defines what the reel LOOKS like.
 */
export interface ScenePack {
  /** Filename of the .cube LUT file, relative to assets/lut/ */
  lut: string;
  /** Ordered list of transition names, applied between clips */
  transitions: TransitionType[];
  /** Overlay image filenames, relative to assets/icons/overlays/ */
  overlays: string[];
  /** 0-1, how much sharpening the unsharp filter applies */
  sharpness: number;
  /** 0-1, darkening at the corners of the frame */
  vignette: number;
}

export type TransitionType =
  | 'dissolve'
  | 'fadeblack'
  | 'fadewhite'
  | 'slideleft'
  | 'slideright'
  | 'wipeleft'
  | 'circleopen'
  | 'glitch'
  | 'none';