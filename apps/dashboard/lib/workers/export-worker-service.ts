/**
 * Export Worker Service
 *
 * Provides a clean API for main thread to communicate with the export web worker.
 * Handles worker lifecycle, message passing, and provides Promise-based APIs.
 */

import type {
  BlurPayload,
  CompositePayload,
  ConvertFormatPayload,
  ConvertFormatResult,
  ExportWorkerMessageType,
  ExportWorkerRequest,
  ExportWorkerResponse,
  NoisePayload,
  OpacityPayload,
} from "./export.worker";

// Re-export types for consumers
export type {
  BlurPayload,
  CompositePayload,
  ConvertFormatPayload,
  ConvertFormatResult,
  NoisePayload,
  OpacityPayload,
};

type PendingRequest = {
  resolve: (result: any) => void;
  reject: (error: Error) => void;
};

class ExportWorkerService {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private isReady = false;
  private readyPromise: Promise<void> | null = null;
  private messageId = 0;
  private initializationAttempted = false;

  /**
   * Check if Web Workers are supported in current environment
   */
  private isWorkerSupported(): boolean {
    return typeof window !== "undefined" && typeof Worker !== "undefined";
  }

  /**
   * Initialize the worker
   */
  private initializeWorker(): Promise<void> {
    if (this.worker || this.initializationAttempted) {
      return this.readyPromise || Promise.resolve();
    }

    this.initializationAttempted = true;

    if (!this.isWorkerSupported()) {
      console.warn(
        "Web Workers not supported, operations will run on main thread"
      );
      this.isReady = false;
      return;
    }

    this.readyPromise = new Promise((resolve, reject) => {
      try {
        // Create worker using Webpack's worker-loader syntax
        this.worker = new Worker(
          new URL("./export.worker.ts", import.meta.url),
          { type: "module" }
        );

        const timeout = setTimeout(() => {
          console.warn(
            "Worker initialization timeout, falling back to main thread"
          );
          this.isReady = false;
          resolve();
        }, 5000);

        this.worker.onmessage = (event: MessageEvent) => {
          const data = event.data;

          // Handle ready signal
          if (data.type === "ready") {
            clearTimeout(timeout);
            this.isReady = true;
            resolve();
            return;
          }

          // Handle response messages
          const response = data as ExportWorkerResponse;
          const pending = this.pendingRequests.get(response.id);

          if (pending) {
            this.pendingRequests.delete(response.id);

            if (response.success) {
              // Reconstruct ImageData from transferred buffer if needed
              if (
                response.result &&
                response.result.data &&
                response.result.width &&
                response.result.height
              ) {
                const { data: dataArray, width, height } = response.result;
                try {
                  // Create a new Uint8ClampedArray with a fresh ArrayBuffer
                  let clampedArray: Uint8ClampedArray;

                  if (dataArray instanceof Uint8ClampedArray) {
                    // Copy to a new array to ensure we have an ArrayBuffer
                    clampedArray = new Uint8ClampedArray(dataArray.length);
                    clampedArray.set(dataArray);
                  } else if (ArrayBuffer.isView(dataArray)) {
                    // Handle other typed array views
                    const view = dataArray as Uint8Array;
                    clampedArray = new Uint8ClampedArray(view.length);
                    clampedArray.set(view);
                  } else if (Array.isArray(dataArray)) {
                    // Handle plain array
                    clampedArray = new Uint8ClampedArray(dataArray);
                  } else {
                    pending.resolve(response.result);
                    return;
                  }

                  // Use type assertion to handle TypeScript strict mode
                  const imageData = new ImageData(
                    clampedArray as unknown as Uint8ClampedArray<ArrayBuffer>,
                    width,
                    height
                  );
                  pending.resolve(imageData);
                } catch {
                  pending.resolve(response.result);
                }
              } else {
                pending.resolve(response.result);
              }
            } else {
              pending.reject(
                new Error(response.error || "Worker operation failed")
              );
            }
          }
        };

        this.worker.onerror = (error) => {
          clearTimeout(timeout);
          console.error("Worker error:", error);
          this.isReady = false;

          // Reject all pending requests
          for (const [id, pending] of this.pendingRequests) {
            pending.reject(new Error("Worker encountered an error"));
            this.pendingRequests.delete(id);
          }

          resolve(); // Resolve initialization so fallback can be used
        };
      } catch (error) {
        console.warn(
          "Failed to create worker, falling back to main thread:",
          error
        );
        this.isReady = false;
        resolve();
      }
    });

    return this.readyPromise;
  }

  /**
   * Generate a unique message ID
   */
  private generateId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  /**
   * Send a message to the worker and wait for response
   */
  private async sendMessage<T>(
    type: ExportWorkerMessageType,
    payload: any,
    transferables?: Transferable[]
  ): Promise<T> {
    await this.initializeWorker();

    if (!(this.isReady && this.worker)) {
      throw new Error("Worker not available");
    }

    const id = this.generateId();
    const request: ExportWorkerRequest = { id, type, payload };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      // Set timeout for the request
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Worker request timeout: ${type}`));
      }, 30_000); // 30 second timeout

      // Update resolve/reject to clear timeout
      this.pendingRequests.set(id, {
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      if (transferables && transferables.length > 0) {
        this.worker!.postMessage(request, transferables);
      } else {
        this.worker!.postMessage(request);
      }
    });
  }

  /**
   * Check if the worker is ready
   */
  async isWorkerReady(): Promise<boolean> {
    await this.initializeWorker();
    return this.isReady;
  }

  /**
   * Generate noise texture using worker
   * Falls back to main thread if worker unavailable
   */
  async generateNoiseTexture(
    width: number,
    height: number,
    intensity: number
  ): Promise<ImageData> {
    await this.initializeWorker();

    // If worker not available, run on main thread
    if (!(this.isReady && this.worker)) {
      return this.generateNoiseTextureFallback(width, height, intensity);
    }

    try {
      return await this.sendMessage<ImageData>("generateNoise", {
        width,
        height,
        intensity,
      } as NoisePayload);
    } catch (error) {
      console.warn("Worker noise generation failed, using fallback:", error);
      return this.generateNoiseTextureFallback(width, height, intensity);
    }
  }

  /**
   * Fallback noise generation on main thread
   */
  private generateNoiseTextureFallback(
    width: number,
    height: number,
    intensity: number
  ): ImageData {
    const imageData = new ImageData(width, height);
    const data = imageData.data;
    const stdDev = intensity * 50;

    for (let i = 0; i < data.length; i += 4) {
      let u = 0,
        v = 0;
      while (u === 0) {
        u = Math.random();
      }
      while (v === 0) {
        v = Math.random();
      }
      const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      const noise = z * stdDev + 128;
      const value = Math.max(0, Math.min(255, Math.round(noise)));

      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }

    return imageData;
  }

  /**
   * Apply blur to image data using worker
   * Falls back to main thread if worker unavailable
   */
  async applyBlur(
    imageData: ImageData,
    blurAmount: number
  ): Promise<ImageData> {
    if (blurAmount <= 0) {
      return imageData;
    }

    await this.initializeWorker();

    if (!(this.isReady && this.worker)) {
      return this.applyBlurFallback(imageData, blurAmount);
    }

    try {
      // Create a copy of the data to transfer
      const dataCopy = new Uint8ClampedArray(imageData.data);
      const payload: BlurPayload = {
        imageData: {
          data: dataCopy,
          width: imageData.width,
          height: imageData.height,
        } as unknown as ImageData,
        blurAmount,
        width: imageData.width,
        height: imageData.height,
      };

      return await this.sendMessage<ImageData>("applyBlur", payload, [
        dataCopy.buffer,
      ]);
    } catch (error) {
      console.warn("Worker blur failed, using fallback:", error);
      return this.applyBlurFallback(imageData, blurAmount);
    }
  }

  /**
   * Fallback blur on main thread
   */
  private applyBlurFallback(
    imageData: ImageData,
    blurAmount: number
  ): ImageData {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return imageData;
    }

    ctx.putImageData(imageData, 0, 0);

    const blurredCanvas = document.createElement("canvas");
    blurredCanvas.width = imageData.width;
    blurredCanvas.height = imageData.height;
    const blurredCtx = blurredCanvas.getContext("2d");

    if (!blurredCtx) {
      return imageData;
    }

    blurredCtx.filter = `blur(${blurAmount}px)`;
    blurredCtx.drawImage(canvas, 0, 0);

    return blurredCtx.getImageData(0, 0, imageData.width, imageData.height);
  }

  /**
   * Apply opacity to image data using worker
   * Falls back to main thread if worker unavailable
   */
  async applyOpacity(
    imageData: ImageData,
    opacity: number
  ): Promise<ImageData> {
    if (opacity >= 1) {
      return imageData;
    }

    await this.initializeWorker();

    if (!(this.isReady && this.worker)) {
      return this.applyOpacityFallback(imageData, opacity);
    }

    try {
      const dataCopy = new Uint8ClampedArray(imageData.data);
      const payload: OpacityPayload = {
        imageData: {
          data: dataCopy,
          width: imageData.width,
          height: imageData.height,
        } as unknown as ImageData,
        opacity,
        width: imageData.width,
        height: imageData.height,
      };

      return await this.sendMessage<ImageData>("applyOpacity", payload, [
        dataCopy.buffer,
      ]);
    } catch (error) {
      console.warn("Worker opacity failed, using fallback:", error);
      return this.applyOpacityFallback(imageData, opacity);
    }
  }

  /**
   * Fallback opacity on main thread
   */
  private applyOpacityFallback(
    imageData: ImageData,
    opacity: number
  ): ImageData {
    const result = new ImageData(imageData.width, imageData.height);
    const srcData = imageData.data;
    const destData = result.data;

    for (let i = 0; i < srcData.length; i += 4) {
      destData[i] = srcData[i];
      destData[i + 1] = srcData[i + 1];
      destData[i + 2] = srcData[i + 2];
      destData[i + 3] = Math.round(srcData[i + 3] * opacity);
    }

    return result;
  }

  /**
   * Composite two image data layers using worker
   * Falls back to main thread if worker unavailable
   */
  async composite(
    baseImageData: ImageData,
    overlayImageData: ImageData,
    blendMode: "normal" | "overlay" | "multiply" | "screen" = "normal",
    overlayOpacity = 1
  ): Promise<ImageData> {
    await this.initializeWorker();

    if (!(this.isReady && this.worker)) {
      return this.compositeFallback(
        baseImageData,
        overlayImageData,
        blendMode,
        overlayOpacity
      );
    }

    try {
      const baseDataCopy = new Uint8ClampedArray(baseImageData.data);
      const overlayDataCopy = new Uint8ClampedArray(overlayImageData.data);

      const payload: CompositePayload = {
        baseImageData: {
          data: baseDataCopy,
          width: baseImageData.width,
          height: baseImageData.height,
        } as unknown as ImageData,
        overlayImageData: {
          data: overlayDataCopy,
          width: overlayImageData.width,
          height: overlayImageData.height,
        } as unknown as ImageData,
        blendMode,
        overlayOpacity,
        width: baseImageData.width,
        height: baseImageData.height,
      };

      return await this.sendMessage<ImageData>("composite", payload, [
        baseDataCopy.buffer,
        overlayDataCopy.buffer,
      ]);
    } catch (error) {
      console.warn("Worker composite failed, using fallback:", error);
      return this.compositeFallback(
        baseImageData,
        overlayImageData,
        blendMode,
        overlayOpacity
      );
    }
  }

  /**
   * Fallback composite on main thread
   */
  private compositeFallback(
    baseImageData: ImageData,
    overlayImageData: ImageData,
    blendMode: string,
    overlayOpacity: number
  ): ImageData {
    const canvas = document.createElement("canvas");
    canvas.width = baseImageData.width;
    canvas.height = baseImageData.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return baseImageData;
    }

    // Draw base
    ctx.putImageData(baseImageData, 0, 0);

    // Create overlay canvas
    const overlayCanvas = document.createElement("canvas");
    overlayCanvas.width = overlayImageData.width;
    overlayCanvas.height = overlayImageData.height;
    const overlayCtx = overlayCanvas.getContext("2d");

    if (!overlayCtx) {
      return baseImageData;
    }

    overlayCtx.putImageData(overlayImageData, 0, 0);

    // Create pattern for tiling
    const pattern = ctx.createPattern(overlayCanvas, "repeat");

    if (pattern) {
      ctx.save();
      ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
      ctx.globalAlpha = overlayOpacity;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, baseImageData.width, baseImageData.height);
      ctx.restore();
    }

    return ctx.getImageData(0, 0, baseImageData.width, baseImageData.height);
  }

  /**
   * Convert image format using worker (OffscreenCanvas)
   * Falls back to main thread canvas if worker unavailable
   */
  async convertFormat(
    canvas: HTMLCanvasElement,
    format: "png" | "jpeg" | "webp",
    quality: number
  ): Promise<{ blob: Blob; mimeType: string; fileSize: number }> {
    await this.initializeWorker();

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context from canvas");
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // If worker not available, use main thread fallback
    if (!(this.isReady && this.worker)) {
      return this.convertFormatFallback(canvas, format, quality);
    }

    try {
      const dataCopy = new Uint8ClampedArray(imageData.data);
      const payload: ConvertFormatPayload = {
        imageData: {
          data: dataCopy,
          width: imageData.width,
          height: imageData.height,
        } as unknown as ImageData,
        format,
        quality,
        width: canvas.width,
        height: canvas.height,
      };

      const result = await this.sendMessage<ConvertFormatResult>(
        "convertFormat",
        payload,
        [dataCopy.buffer]
      );

      // Convert ArrayBuffer back to Blob
      const blob = new Blob([result.blob], { type: result.mimeType });

      return {
        blob,
        mimeType: result.mimeType,
        fileSize: result.fileSize,
      };
    } catch (error) {
      console.warn("Worker format conversion failed, using fallback:", error);
      return this.convertFormatFallback(canvas, format, quality);
    }
  }

  /**
   * Fallback format conversion on main thread
   */
  private async convertFormatFallback(
    canvas: HTMLCanvasElement,
    format: "png" | "jpeg" | "webp",
    quality: number
  ): Promise<{ blob: Blob; mimeType: string; fileSize: number }> {
    const mimeType =
      format === "png"
        ? "image/png"
        : format === "webp"
          ? "image/webp"
          : "image/jpeg";

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              blob,
              mimeType,
              fileSize: blob.size,
            });
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        },
        mimeType,
        format === "png" ? undefined : quality
      );
    });
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
      this.initializationAttempted = false;
      this.readyPromise = null;

      // Reject all pending requests
      for (const [id, pending] of this.pendingRequests) {
        pending.reject(new Error("Worker terminated"));
        this.pendingRequests.delete(id);
      }
    }
  }
}

// Export singleton instance
export const exportWorkerService = new ExportWorkerService();

// Export class for testing
export { ExportWorkerService };
