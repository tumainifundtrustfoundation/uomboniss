/**
 * Utility helper to parse and normalize YouTube and Google Drive URLs for Videos and Documents
 */

export interface ParsedVideoResult {
  source: 'youtube' | 'google_drive' | 'unknown';
  id?: string;
  embedUrl?: string;
  watchUrl?: string;
  thumbnailUrl?: string;
}

export function parseVideoUrl(inputUrl: string): ParsedVideoResult {
  const url = (inputUrl || '').trim();
  if (!url) {
    return { source: 'unknown' };
  }

  // 1. YouTube Matchers
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  // https://www.youtube.com/shorts/VIDEO_ID
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      source: 'youtube',
      id,
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // 2. Google Drive Matchers
  // https://drive.google.com/file/d/FILE_ID/view...
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  const gDriveMatch =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/i) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]{25,})/i);

  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return {
      source: 'google_drive',
      id: fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      watchUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`,
    };
  }

  return { source: 'unknown', watchUrl: url };
}

export interface ParsedDocumentResult {
  isDrive: boolean;
  fileId?: string;
  previewUrl?: string;
  viewUrl?: string;
  downloadUrl?: string;
}

export function parseDocumentUrl(inputUrl: string): ParsedDocumentResult {
  const url = (inputUrl || '').trim();
  if (!url) {
    return { isDrive: false };
  }

  const driveMatch =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]{25,})/i) ||
    url.match(/\/document\/d\/([a-zA-Z0-9_-]{25,})/i) ||
    url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{25,})/i) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]{25,})/i);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      isDrive: true,
      fileId,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    };
  }

  return {
    isDrive: false,
    viewUrl: url,
    downloadUrl: url,
  };
}
