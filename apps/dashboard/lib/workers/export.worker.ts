/**
 * Export Web Worker
 * 
 * Handles heavy image processing operations off the main thread:
 * - Noise texture generation (Gaussian noise)
 * - Canvas blur operations
 * - Canvas opacity operations
 * - Image compositing
 * 
 * Uses OffscreenCanvas for canvas operations in the worker context.
 */

/* eslint-disable no-restricted-globals */

// Worker message types
export type ExportWorkerMessageType =
  | 'generateNoise'
  | 'applyBlur'
  | 'applyOpacity'
  | 'composite'
  | 'processImageData'
  | 'convertFormat';

export interface ExportWorkerRequest {
  id: string;
  type: ExportWorkerMessageType;
  payload: any;
}

export interface ExportWorkerResponse {
  id: string;
  type: ExportWorkerMessageType;
  success: boolean;
  result?: any;
  error?: string;
}

// Noise generation payload
export interface NoisePayload {
  width: number;
  height: number;
  intensity: number;
}

// Blur payload
export interface BlurPayload {
  imageData: ImageData;
  blurAmount: number;
  width: number;
  height: number;
}

// Opacity payload
export interface OpacityPayload {
  imageData: ImageData;
  opacity: number;
  width: number;
  height: number;
}

// Composite payload
export interface CompositePayload {
  baseImageData: ImageData;
  overlayImageData: ImageData;
  blendMode: 'normal' | 'overlay' | 'multiply' | 'screen';
  overlayOpacity: number;
  width: number;
  height: number;
}

// Format conversion payload
export interface ConvertFormatPayload {
  imageData: ImageData;
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0-1 for jpeg/webp
  width: number;
  height: number;
}

// Format conversion result
export interface ConvertFormatResult {
  blob: ArrayBuffer;
  mimeType: string;
  fileSize: number;
}

// Worker context type
const ctx: Worker = self as unknown as Worker;

/**
 * Generate Gaussian (normal) distributed random number using Box-Muller transform
 */
function gaussianRandom(mean: number = 0, stdDev: number = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/**
 * Generate noise texture ImageData
 */
function generateNoiseTexture(width: number, height: number, intensity: number): ImageData {
  const imageData = new ImageData(width, height);
  const data = imageData.data;
  
  const stdDev = intensity * 50;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = gaussianRandom(128, stdDev);
    const value = Math.max(0, Math.min(255, Math.round(noise)));
    
    data[i] = value;     // R
    data[i + 1] = value; // G
    data[i + 2] = value; // B
    data[i + 3] = 255;   // A
  }
  
  return imageData;
}

/**
 * Apply blur using OffscreenCanvas
 * Note: OffscreenCanvas filter support varies by browser
 */
function applyBlur(
  imageData: ImageData,
  blurAmount: number,
  width: number,
  height: number
): ImageData {
  if (blurAmount <= 0) {
    return imageData;
  }

  // Check if OffscreenCanvas is available
  if (typeof OffscreenCanvas === 'undefined') {
    // Fallback: return original data if OffscreenCanvas not available
    console.warn('OffscreenCanvas not available, returning original image data');
    return imageData;
  }

  const canvas = new OffscreenCanvas(width, height);
  const canvasCtx = canvas.getContext('2d');
  
  if (!canvasCtx) {
    return imageData;
  }

  // Put the image data
  canvasCtx.putImageData(imageData, 0, 0);
  
  // Create a temporary canvas to draw blurred result
  const blurredCanvas = new OffscreenCanvas(width, height);
  const blurredCtx = blurredCanvas.getContext('2d');
  
  if (!blurredCtx) {
    return imageData;
  }

  // Apply blur filter
  blurredCtx.filter = `blur(${blurAmount}px)`;
  blurredCtx.drawImage(canvas, 0, 0);
  blurredCtx.filter = 'none';

  // Get the blurred image data
  return blurredCtx.getImageData(0, 0, width, height);
}

/**
 * Apply opacity to image data
 */
function applyOpacity(
  imageData: ImageData,
  opacity: number,
  width: number,
  height: number
): ImageData {
  if (opacity >= 1) {
    return imageData;
  }

  const result = new ImageData(width, height);
  const srcData = imageData.data;
  const destData = result.data;

  if (opacity <= 0) {
    // Return transparent image
    return result;
  }

  // Apply opacity to alpha channel
  for (let i = 0; i < srcData.length; i += 4) {
    destData[i] = srcData[i];         // R
    destData[i + 1] = srcData[i + 1]; // G
    destData[i + 2] = srcData[i + 2]; // B
    destData[i + 3] = Math.round(srcData[i + 3] * opacity); // A
  }

  return result;
}

/**
 * Blend two pixels based on blend mode
 */
function blendPixel(
  baseR: number, baseG: number, baseB: number, baseA: number,
  overlayR: number, overlayG: number, overlayB: number, overlayA: number,
  blendMode: string,
  overlayOpacity: number
): [number, number, number, number] {
  // Apply overlay opacity
  overlayA = overlayA * overlayOpacity;
  
  if (overlayA === 0) {
    return [baseR, baseG, baseB, baseA];
  }

  let r: number, g: number, b: number;

  switch (blendMode) {
    case 'overlay':
      // Overlay blend mode
      r = baseR < 128 ? (2 * baseR * overlayR) / 255 : 255 - (2 * (255 - baseR) * (255 - overlayR)) / 255;
      g = baseG < 128 ? (2 * baseG * overlayG) / 255 : 255 - (2 * (255 - baseG) * (255 - overlayG)) / 255;
      b = baseB < 128 ? (2 * baseB * overlayB) / 255 : 255 - (2 * (255 - baseB) * (255 - overlayB)) / 255;
      break;
    case 'multiply':
      r = (baseR * overlayR) / 255;
      g = (baseG * overlayG) / 255;
      b = (baseB * overlayB) / 255;
      break;
    case 'screen':
      r = 255 - ((255 - baseR) * (255 - overlayR)) / 255;
      g = 255 - ((255 - baseG) * (255 - overlayG)) / 255;
      b = 255 - ((255 - baseB) * (255 - overlayB)) / 255;
      break;
    default: // 'normal'
      r = overlayR;
      g = overlayG;
      b = overlayB;
  }

  // Alpha compositing
  const alpha = overlayA / 255;
  const outR = Math.round(r * alpha + baseR * (1 - alpha));
  const outG = Math.round(g * alpha + baseG * (1 - alpha));
  const outB = Math.round(b * alpha + baseB * (1 - alpha));
  const outA = Math.round(baseA + overlayA * (1 - baseA / 255));

  return [
    Math.max(0, Math.min(255, outR)),
    Math.max(0, Math.min(255, outG)),
    Math.max(0, Math.min(255, outB)),
    Math.max(0, Math.min(255, outA))
  ];
}

/**
 * Composite two image data layers
 */
function compositeImageData(
  baseImageData: ImageData,
  overlayImageData: ImageData,
  blendMode: 'normal' | 'overlay' | 'multiply' | 'screen',
  overlayOpacity: number,
  width: number,
  height: number
): ImageData {
  const result = new ImageData(width, height);
  const baseData = baseImageData.data;
  const overlayData = overlayImageData.data;
  const resultData = result.data;

  // Handle tiled overlay (noise pattern)
  const overlayWidth = overlayImageData.width;
  const overlayHeight = overlayImageData.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      // Tile the overlay
      const overlayX = x % overlayWidth;
      const overlayY = y % overlayHeight;
      const overlayI = (overlayY * overlayWidth + overlayX) * 4;

      const [r, g, b, a] = blendPixel(
        baseData[i], baseData[i + 1], baseData[i + 2], baseData[i + 3],
        overlayData[overlayI], overlayData[overlayI + 1], overlayData[overlayI + 2], overlayData[overlayI + 3],
        blendMode,
        overlayOpacity
      );

      resultData[i] = r;
      resultData[i + 1] = g;
      resultData[i + 2] = b;
      resultData[i + 3] = a;
    }
  }

  return result;
}

/**
 * Convert ImageData to a specific format using OffscreenCanvas
 */
async function convertFormat(
  imageData: ImageData,
  format: 'png' | 'jpeg' | 'webp',
  quality: number,
  width: number,
  height: number
): Promise<ConvertFormatResult> {
  // Check if OffscreenCanvas is available
  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('OffscreenCanvas not available in this environment');
  }

  const canvas = new OffscreenCanvas(width, height);
  const canvasCtx = canvas.getContext('2d');

  if (!canvasCtx) {
    throw new Error('Failed to get 2D context from OffscreenCanvas');
  }

  // Put the image data onto the canvas
  canvasCtx.putImageData(imageData, 0, 0);

  // Determine MIME type
  const mimeType = format === 'png' ? 'image/png' :
                   format === 'webp' ? 'image/webp' : 'image/jpeg';

  // Convert to blob with quality setting
  const blob = await canvas.convertToBlob({
    type: mimeType,
    quality: format === 'png' ? undefined : quality,
  });

  // Convert blob to ArrayBuffer for transfer
  const arrayBuffer = await blob.arrayBuffer();

  return {
    blob: arrayBuffer,
    mimeType,
    fileSize: arrayBuffer.byteLength,
  };
}

/**
 * Handle incoming messages
 */
ctx.onmessage = async (event: MessageEvent<ExportWorkerRequest>) => {
  const { id, type, payload } = event.data;

  try {
    let result: ImageData | ConvertFormatResult | undefined;

    switch (type) {
      case 'generateNoise': {
        const { width, height, intensity } = payload as NoisePayload;
        result = generateNoiseTexture(width, height, intensity);
        break;
      }

      case 'applyBlur': {
        const { imageData, blurAmount, width, height } = payload as BlurPayload;
        result = applyBlur(imageData, blurAmount, width, height);
        break;
      }

      case 'applyOpacity': {
        const { imageData, opacity, width, height } = payload as OpacityPayload;
        result = applyOpacity(imageData, opacity, width, height);
        break;
      }

      case 'composite': {
        const { baseImageData, overlayImageData, blendMode, overlayOpacity, width, height } = payload as CompositePayload;
        result = compositeImageData(baseImageData, overlayImageData, blendMode, overlayOpacity, width, height);
        break;
      }

      case 'convertFormat': {
        const { imageData, format, quality, width, height } = payload as ConvertFormatPayload;
        // Reconstruct ImageData from transferred data
        let imgData: ImageData;
        if (imageData instanceof ImageData) {
          imgData = imageData;
        } else {
          const { data, width: w, height: h } = imageData as unknown as { data: Uint8ClampedArray; width: number; height: number };
          imgData = new ImageData(new Uint8ClampedArray(data), w, h);
        }
        result = await convertFormat(imgData, format, quality, width, height);
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    // Send result back to main thread
    const response: ExportWorkerResponse = {
      id,
      type,
      success: true,
      result
    };

    // Transfer buffers for performance
    if (result instanceof ImageData) {
      ctx.postMessage(response, { transfer: [result.data.buffer] });
    } else if (result && 'blob' in result) {
      // Transfer ArrayBuffer for convertFormat result
      ctx.postMessage(response, { transfer: [result.blob] });
    } else {
      ctx.postMessage(response);
    }
  } catch (error) {
    const response: ExportWorkerResponse = {
      id,
      type,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    ctx.postMessage(response);
  }
};

// Signal that worker is ready
ctx.postMessage({ type: 'ready' });

// Export empty object for TypeScript module
export {};
