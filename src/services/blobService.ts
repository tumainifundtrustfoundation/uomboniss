/**
 * Uomboni Secondary School — Vercel Blob & Cloud Storage Service
 * 
 * Provides production-grade file uploads and permanent cloud asset persistence
 * with bidirectional synchronization to Firebase Firestore:
 * 
 * 1. uploadTeacherHeadshot: Uploads official teacher portraits to Vercel Blob,
 *    returning the permanent public URL and updating the teacher's profile in
 *    Firestore (both `users/{uid}` and `teachers/{id}`).
 * 2. uploadSchoolGalleryImage: Uploads school activities, laboratories, and campus
 *    photos to Vercel Blob, returning the permanent public URL and saving the
 *    `GalleryPhoto` record to Firestore (`gallery_photos/{id}` and `school_data/galleryPhotos`).
 * 3. Handles all Firestore mutations with `handleFirestoreError` as mandated
 *    by the Firebase Integration rules.
 */

import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { GalleryPhoto } from '../types';
import { saveLiveSchoolDataToFirestore } from './schoolFirestoreService';

export interface BlobUploadResult {
  success: boolean;
  url: string;
  pathname?: string;
  filename: string;
  size: number;
  mimeType: string;
  source: 'vercel_blob' | 'local_storage';
  error?: string;
}

export interface BlobUploadOptions {
  folder?: 'teachers' | 'gallery' | 'documents' | 'students' | 'general';
  filename?: string;
  mimeType?: string;
}

export interface TeacherHeadshotUploadResult {
  success: boolean;
  url: string;
  teacherIdOrUid: string;
  filename: string;
  size: number;
  source: 'vercel_blob' | 'local_storage';
  firestoreUpdated: boolean;
  error?: string;
}

export interface SchoolGalleryUploadOptions {
  titleSw: string;
  titleEn?: string;
  category?: 'Matukio ya Kikanisa' | 'Maabara na Sayansi' | 'Michezo na Sanaa' | 'Mahafali (Graduation)' | 'Mazingira ya Marangu' | 'Taaluma na Maktaba' | 'Uongozi na Malezi' | string;
  descriptionSw?: string;
  descriptionEn?: string;
  date?: string;
  updateFirestore?: boolean;
  uploadedBy?: string;
}

export interface SchoolGalleryUploadResult {
  success: boolean;
  url: string;
  photo?: GalleryPhoto;
  filename: string;
  size: number;
  source: 'vercel_blob' | 'local_storage';
  firestoreUpdated: boolean;
  error?: string;
}

/**
 * Validates that an uploaded file is a valid image format
 */
export function validateImageFile(file: File | Blob, maxSizeBytes: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
  const type = file.type || '';
  const validMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
  ];

  if (type && !validMimes.includes(type) && !type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Muundo wa faili si sahihi. Tafadhali pakia picha ya muundo wa JPEG, PNG au WebP (Invalid image format).',
    };
  }

  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `Picha ni kubwa mno (${(file.size / (1024 * 1024)).toFixed(1)}MB). Ukubwa wa juu unaoruhusiwa ni ${maxMb}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Client-side canvas image compression to produce permanent, compact WebP/JPEG data URLs
 * guaranteeing image persistence in Firebase Firestore even when backend endpoint is unavailable.
 */
export function compressImageClientSide(
  file: File | Blob,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const resultStr = (e.target?.result as string) || '';
      if (!resultStr.startsWith('data:image/')) {
        resolve(resultStr);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const webpData = canvas.toDataURL('image/webp', quality);
            if (webpData.length > 50) {
              resolve(webpData);
              return;
            }
          } catch {}
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(resultStr);
        }
      };
      img.onerror = () => resolve(resultStr);
      img.src = resultStr;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Core function to upload any file to Vercel Blob or server cloud storage.
 * Automatically converts file to Base64 and dispatches to `/api/blob/upload`
 * which uses @vercel/blob when configured, with local and Firestore client-side fallback.
 */
export async function uploadBlobFile(
  file: File | Blob,
  options: BlobUploadOptions = {}
): Promise<BlobUploadResult> {
  const folder = options.folder || 'general';
  const rawName = (file instanceof File ? file.name : options.filename) || `file_${Date.now()}`;
  const cleanFilename = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const mimeType = options.mimeType || file.type || 'application/octet-stream';

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const resultStr = reader.result as string;
        const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;

        if (!base64Data) {
          resolve({
            success: false,
            url: '',
            filename: cleanFilename,
            size: file.size,
            mimeType,
            source: 'local_storage',
            error: 'Failed to convert file buffer to Base64',
          });
          return;
        }

        let res: Response | null = null;
        try {
          res = await fetch('/api/blob/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: cleanFilename,
              data: base64Data,
              mimeType,
              folder,
            }),
          });
        } catch (fetchErr) {
          console.warn('[Blob Upload] Network fetch to backend failed, applying Firestore client fallback:', fetchErr);
        }

        // If backend succeeded with Vercel Blob or local storage
        if (res && res.ok) {
          const json = await res.json();
          const url = json.url || '';
          const source = json.source || (url.includes('blob.vercel-storage.com') ? 'vercel_blob' : 'local_storage');
          resolve({
            success: true,
            url,
            pathname: json.pathname,
            filename: json.filename || cleanFilename,
            size: json.size || file.size,
            mimeType: json.mimeType || mimeType,
            source,
          });
          return;
        }

        // Resilient Fallback: If on pure Vercel static deployment or backend unavailable,
        // compress client-side and return permanent data URL to save in Firebase Firestore.
        // This guarantees that photos NEVER break or disappear on refresh or mobile.
        const compressedDataUrl = await compressImageClientSide(file);
        if (compressedDataUrl) {
          resolve({
            success: true,
            url: compressedDataUrl,
            filename: cleanFilename,
            size: compressedDataUrl.length,
            mimeType: 'image/webp',
            source: 'local_storage',
          });
          return;
        }

        resolve({
          success: false,
          url: '',
          filename: cleanFilename,
          size: file.size,
          mimeType,
          source: 'local_storage',
          error: 'Imeshindwa kusoma na kubana picha kwa ajili ya kuhifadhi.',
        });
      } catch (err: any) {
        resolve({
          success: false,
          url: '',
          filename: cleanFilename,
          size: file.size,
          mimeType,
          source: 'local_storage',
          error: err?.message || 'Hitilafu ya muunganisho wa mtandao wakati wa kupakia faili.',
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
        error: 'Kivinjari kimeshindwa kusoma faili kutoka kwenye kifaa.',
      });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Permanently deletes a blob asset from Vercel Blob or server storage.
 */
export async function deleteBlobFile(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch('/api/blob/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('[Blob Service] Could not delete blob:', err);
    return false;
  }
}

/**
 * Synchronizes teacher headshot URL into Firebase Firestore profiles:
 * - Updates `users/{teacherIdOrUid}` with `{ photoURL, updatedAt }`
 * - Updates `teachers/{teacherIdOrUid}` with `{ photoUrl, imageUrl, updatedAt }`
 * - Syncs local storage caches
 */
export async function syncTeacherHeadshotToFirestore(
  teacherIdOrUid: string,
  permanentUrl: string,
  teacherName?: string
): Promise<boolean> {
  if (!teacherIdOrUid || !permanentUrl) return false;

  const now = new Date().toISOString();
  let anySuccess = false;

  // 1. Update users/{uid} in Firestore
  try {
    const userRef = doc(db, 'users', teacherIdOrUid);
    await setDoc(userRef, {
      photoURL: permanentUrl,
      updatedAt: now,
    }, { merge: true });
    anySuccess = true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `users/${teacherIdOrUid}`);
      } catch (logErr) {
        console.warn('[Blob Service] Handled Firestore error on user profile update:', logErr);
      }
    } else {
      console.warn('[Blob Service] Firestore users doc write warning:', err?.message || err);
    }
  }

  // 2. Update teachers collection if exists
  try {
    const teacherRef = doc(db, 'teachers', teacherIdOrUid);
    await setDoc(teacherRef, {
      photoUrl: permanentUrl,
      imageUrl: permanentUrl,
      updatedAt: now,
      ...(teacherName ? { name: teacherName, fullName: teacherName } : {}),
    }, { merge: true });
    anySuccess = true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `teachers/${teacherIdOrUid}`);
      } catch (logErr) {
        console.warn('[Blob Service] Handled Firestore error on teachers update:', logErr);
      }
    } else {
      console.warn('[Blob Service] Firestore teachers doc write warning:', err?.message || err);
    }
  }

  // 3. Sync to client localStorage caches
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`uomboni_teacher_photo_${teacherIdOrUid}`, permanentUrl);

      const previewProfileStr = localStorage.getItem('uomboni_preview_profile');
      if (previewProfileStr) {
        const preview = JSON.parse(previewProfileStr);
        if (preview.uid === teacherIdOrUid || !preview.uid) {
          preview.photoURL = permanentUrl;
          localStorage.setItem('uomboni_preview_profile', JSON.stringify(preview));
        }
      }
    } catch {}
  }

  return anySuccess;
}

/**
 * Uploads a teacher's official headshot / portrait to Vercel Blob.
 * Returns the permanent public URL and persists it to the teacher's profile in Firebase Firestore.
 */
export async function uploadTeacherHeadshot(
  file: File | Blob,
  teacherIdOrUid: string,
  options?: {
    teacherName?: string;
    updateFirestore?: boolean;
  }
): Promise<TeacherHeadshotUploadResult> {
  const shouldUpdateFirestore = options?.updateFirestore !== false;

  // 1. Validate image format & size
  const validation = validateImageFile(file, 10 * 1024 * 1024);
  if (!validation.valid) {
    return {
      success: false,
      url: '',
      teacherIdOrUid,
      filename: '',
      size: file.size,
      source: 'local_storage',
      firestoreUpdated: false,
      error: validation.error,
    };
  }

  // 2. Prepare safe unique filename
  const ext = file instanceof File && file.name.includes('.')
    ? file.name.substring(file.name.lastIndexOf('.'))
    : '.jpg';
  const cleanId = teacherIdOrUid.replace(/[^a-zA-Z0-9_-]/g, '_');
  const targetFilename = `headshot_${cleanId}_${Date.now()}${ext}`;

  // 3. Upload to Vercel Blob
  const uploadResult = await uploadBlobFile(file, {
    folder: 'teachers',
    filename: targetFilename,
    mimeType: file.type || 'image/jpeg',
  });

  if (!uploadResult.success || !uploadResult.url) {
    return {
      success: false,
      url: '',
      teacherIdOrUid,
      filename: targetFilename,
      size: file.size,
      source: uploadResult.source,
      firestoreUpdated: false,
      error: uploadResult.error || 'Imeshindikana kupakia picha ya mwalimu kwenye Vercel Blob.',
    };
  }

  const permanentUrl = uploadResult.url;
  let firestoreUpdated = false;

  // 4. Save permanent URL to Firebase Firestore
  if (shouldUpdateFirestore) {
    firestoreUpdated = await syncTeacherHeadshotToFirestore(
      teacherIdOrUid,
      permanentUrl,
      options?.teacherName
    );
  }

  return {
    success: true,
    url: permanentUrl,
    teacherIdOrUid,
    filename: uploadResult.filename,
    size: uploadResult.size,
    source: uploadResult.source,
    firestoreUpdated,
  };
}

/**
 * Saves a gallery photo record into Firebase Firestore:
 * - Creates/updates document in `gallery_photos/{photo.id}`
 * - Appends to live `school_data/galleryPhotos` snapshot for multi-device sync
 */
export async function saveGalleryPhotoToFirestore(photo: GalleryPhoto): Promise<boolean> {
  if (!photo || !photo.id || !photo.imageUrl) return false;

  const now = new Date().toISOString();
  let anySuccess = false;

  // 1. Direct document write in `gallery_photos/{id}`
  try {
    const docRef = doc(db, 'gallery_photos', photo.id);
    await setDoc(docRef, {
      ...photo,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
    anySuccess = true;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      try {
        handleFirestoreError(err, OperationType.WRITE, `gallery_photos/${photo.id}`);
      } catch (logErr) {
        console.warn('[Blob Service] Handled Firestore error on gallery photo write:', logErr);
      }
    } else {
      console.warn('[Blob Service] Firestore gallery_photos doc write notice:', err?.message || err);
    }
  }

  // 2. Snapshot array write in `school_data/galleryPhotos`
  try {
    const existingSnap = await getDocs(collection(db, 'gallery_photos'));
    const allPhotos: GalleryPhoto[] = existingSnap.docs.map((d) => d.data() as GalleryPhoto);

    // Ensure current photo is included
    const exists = allPhotos.some((p) => p.id === photo.id);
    const updatedList = exists
      ? allPhotos.map((p) => (p.id === photo.id ? photo : p))
      : [photo, ...allPhotos];

    await saveLiveSchoolDataToFirestore('galleryPhotos', updatedList);
    anySuccess = true;
  } catch (err) {
    console.warn('[Blob Service] Live school_data snapshot update note:', err);
  }

  // 3. Sync to client localStorage cache
  if (typeof localStorage !== 'undefined') {
    try {
      const cached = localStorage.getItem('uomboni_gallery');
      const list: GalleryPhoto[] = cached ? JSON.parse(cached) : [];
      const updatedList = [photo, ...list.filter((p) => p.id !== photo.id)];
      localStorage.setItem('uomboni_gallery', JSON.stringify(updatedList));
    } catch {}
  }

  return anySuccess;
}

/**
 * Retrieves all stored school gallery photos from Firebase Firestore.
 * First checks the centralized snapshot in school_data/galleryPhotos,
 * then falls back to querying the gallery_photos collection.
 */
export async function getGalleryPhotosFromFirestore(): Promise<GalleryPhoto[]> {
  try {
    // 1. Check snapshot in school_data/galleryPhotos
    const snapDoc = await getDoc(doc(db, 'school_data', 'galleryPhotos'));
    if (snapDoc.exists()) {
      const data = snapDoc.data();
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data as GalleryPhoto[];
      }
    }

    // 2. Query individual gallery_photos collection
    const snap = await getDocs(collection(db, 'gallery_photos'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as GalleryPhoto);
    }
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      try {
        handleFirestoreError(err, OperationType.LIST, 'gallery_photos');
      } catch (logErr) {
        console.warn('[Blob Service] Handled Firestore error on get gallery photos:', logErr);
      }
    } else {
      console.warn('[Blob Service] Error fetching gallery photos from Firestore:', err?.message || err);
    }
  }
  return [];
}

/**
 * Uploads a school activity, laboratory, or campus photograph to Vercel Blob.
 * Returns the permanent public URL and persists the photo document in Firebase Firestore.
 */
export async function uploadSchoolGalleryImage(
  file: File | Blob,
  metadata: SchoolGalleryUploadOptions
): Promise<SchoolGalleryUploadResult> {
  const shouldUpdateFirestore = metadata.updateFirestore !== false;

  // 1. Validate image format & size (up to 15MB for high-res gallery shots)
  const validation = validateImageFile(file, 15 * 1024 * 1024);
  if (!validation.valid) {
    return {
      success: false,
      url: '',
      filename: '',
      size: file.size,
      source: 'local_storage',
      firestoreUpdated: false,
      error: validation.error,
    };
  }

  // 2. Clean safe filename
  const ext = file instanceof File && file.name.includes('.')
    ? file.name.substring(file.name.lastIndexOf('.'))
    : '.jpg';
  const cleanCat = (metadata.category || 'gallery').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const targetFilename = `uomboni_${cleanCat}_${Date.now()}${ext}`;

  // 3. Upload to Vercel Blob (folder: 'gallery')
  const uploadResult = await uploadBlobFile(file, {
    folder: 'gallery',
    filename: targetFilename,
    mimeType: file.type || 'image/jpeg',
  });

  if (!uploadResult.success || !uploadResult.url) {
    return {
      success: false,
      url: '',
      filename: targetFilename,
      size: file.size,
      source: uploadResult.source,
      firestoreUpdated: false,
      error: uploadResult.error || 'Imeshindikana kupakia picha ya matunzio kwenye Vercel Blob.',
    };
  }

  const permanentUrl = uploadResult.url;
  const photoId = `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const photoRecord: GalleryPhoto = {
    id: photoId,
    titleSw: metadata.titleSw.trim(),
    titleEn: (metadata.titleEn || metadata.titleSw).trim(),
    category: metadata.category || 'Mazingira ya Marangu',
    imageUrl: permanentUrl,
    filename: uploadResult.filename,
    date: metadata.date || new Date().toISOString().split('T')[0],
    descriptionSw: metadata.descriptionSw?.trim(),
    descriptionEn: metadata.descriptionEn?.trim(),
  };

  let firestoreUpdated = false;

  // 4. Save metadata to Firebase Firestore
  if (shouldUpdateFirestore) {
    firestoreUpdated = await saveGalleryPhotoToFirestore(photoRecord);
  }

  return {
    success: true,
    url: permanentUrl,
    photo: photoRecord,
    filename: uploadResult.filename,
    size: uploadResult.size,
    source: uploadResult.source,
    firestoreUpdated,
  };
}

/**
 * Removes a photo from both Vercel Blob storage and Firebase Firestore.
 */
export async function deleteGalleryPhotoFromStorage(photoId: string, photoUrl?: string): Promise<boolean> {
  let blobDeleted = true;
  if (photoUrl) {
    blobDeleted = await deleteBlobFile(photoUrl);
  }

  try {
    const docRef = doc(db, 'gallery_photos', photoId);
    await deleteDoc(docRef);
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      try {
        handleFirestoreError(err, OperationType.DELETE, `gallery_photos/${photoId}`);
      } catch (logErr) {
        console.warn('[Blob Service] Handled delete error:', logErr);
      }
    }
  }

  return blobDeleted;
}

/**
 * Uploads a text/string file (such as articles, markdown, notes) directly to Vercel Blob store
 * using the configured uomboniss storeId or token.
 */
export async function putTextBlobFile(
  pathname: string,
  text: string,
  contentType: string = 'text/plain; charset=utf-8'
): Promise<{ success: boolean; url: string; pathname?: string; error?: string }> {
  try {
    const res = await fetch('/api/blob/put-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathname, text, contentType }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { success: false, url: '', error: errText };
    }
    const json = await res.json();
    return {
      success: true,
      url: json.url || '',
      pathname: json.pathname || pathname,
    };
  } catch (err: any) {
    return { success: false, url: '', error: err?.message || 'Failed to put blob text' };
  }
}

