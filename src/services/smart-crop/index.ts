export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * SOW Section 5: Given source dimensions and a subject rectangle,
 * compute the 9:16 crop that best centres the subject.
 */
export function toNineSixteen(
  sourceWidth: number,
  sourceHeight: number,
  subjectRect: CropRect
): CropRect {
  const targetRatio = 9 / 16;
  const sourceRatio = sourceWidth / sourceHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  let x = 0;
  let y = 0;

  if (sourceRatio > targetRatio) {
    // Source is wider than 9:16 (e.g., landscape). Crop the sides.
    cropWidth = sourceHeight * targetRatio;
    // Center the crop on the subject's x-coordinate
    const subjectCenterX = subjectRect.x + subjectRect.width / 2;
    x = subjectCenterX - cropWidth / 2;
    
    // Clamp bounds
    if (x < 0) x = 0;
    if (x + cropWidth > sourceWidth) x = sourceWidth - cropWidth;
  } else {
    // Source is taller than 9:16. Crop top/bottom.
    cropHeight = sourceWidth / targetRatio;
    const subjectCenterY = subjectRect.y + subjectRect.height / 2;
    y = subjectCenterY - cropHeight / 2;
    
    // Clamp bounds
    if (y < 0) y = 0;
    if (y + cropHeight > sourceHeight) y = sourceHeight - cropHeight;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

/**
 * Note: For this MVP, we are using center crop (1080x1920) in the FFmpeg command.
 * If you want to use `expo-face-detector` later, you would run it on the first frame,
 * get the subjectRect, pass it here, and inject the X/Y into the FFmpeg crop filter.
 */
export async function computeSubjectRect(videoUri: string): Promise<CropRect> {
  // Fallback: Center of the screen
  return { x: 0, y: 0, width: 0, height: 0 }; 
}