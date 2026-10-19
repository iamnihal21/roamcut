import { requireNativeModule, EventEmitter } from 'expo-modules-core';

const FfmpegModule = requireNativeModule('FfmpegModule');
const emitter = new EventEmitter(FfmpegModule) as any;

export function executeAsync(command: string, outputPath: string): Promise<string> {
  return FfmpegModule.executeAsync(command, outputPath);
}

export function addProgressListener(callback: (time: number) => void) {
  return emitter.addListener('onProgress', (event: { time: number }) => {
    callback(event.time);
  });
}

export function addLogListener(callback: (message: string) => void) {
  return emitter.addListener('onLog', (event: { message: string }) => {
    callback(event.message);
  });
}