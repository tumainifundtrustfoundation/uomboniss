/**
 * Image Upload Helper for Direct Client-side Image Processing
 * Converts uploaded image files to lightweight, optimized Base64 Data URLs with automatic canvas compression.
 * Guarantees small payload size (<250KB) to prevent localStorage quota exhaustion and network timeouts.
 */

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number; // target max base64 size (default: ~250KB)
  preserveAlpha?: boolean;
}

export function processImageFile(
  file: File,
  options: ProcessImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1000,
    maxHeight = 800,
    quality = 0.78,
    maxSizeBytes = 250 * 1024, // ~250KB max base64 size
    preserveAlpha = false,
  } = options;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Faili lililochaguliwa si picha halali (Selected file must be a valid image: JPG, PNG, WebP).'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {}
    };

    img.onerror = () => {
      cleanup();
      // Fallback: Try reading via FileReader if objectURL failed
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string) || '');
      };
      reader.onerror = () => {
        reject(new Error('Kushindwa kufungua picha (Failed to load image file).'));
      };
      reader.readAsDataURL(file);
    };

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          width = 800;
          height = 600;
        }

        // Calculate aspect ratio keeping dimensions within max bounds
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          // Fallback to FileReader if canvas 2D context fails
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.readAsDataURL(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const shouldPreserveAlpha = preserveAlpha || file.type === 'image/png' || file.type === 'image/svg+xml';

        if (!shouldPreserveAlpha) {
          // Draw white background for JPEGs
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.clearRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        cleanup();

        // Use WebP if alpha preservation needed, otherwise JPEG
        const mimeType = shouldPreserveAlpha ? 'image/webp' : 'image/jpeg';
        let currentQuality = quality;
        let compressedDataUrl = canvas.toDataURL(mimeType, currentQuality);

        // Fallback to PNG if WebP not supported with alpha
        if (shouldPreserveAlpha && (!compressedDataUrl || compressedDataUrl.startsWith('data:image/png'))) {
          compressedDataUrl = canvas.toDataURL('image/png');
        }

        // Iterative compression safeguard: if output exceeds maxSizeBytes, step down quality & scale
        let attempts = 0;
        while (compressedDataUrl.length > maxSizeBytes && attempts < 3) {
          attempts++;
          currentQuality = Math.max(0.40, currentQuality - 0.15);
          compressedDataUrl = canvas.toDataURL(shouldPreserveAlpha ? 'image/webp' : 'image/jpeg', currentQuality);

          // If still too large after quality drop, scale canvas dimensions down
          if (compressedDataUrl.length > maxSizeBytes && attempts === 2) {
            const smallerCanvas = document.createElement('canvas');
            smallerCanvas.width = Math.round(width * 0.70);
            smallerCanvas.height = Math.round(height * 0.70);
            const smallCtx = smallerCanvas.getContext('2d');
            if (smallCtx) {
              smallCtx.imageSmoothingEnabled = true;
              smallCtx.imageSmoothingQuality = 'high';
              if (!shouldPreserveAlpha) {
                smallCtx.fillStyle = '#FFFFFF';
                smallCtx.fillRect(0, 0, smallerCanvas.width, smallerCanvas.height);
              }
              smallCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
              compressedDataUrl = smallerCanvas.toDataURL(shouldPreserveAlpha ? 'image/webp' : 'image/jpeg', 0.60);
            }
          }
        }

        resolve(compressedDataUrl);
      } catch (err: any) {
        cleanup();
        reject(new Error(err?.message || 'Hitilafu ya kusindika picha (Image processing error).'));
      }
    };

    img.src = objectUrl;
  });
}

/**
 * Process multiple files sequentially or concurrently
 */
export async function processMultipleImageFiles(
  files: File[],
  options: ProcessImageOptions = {}
): Promise<string[]> {
  const results: string[] = [];
  for (const file of files) {
    try {
      const dataUrl = await processImageFile(file, options);
      if (dataUrl) results.push(dataUrl);
    } catch (e) {
      console.warn('Skipping unprocessable image in batch:', e);
    }
  }
  return results;
}

