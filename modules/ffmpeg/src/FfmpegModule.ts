import { NativeModule, requireNativeModule } from 'expo';

declare class FfmpegModule extends NativeModule<{}> {}

export default requireNativeModule<FfmpegModule>('Ffmpeg');
