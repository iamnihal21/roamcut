import * as FileSystem from 'expo-file-system/legacy';
import type { Template } from '../../../types/Template';
import {
  executeAsync,
  addProgressListener,
  addLogListener,
} from '../../../modules/ffmpeg';

export type FFmpegProgressCallback = (progress: number) => void;

type SpeedSegment = { start: number; end: number; speed: number };
type SlotConfig = {
  duration?: number;
  trimStart?: number;
  beatStartIndex?: number;
  beatEndIndex?: number;
  speed?: number;
  speedRamp?: SpeedSegment[];
  transition?: string;
  transitionDuration?: number;
  subjectX?: number;
  subjectY?: number;
  lutPath?: string;
  stabilize?: boolean;
  cinematicBars?: boolean;
};

type TextOverlay = {
  text: string;
  start: number;
  end: number;
  fontSize?: number;
  color?: string;
  fontFile?: string;
  x?: string;
  y?: string;
};

type RuntimeTemplate = {
  category?: string;
  storyIntent?: { slots?: SlotConfig[]; beatMarkers?: number[] };
  scenePack?: {
    sharpness?: number;
    vignette?: number;
    filmGrain?: number;
    cinematicBars?: boolean;
  };
  processing?: {
    width?: number;
    height?: number;
    fps?: number;
    lutPath?: string;
    textOverlays?: TextOverlay[];
    beatMarkers?: number[];
    musicPath?: string;
    transition?: { type?: string; duration?: number };
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
    filmGrain?: number;
    cinematicBars?: boolean;
    encoder?: string;
    videoBitrate?: string;
  };
};

type ClipPlan = {
  path: string;
  slot: SlotConfig;
  trimStart: number;
  inputDuration: number;
  speedSegments: SpeedSegment[];
  outputDuration: number;
};

type TransitionPlan = { type: string; duration: number };

export interface ProcessOptions {
  template: Template;
  clips: string[];
  intensity: number;
  mustUse: string[];
  mustAvoid: string[];
  onProgress?: FFmpegProgressCallback;
  subjectPositions?: Array<{ x: number; y: number }>;
  clipHasAudio?: boolean[];
  musicPath?: string;
}

const DEFAULT_DURATION = 3;
const DEFAULT_FPS = 30;
const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;

const ALLOWED_TRANSITIONS = new Set([
  'fade', 'dissolve', 'wipeleft', 'wiperight', 'wipeup', 'wipedown',
  'slideleft', 'slideright', 'slideup', 'slidedown', 'fadeblack',
  'fadewhite', 'fadegrays', 'circleopen', 'circleclose', 'horzopen',
  'horzclose', 'vertopen', 'vertclose', 'pixelize', 'radial', 'rectcrop',
]);

function runtimeTemplate(template: Template): RuntimeTemplate {
  return template as unknown as RuntimeTemplate;
}

function numberInRange(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function fmt(value: number): string {
  return String(Number(value.toFixed(4)));
}

function cleanMediaPath(value: string): string {
  let path = value.startsWith('file://') ? value.slice('file://'.length) : value;
  try { path = decodeURIComponent(path); } catch {}
  return path;
}

function serializeArguments(args: string[]): string {
  return args.map((arg) => {
    if (/^[A-Za-z0-9_./:+,@%=-]+$/.test(arg)) return arg;
    return `"${arg.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }).join(' ');
}

function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/:/g, '\\:').replace(/,/g, '\\,').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/;/g, '\\;');
}

function safeExpression(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return /^[a-zA-Z0-9_()+*/. \-]+$/.test(value) ? value : fallback;
}

function selectActiveClips(options: ProcessOptions): string[] {
  let result = options.clips.filter((clip) => !options.mustAvoid.includes(clip));
  if (result.length === 0) result = [...options.clips];
  result.sort((a, b) => {
    const aPriority = options.mustUse.includes(a) ? 1 : 0;
    const bPriority = options.mustUse.includes(b) ? 1 : 0;
    return bPriority - aPriority;
  });
  if (result.length === 0) throw new Error('No video clips were selected for export.');
  return result;
}

function resolveSlotDuration(template: RuntimeTemplate, slot: SlotConfig): number {
  const markers = template.processing?.beatMarkers ?? template.storyIntent?.beatMarkers ?? [];
  if (slot.beatStartIndex !== undefined && slot.beatEndIndex !== undefined && slot.beatStartIndex >= 0 && slot.beatEndIndex > slot.beatStartIndex && slot.beatEndIndex < markers.length) {
    const beatDuration = markers[slot.beatEndIndex] - markers[slot.beatStartIndex];
    if (Number.isFinite(beatDuration) && beatDuration > 0) {
      return numberInRange(beatDuration, DEFAULT_DURATION, 0.1, 120);
    }
  }
  return numberInRange(slot.duration, DEFAULT_DURATION, 0.1, 120);
}

function resolveSpeedSegments(slot: SlotConfig, duration: number): SpeedSegment[] {
  const inputCurve = Array.isArray(slot.speedRamp) ? slot.speedRamp : [];
  const baseSpeed = numberInRange(slot.speed, 1, 0.25, 4);
  if (inputCurve.length === 0) return [{ start: 0, end: duration, speed: baseSpeed }];

  const sorted = [...inputCurve].filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && Number.isFinite(s.speed) && s.end > s.start && s.speed > 0).sort((a, b) => a.start - b.start);
  const result: SpeedSegment[] = [];
  let cursor = 0;

  for (const segment of sorted) {
    const start = numberInRange(segment.start, 0, 0, duration);
    const end = numberInRange(segment.end, duration, 0, duration);
    if (end <= start || end <= cursor) continue;
    if (start > cursor) result.push({ start: cursor, end: start, speed: 1 });
    const actualStart = Math.max(start, cursor);
    if (end > actualStart) result.push({ start: actualStart, end, speed: numberInRange(segment.speed, 1, 0.25, 4) });
    cursor = end;
  }
  if (cursor < duration) result.push({ start: cursor, end: duration, speed: 1 });
  return result.length > 0 ? result : [{ start: 0, end: duration, speed: 1 }];
}

function getClipPlans(options: ProcessOptions): ClipPlan[] {
  const template = runtimeTemplate(options.template);
  const clips = selectActiveClips(options);

  return clips.map((path, index) => {
    const slot = template.storyIntent?.slots?.[index] ?? {};
    const inputDuration = resolveSlotDuration(template, slot);
    const speedSegments = resolveSpeedSegments(slot, inputDuration);
    const outputDuration = speedSegments.reduce((sum, s) => sum + (s.end - s.start) / s.speed, 0);
    return {
      path,
      slot,
      trimStart: numberInRange(slot.trimStart, 0, 0, 24 * 60 * 60),
      inputDuration,
      speedSegments,
      outputDuration,
    };
  });
}

function isStabilizationEnabled(template: RuntimeTemplate, slot: SlotConfig): boolean {
  return slot.stabilize ?? template.processing?.stabilization?.enabled ?? false;
}

function getTransitions(template: RuntimeTemplate, plans: ClipPlan[]): TransitionPlan[] {
  const globalType = template.processing?.transition?.type ?? 'fade';
  const globalDuration = template.processing?.transition?.duration ?? 0.5;
  const result: TransitionPlan[] = [];
  let accumulatedDuration = plans[0]?.outputDuration ?? 0;

  for (let i = 1; i < plans.length; i++) {
    const previous = plans[i - 1];
    const current = plans[i];
    const requestedType = current.slot.transition ?? previous.slot.transition ?? globalType;
    const type = ALLOWED_TRANSITIONS.has(requestedType) ? requestedType : 'fade';
    let requestedDuration = current.slot.transitionDuration ?? previous.slot.transitionDuration ?? globalDuration;
    if (requestedType === 'none') requestedDuration = 0;
    
    const maxDuration = Math.max(0, Math.min(accumulatedDuration, current.outputDuration) - 0.04);
    const duration = numberInRange(requestedDuration, 0.5, 0, maxDuration);
    
    result.push({ type, duration });
    accumulatedDuration += current.outputDuration - duration;
  }
  return result;
}

function calculateOutputDuration(plans: ClipPlan[], transitions: TransitionPlan[]): number {
  return plans.reduce((total, plan) => total + plan.outputDuration, 0) - transitions.reduce((total, t) => total + t.duration, 0);
}

function atempoFilters(speed: number): string {
  let remaining = numberInRange(speed, 1, 0.25, 4);
  const parts: string[] = [];
  while (remaining > 2) { parts.push('atempo=2'); remaining /= 2; }
  while (remaining < 0.5) { parts.push('atempo=0.5'); remaining /= 0.5; }
  if (Math.abs(remaining - 1) > 0.0001) parts.push(`atempo=${fmt(remaining)}`);
  return parts.join(',');
}

function appendVideoSpeedGraph(graph: string[], inputLabel: string, outputLabel: string, segments: SpeedSegment[], index: number): void {
  if (segments.length === 1) {
    graph.push(`${inputLabel}setpts=(PTS-STARTPTS)/${fmt(segments[0].speed)}[${outputLabel}]`);
    return;
  }
  const splitLabels = segments.map((_, i) => `speed_in_${index}_${i}`);
  graph.push(`${inputLabel}split=${segments.length}` + splitLabels.map((l) => `[${l}]`).join(''));
  const outputLabels: string[] = [];
  segments.forEach((segment, i) => {
    const label = `speed_part_${index}_${i}`;
    outputLabels.push(`[${label}]`);
    graph.push(`[${splitLabels[i]}]trim=start=${fmt(segment.start)}:end=${fmt(segment.end)},setpts=(PTS-STARTPTS)/${fmt(segment.speed)}[${label}]`);
  });
  graph.push(`${outputLabels.join('')}concat=n=${segments.length}:v=1:a=0[${outputLabel}]`);
}

function appendAudioSpeedGraph(graph: string[], inputLabel: string, outputLabel: string, segments: SpeedSegment[], inputDuration: number, index: number): void {
  if (segments.length === 1) {
    const tempo = atempoFilters(segments[0].speed);
    graph.push(`${inputLabel}atrim=duration=${fmt(inputDuration)},asetpts=PTS-STARTPTS` + (tempo ? `,${tempo}` : '') + `[${outputLabel}]`);
    return;
  }
  const splitLabels = segments.map((_, i) => `audio_speed_in_${index}_${i}`);
  graph.push(`${inputLabel}asplit=${segments.length}` + splitLabels.map((l) => `[${l}]`).join(''));
  const outputLabels: string[] = [];
  segments.forEach((segment, i) => {
    const label = `audio_speed_part_${index}_${i}`;
    const tempo = atempoFilters(segment.speed);
    outputLabels.push(`[${label}]`);
    graph.push(`[${splitLabels[i]}]atrim=start=${fmt(segment.start)}:end=${fmt(segment.end)},asetpts=PTS-STARTPTS` + (tempo ? `,${tempo}` : '') + `[${label}]`);
  });
  graph.push(`${outputLabels.join('')}concat=n=${segments.length}:v=0:a=1[${outputLabel}]`);
}

function buildArguments(options: ProcessOptions, outputPath: string, plans: ClipPlan[], clipHasAudio: boolean[], stabilizationFiles: Array<string | undefined>): string[] {
  const template = runtimeTemplate(options.template);
  const width = Math.round(numberInRange(template.processing?.width, DEFAULT_WIDTH, 144, 4320));
  const height = Math.round(numberInRange(template.processing?.height, DEFAULT_HEIGHT, 144, 7680));
  const fps = Math.round(numberInRange(template.processing?.fps, DEFAULT_FPS, 15, 60));

  const transitions = getTransitions(template, plans);
  const totalDuration = calculateOutputDuration(plans, transitions);

  const musicPathRaw = options.musicPath ?? template.processing?.musicPath;
  const musicPath = musicPathRaw ? cleanMediaPath(musicPathRaw) : undefined;

  const audioConfig = template.processing?.audioMix;
  const includeOriginalAudio = audioConfig?.includeOriginal ?? true;
  const defaultOriginalVolume = musicPath ? 0.35 : 1;
  const defaultMusicVolume = musicPath ? 0.65 : 0;
  const originalVolume = numberInRange(audioConfig?.originalVolume ?? audioConfig?.originalRatio, defaultOriginalVolume, 0, 2);
  const musicVolume = numberInRange(audioConfig?.musicVolume ?? (audioConfig?.originalRatio !== undefined ? 1 - audioConfig.originalRatio : defaultMusicVolume), defaultMusicVolume, 0, 2);

  const args: string[] = ['-y'];

  // FIXED: -t and -ss must come BEFORE -i to act as input trims
  plans.forEach((plan) => {
    if (plan.trimStart > 0) args.push('-ss', fmt(plan.trimStart));
    args.push('-t', fmt(plan.inputDuration), '-i', cleanMediaPath(plan.path));
  });

  const musicIndex = plans.length;
  if (musicPath) args.push('-stream_loop', '-1', '-i', musicPath);

  const graph: string[] = [];

  plans.forEach((plan, index) => {
    const rawLabel = `[raw_${index}]`;
    const speedLabel = `speed_${index}`;
    const stabilizedPath = stabilizationFiles[index];

    if (isStabilizationEnabled(template, plan.slot) && !stabilizedPath) {
      throw new Error(`Stabilization is enabled for clip ${index + 1}, but its vid.stab analysis file is missing.`);
    }

    if (stabilizedPath) {
      const stabilization = template.processing?.stabilization;
      const smoothing = numberInRange(stabilization?.smoothing, 10, 0, 100);
      graph.push(`[${index}:v]vidstabtransform=input='${escapeFilterValue(cleanMediaPath(stabilizedPath))}':smoothing=${fmt(smoothing)},setpts=PTS-STARTPTS${rawLabel}`);
    } else {
      graph.push(`[${index}:v]setpts=PTS-STARTPTS${rawLabel}`);
    }

    appendVideoSpeedGraph(graph, rawLabel, speedLabel, plan.speedSegments, index);

    const subject = options.subjectPositions?.[index] ?? { x: plan.slot.subjectX ?? 0.5, y: plan.slot.subjectY ?? 0.5 };
    const subjectX = numberInRange(subject.x, 0.5, 0, 1);
    const subjectY = numberInRange(subject.y, 0.5, 0, 1);

    let filters = `fps=${fps},scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}:x='clip(iw*${fmt(subjectX)}-ow/2,0,iw-ow)':y='clip(ih*${fmt(subjectY)}-oh/2,0,ih-oh)'`;
    filters += ',unsharp=5:5:1.0:5:5:0.5';

    const lutPathRaw = plan.slot.lutPath ?? template.processing?.lutPath;
    if (lutPathRaw) {
      filters += `,lut3d=file='${escapeFilterValue(cleanMediaPath(lutPathRaw))}'`;
    } else {
      // FIXED: 'eq' is not available in this build. Using 'hue' and 'colorbalance' instead.
      switch (template.category) {
        case 'Beach': filters += ',hue=s=1.3,colorbalance=rs=.2:gs=.1:bs=-.1'; break;
        case 'Mountain': filters += ',hue=s=0.8,colorbalance=rs=-.1:gs=0:bs=.2'; break;
        case 'City': filters += ',hue=s=1.1,colorbalance=rs=0:gs=0:bs=.1'; break;
        case 'Heritage': filters += ',hue=s=0.9,colorbalance=rs=.1:gs=.1:bs=0'; break;
      }
    }

    const vignetteIntensity = numberInRange(template.scenePack?.vignette, 0, 0, 10);
    if (vignetteIntensity > 0) {
      const angle = (Math.PI / 4) * (vignetteIntensity / 5);
      filters += `,vignette=angle=${fmt(angle)}`;
    }

    const grain = numberInRange(template.processing?.filmGrain ?? template.scenePack?.filmGrain, 0, 0, 100);
    if (grain > 0) filters += `,noise=alls=${fmt(grain)}:allf=t+u`;

    const cinematicBars = template.processing?.cinematicBars ?? plan.slot.cinematicBars ?? template.scenePack?.cinematicBars ?? false;
    if (cinematicBars) {
      const barHeight = Math.max(1, (height - width / 2.35) / 2);
      filters += `,drawbox=x=0:y=0:w=iw:h=${fmt(barHeight)}:color=black:t=fill,drawbox=x=0:y=${fmt(height - barHeight)}:w=iw:h=${fmt(barHeight)}:color=black:t=fill`;
    }

    filters += `,tpad=stop_mode=clone:stop_duration=${fmt(plan.outputDuration)},trim=duration=${fmt(plan.outputDuration)},setsar=1,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS`;
    graph.push(`[${speedLabel}]${filters}[v${index}]`);
  });

  let currentVideo = '[v0]';

  for (let i = 1; i < plans.length; i++) {
    const transition = transitions[i - 1];
    const nextLabel = `[v${i}]`;
    const outputLabel = `[video_join_${i}]`;

    if (transition.duration > 0) {
      const elapsedBeforeTransition = plans.slice(0, i).reduce((sum, plan) => sum + plan.outputDuration, 0) - transitions.slice(0, i - 1).reduce((sum, item) => sum + item.duration, 0);
      const offset = Math.max(0, elapsedBeforeTransition - transition.duration);
      graph.push(`${currentVideo}${nextLabel}xfade=transition=${transition.type}:duration=${fmt(transition.duration)}:offset=${fmt(offset)}${outputLabel}`);
    } else {
      graph.push(`${currentVideo}${nextLabel}concat=n=2:v=1:a=0${outputLabel}`);
    }
    currentVideo = outputLabel;
  }

  const overlays = template.processing?.textOverlays ?? [];
  let finalVideo = currentVideo;

  overlays.forEach((overlay, index) => {
    if (!overlay.text || !Number.isFinite(overlay.start) || !Number.isFinite(overlay.end) || overlay.end <= overlay.start) return;
    const size = numberInRange(overlay.fontSize, 48, 8, 240);
    const color = overlay.color && /^[#A-Za-z0-9@.]+$/.test(overlay.color) ? overlay.color : 'white';
    const x = safeExpression(overlay.x, '(w-text_w)/2');
    const y = safeExpression(overlay.y, 'h-text_h-80');
    const fontOption = overlay.fontFile ? `fontfile='${escapeFilterValue(cleanMediaPath(overlay.fontFile))}':` : '';
    const outputLabel = `[video_text_${index}]`;
    graph.push(`${finalVideo}drawtext=${fontOption}text='${escapeFilterValue(overlay.text)}':expansion=none:fontsize=${fmt(size)}:fontcolor=${color}:x=${x}:y=${y}:enable='between(t\\,${fmt(overlay.start)}\\,${fmt(overlay.end)})'${outputLabel}`);
    finalVideo = outputLabel;
  });

  const originalAudioLabels: string[] = [];

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    const outputLabel = `audio_clip_${i}`;

    if (includeOriginalAudio && clipHasAudio[i]) {
      const rawAudioLabel = `[audio_raw_${i}]`;
      const speedAudioLabel = `audio_speed_${i}`;
      graph.push(`[${i}:a]asetpts=PTS-STARTPTS${rawAudioLabel}`);
      appendAudioSpeedGraph(graph, rawAudioLabel, speedAudioLabel, plan.speedSegments, plan.inputDuration, i);
      graph.push(`[${speedAudioLabel}]volume=${fmt(originalVolume)},apad=pad_dur=${fmt(plan.outputDuration)},atrim=duration=${fmt(plan.outputDuration)},asetpts=PTS-STARTPTS[${outputLabel}]`);
    } else {
      graph.push(`anullsrc=r=48000:cl=stereo,atrim=duration=${fmt(plan.outputDuration)},asetpts=PTS-STARTPTS[${outputLabel}]`);
    }
    originalAudioLabels.push(`[${outputLabel}]`);
  }

  let currentAudio = originalAudioLabels[0];

  for (let i = 1; i < plans.length; i++) {
    const transition = transitions[i - 1];
    const outputLabel = `[audio_join_${i}]`;
    if (transition.duration > 0) {
      graph.push(`${currentAudio}${originalAudioLabels[i]}acrossfade=d=${fmt(transition.duration)}:c1=tri:c2=tri${outputLabel}`);
    } else {
      graph.push(`${currentAudio}${originalAudioLabels[i]}concat=n=2:v=0:a=1${outputLabel}`);
    }
    currentAudio = outputLabel;
  }

  let finalAudio = currentAudio;

  if (musicPath) {
    const musicLabel = '[template_music]';
    graph.push(`[${musicIndex}:a]asetpts=PTS-STARTPTS,volume=${fmt(musicVolume)},apad=pad_dur=${fmt(totalDuration)},atrim=duration=${fmt(totalDuration)}${musicLabel}`);
    if (includeOriginalAudio) {
      graph.push(`${currentAudio}${musicLabel}amix=inputs=2:duration=longest:dropout_transition=2:normalize=0,atrim=duration=${fmt(totalDuration)}[audio_final]`);
      finalAudio = '[audio_final]';
    } else {
      finalAudio = musicLabel;
    }
  }

  args.push('-filter_complex', graph.join(';'));
  args.push('-map', finalVideo);
  args.push('-map', finalAudio);

  const encoder = template.processing?.encoder ?? 'h264_mediacodec';
  args.push('-c:v', encoder);
  if (encoder === 'libx264') {
    args.push('-crf', '23', '-preset', 'ultrafast');
  } else {
    args.push('-b:v', template.processing?.videoBitrate ?? '5M');
  }

  args.push('-r', String(fps), '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', outputPath ? cleanMediaPath(outputPath) : '');

  return args;
}

export function buildCommand(options: ProcessOptions, outputPath: string): string[] {
  const template = runtimeTemplate(options.template);
  const plans = getClipPlans(options);
  if (plans.some((plan) => isStabilizationEnabled(template, plan.slot))) {
    throw new Error('E10 stabilization requires the two-pass processReel() workflow.');
  }
  const audioPresence = options.clipHasAudio ?? plans.map(() => true);
  return buildArguments(options, outputPath, plans, audioPresence, plans.map(() => undefined));
}

async function detectAudioStream(path: string): Promise<boolean> {
  const args = ['-v', 'error', '-i', cleanMediaPath(path), '-map', '0:a:0', '-t', '0.05', '-f', 'null', '-'];
  try {
    await executeAsync(serializeArguments(args), '');
    return true;
  } catch {
    return false;
  }
}

async function analyzeStabilization(plan: ClipPlan, index: number, cacheDir: string, template: RuntimeTemplate): Promise<string> {
  const settings = template.processing?.stabilization;
  const transformPath = `${cacheDir}roamcut_stabilization_${Date.now()}_${index}.trf`;
  const args = ['-y'];
  if (plan.trimStart > 0) args.push('-ss', fmt(plan.trimStart));
  args.push('-t', fmt(plan.inputDuration), '-i', cleanMediaPath(plan.path), '-vf', `vidstabdetect=shakiness=${Math.round(numberInRange(settings?.shakiness, 5, 1, 10))}:accuracy=${Math.round(numberInRange(settings?.accuracy, 9, 1, 15))}:result='${escapeFilterValue(cleanMediaPath(transformPath))}'`, '-an', '-f', 'null', '-');

  try {
    await executeAsync(serializeArguments(args), transformPath);
    const info = await FileSystem.getInfoAsync(transformPath);
    if (!info.exists) throw new Error('The stabilization transform file was not created.');
    return transformPath;
  } catch (error: any) {
    throw new Error('E10 stabilization failed during its analysis pass. Original error: ' + (error?.message ?? String(error)));
  }
}
export async function processReel(options: ProcessOptions): Promise<string> {
  let progressListener: any;
  let logListener: any;
  const temporaryFiles: string[] = [];

  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) throw new Error('FileSystem.cacheDirectory is undefined.');

    const template = runtimeTemplate(options.template);
    const plans = getClipPlans(options);
    const transitions = getTransitions(template, plans);
    const totalDuration = Math.max(0.1, calculateOutputDuration(plans, transitions));

    const filename = `roamcut_${Date.now()}.mp4`;
    const outputPath = `${cacheDir}${filename}`;

    logListener = addLogListener((message) => console.log(`FFMPEG: ${message}`));

    console.log('=== ROAMCUT EXPORT PLAN ===');
    console.log('Clip input durations:', plans.map((plan) => plan.inputDuration));
    console.log('Clip output durations:', plans.map((plan) => plan.outputDuration));
    console.log('Estimated final duration:', totalDuration);

    let clipHasAudio = options.clipHasAudio;
    if (!clipHasAudio) {
      const detected: boolean[] = [];
      for (const plan of plans) detected.push(await detectAudioStream(plan.path));
      clipHasAudio = detected;
    }

    const stabilizationFiles: Array<string | undefined> = [];
    for (let index = 0; index < plans.length; index++) {
      const plan = plans[index];
      if (isStabilizationEnabled(template, plan.slot)) {
        const transformPath = await analyzeStabilization(plan, index, cacheDir, template);
        stabilizationFiles[index] = transformPath;
        temporaryFiles.push(transformPath);
      } else {
        stabilizationFiles[index] = undefined;
      }
    }

    const args = buildArguments(options, outputPath, plans, clipHasAudio, stabilizationFiles);
    const command = serializeArguments(args);

    console.log('=== STARTING ROAMCUT FFMPEG EXPORT ===');
    console.log(command);

    if (options.onProgress) {
      progressListener = addProgressListener((timeMs) => {
        const fraction = Math.max(0, Math.min(0.99, timeMs / (totalDuration * 1000)));
        options.onProgress?.(fraction);
      });
    }

    const result = await executeAsync(command, outputPath);
    const info = await FileSystem.getInfoAsync(outputPath);

    if (!info.exists) throw new Error(`FFmpeg completed but the output file was not found: ${outputPath}`);

    options.onProgress?.(1);
    console.log('ROAMCUT EXPORT SUCCESS:', outputPath, 'bytes:', info.size);
    return result || outputPath;

  } catch (error: any) {
    console.error('ROAMCUT EXPORT FAILED:', error);
    throw error; // UI will handle the custom alert
  } finally {
    progressListener?.remove();
    logListener?.remove();
    for (const temporaryFile of temporaryFiles) {
      try { await FileSystem.deleteAsync(temporaryFile, { idempotent: true }); } catch {}
    }
  }
}