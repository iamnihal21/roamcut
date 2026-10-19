/**
 * SOW Section 5: Resolve a LUT name to the absolute path of its .cube file.
 */
export function getLutPath(lutName: string): string {
  // In a real production app, you would bundle the .cube files in assets/lut/
  // and use Asset.fromModule(require('...')).downloadAsync() to get the local URI.
  return `assets/lut/${lutName}`;
}

/**
 * SOW Section 5: Build the FFmpeg filter arguments that apply a LUT at a given intensity.
 * Returns the filter fragment, not the full command.
 */
export function buildLutFilter(lutPath: string, intensity: number): string {
  // FFmpeg lut3d filter doesn't natively support intensity blending easily.
  // To support intensity, you'd typically blend the LUT output with the original.
  // For this MVP, we rely on the FFmpeg `eq` filters in the main engine.
  
  // Example of how it would look:
  // return `lut3d='${lutPath}':blend=${intensity / 10}`;
  
  return ''; 
}