/**
 * Uomboni Secondary School — Vercel Blob & Secure Cloud File Storage Utility
 * 
 * Provides unified file upload and storage with support for:
 * 1. Vercel Blob Storage (@vercel/blob) when BLOB_READ_WRITE_TOKEN is configured.
 * 2. Secure local /uploads storage fallback for local development or preview environments.
 * 3. Firebase Firestore metadata synchronization.
 */

export interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  source: 'vercel_blob' | 'local_storage';
  error?: string;
}

export interface UploadOptions {
  folder?: 'documents' | 'teachers' | 'students' | 'avatars' | 'general';
  filename?: string;
  mimeType?: string;
}

/**
 * Uploads a file (document, PDF, photo, image) to Vercel Blob or secure server storage.
 */
export async function uploadToStorage(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const folder = options.folder || 'general';
  const rawName = (file instanceof File ? file.name : options.filename) || `file_${Date.now()}`;
  const cleanFilename = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const mimeType = options.mimeType || file.type || 'application/octet-stream';

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        if (!base64Data) {
          resolve({
            success: false,
            url: '',
            filename: cleanFilename,
            size: file.size,
            mimeType,
            source: 'local_storage',
            error: 'Failed to read file buffer',
          });
          return;
        }

        const res = await fetch('/api/blob/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: cleanFilename,
            data: base64Data,
            mimeType,
            folder,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          resolve({
            success: false,
            url: '',
            filename: cleanFilename,
            size: file.size,
            mimeType,
            source: 'local_storage',
            error: `Upload server error (${res.status}): ${errText}`,
          });
          return;
        }

        const json = await res.json();
        resolve({
          success: true,
          url: json.url,
          filename: json.filename || cleanFilename,
          size: json.size || file.size,
          mimeType: json.mimeType || mimeType,
          source: json.source || (json.url.includes('blob.vercel-storage.com') ? 'vercel_blob' : 'local_storage'),
        });
      } catch (err: any) {
        resolve({
          success: false,
          url: '',
          filename: cleanFilename,
          size: file.size,
          mimeType,
          source: 'local_storage',
          error: err?.message || 'Network upload failure',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        url: '',
        filename: cleanFilename,
        size: file.size,
        mimeType,
        source: 'local_storage',
        error: 'Failed to read file from disk',
      });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Deletes a file from Vercel Blob or server storage.
 */
export async function deleteFromStorage(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch('/api/blob/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch {
    return false;
  }
}
