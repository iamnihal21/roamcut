import { ScenePack } from './ScenePack';
import { StoryIntent } from './StoryIntent';
import { OutputPace } from './OutputPace';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  color: string;
  maxClips: number;
  description: string;
  
  scenePack: ScenePack;
  storyIntent: StoryIntent;
  outputPace: OutputPace;

  // ADDED: For E04, E05, E07, E08, E10, E12, E13
  processing?: {
    width?: number;
    height?: number;
    fps?: number;
    lutPath?: string;
    musicPath?: string;
    filmGrain?: number;
    cinematicBars?: boolean;
    encoder?: string;
    videoBitrate?: string;
    beatMarkers?: number[];
    textOverlays?: Array<{
      text: string;
      start: number;
      end: number;
      fontSize?: number;
      color?: string;
      x?: string;
      y?: string;
    }>;
    transition?: {
      type?: string;
      duration?: number;
    };
    audioMix?: {
      includeOriginal?: boolean;
      originalRatio?: number;
      originalVolume?: number;
      musicVolume?: number;
    };
    stabilization?: {
      enabled?: boolean;
      shakiness?: number;
      accuracy?: number;
      smoothing?: number;
    };
  };
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