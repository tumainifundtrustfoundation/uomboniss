/**
 * Google Drive URL Utility for Uomboni Secondary School
 * Converts various Google Drive link formats to direct preview, view, and download URLs.
 */

export interface GoogleDriveFileInfo {
  fileId: string;
  previewUrl: string;
  downloadUrl: string;
  viewUrl: string;
  isFolder: boolean;
}

/**
 * Extracts Google Drive File ID or Folder ID from various URL formats:
 * - https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
 * - https://drive.google.com/open?id=1A2B3C4D5E6F7G8H9I0J
 * - https://drive.google.com/uc?id=1A2B3C4D5E6F7G8H9I0J
 * - https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J
 * - Direct ID string
 */
export function extractGoogleDriveId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If input is already an ID (alphanumeric, dashes, underscores, usually 25-45 chars)
  if (/^[a-zA-Z0-9_-]{20,50}$/.test(trimmed) && !trimmed.includes('http')) {
    return trimmed;
  }

  // /file/d/{id} pattern
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  // /folders/{id} pattern
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/i);
  if (folderMatch && folderMatch[1]) return folderMatch[1];

  // ?id={id} pattern
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  return null;
}

/**
 * Checks if a string is a valid Google Drive URL or File ID
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    Boolean(extractGoogleDriveId(url))
  );
}

/**
 * Parses a Google Drive link and returns preview, download, and view URLs
 */
export function parseGoogleDriveUrl(urlOrId: string): GoogleDriveFileInfo | null {
  const fileId = extractGoogleDriveId(urlOrId);
  if (!fileId) return null;

  const isFolder = urlOrId.includes('/folders/');

  if (isFolder) {
    return {
      fileId,
      previewUrl: `https://drive.google.com/drive/folders/${fileId}`,
      downloadUrl: `https://drive.google.com/drive/folders/${fileId}`,
      viewUrl: `https://drive.google.com/drive/folders/${fileId}`,
      isFolder: true,
    };
  }

  return {
    fileId,
    previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
    isFolder: false,
  };
}
