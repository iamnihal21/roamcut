import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { Template } from '../../../types/Template';
import { executeAsync, addProgressListener, addLogListener } from '../../../modules/ffmpeg';

export type FFmpegProgressCallback = (progress: number) => void;

export interface ProcessOptions {
  template: Template;
  clips: string[];
  intensity: number;
  mustUse: string[];
  mustAvoid: string[];
  onProgress?: FFmpegProgressCallback;
}

export function buildCommand(options: ProcessOptions, outputPath: string): string[] {
  const { template, clips, intensity, mustUse, mustAvoid } = options;
  const args: string[] = [];

  let activeClips = clips.filter(c => !mustAvoid.includes(c));
  if (activeClips.length === 0) activeClips = clips;

  activeClips.sort((a, b) => {
    const aUse = mustUse.includes(a) ? 1 : 0;
    const bUse = mustUse.includes(b) ? 1 : 0;
    return bUse - aUse;
  });

  activeClips.forEach((clip) => {
    const cleanPath = clip.replace('file://', '');
    args.push('-i', cleanPath);
  });

  let filterComplex = '';
  const intensityFactor = intensity / 10;
  const sharpness = (template.scenePack.sharpness * intensityFactor).toFixed(2);
  
  activeClips.forEach((_, i) => {
    // Removed 'eq' and 'vignette' as they might not be compiled in this build.
    // Using 'hue' for saturation and 'colorbalance' for tint instead.
    let filters = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,unsharp=5:5:${sharpness}`;
    
    if (template.category === 'Beach') filters += ',hue=s=1.3,colorbalance=rs=.2:gs=.1:bs=-.1';
    if (template.category === 'Mountain') filters += ',hue=s=0.8,colorbalance=rs=-.1:gs=0:bs=.2';
    if (template.category === 'City') filters += ',hue=s=1.1,colorbalance=rs=0:gs=0:bs=.1';
    if (template.category === 'Heritage') filters += ',hue=s=0.9,colorbalance=rs=.1:gs=.1:bs=0';

    filters += ',setsar=1';
    filterComplex += `[${i}:v]${filters}[v${i}];`;
  });

  // Handle single clip vs multiple clips
  if (activeClips.length === 1) {
    // Remove trailing semicolon and map the single output
    filterComplex = filterComplex.replace(/;$/, '');
    args.push('-filter_complex', filterComplex);
    args.push('-map', '[v0]');
  } else {
    const concatString = activeClips.map((_, i) => `[v${i}]`).join('');
    filterComplex += `${concatString}concat=n=${activeClips.length}:v=1:a=0[outv]`;
    args.push('-filter_complex', filterComplex);
    args.push('-map', '[outv]');
  }

  // Audio mapping: if there is audio in the first clip, map it. Otherwise ignore.
  // (This prevents FFmpeg from failing if there is no audio stream).
  
  args.push('-c:v', 'h264_mediacodec'); 
  args.push('-b:v', '5M'); 
  args.push('-r', '30'); 
  args.push('-pix_fmt', 'yuv420p');
  args.push('-y'); 
  args.push(outputPath.replace('file://', ''));

  return args;
}

export async function processReel(options: ProcessOptions): Promise<string> {
  console.log("🟡 processReel() STARTED");
  const { onProgress, clips } = options;
  
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) throw new Error("FileSystem.cacheDirectory is undefined.");
    
    const filename = `roamcut_${Date.now()}.mp4`;
    const outputPath = `${cacheDir}${filename}`;
    const totalDurationMs = clips.length * 5000; 
    
    const commandArray = buildCommand(options, outputPath);
    const commandString = commandArray.join(' ');
    
    console.log("🔵 === STARTING CUSTOM NATIVE FFMPEG ===");
    console.log("🔵 Command:", commandString);

    let progressListener: any;
    let logListener: any;

    if (onProgress) {
      progressListener = addProgressListener((timeMs) => {
        const progress = Math.min(0.99, timeMs / totalDurationMs);
        onProgress(progress);
      });
    }

    logListener = addLogListener((message) => {
      console.log(`FFMPEG: ${message}`);
    });

    const result = await executeAsync(commandString, outputPath);
    
    if (progressListener) progressListener.remove();
    if (logListener) logListener.remove();
    
    console.log("🟢🟢🟢 FFMPEG RETURNED SUCCESSFULLY 🟢🟢🟢", result);
    return result;

  } catch (error: any) {
    console.error("🔴🔴🔴 FFMPEG CATCH BLOCK 🔴🔴🔴", error);
    Alert.alert("Export Failed", error.message || String(error));
    throw error;
  }
}