import { registerWebModule, NativeModule } from 'expo';

class FfmpegModule extends NativeModule<{}> {}

export default registerWebModule(FfmpegModule, 'FfmpegModule');
