/**
 * YouTube Utility functions for extracting video IDs, generating embed URLs,
 * and fetching official YouTube thumbnails.
 */

/**
 * Extracts the 11-character YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 * - Direct 11-char ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already exactly an 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regular expression capturing 11-character ID across YouTube URL variations
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|(?:shorts)\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

/**
 * Verifies if the given input is a valid YouTube URL or video ID
 */
export function isValidYouTubeUrl(url: string): boolean {
  return Boolean(extractYouTubeId(url));
}

/**
 * Returns a high-definition or standard YouTube thumbnail URL
 */
export function getYouTubeThumbnail(
  youtubeIdOrUrl: string,
  quality: 'max' | 'hq' | 'mq' = 'max'
): string {
  const id = extractYouTubeId(youtubeIdOrUrl) || youtubeIdOrUrl;
  if (!id) return '/public/images/uomboni_flyer_2026.jpg';

  if (quality === 'hq') {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  if (quality === 'mq') {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

/**
 * Returns a privacy-enhanced YouTube embed player URL with safe parameters
 */
export function getYouTubeEmbedUrl(
  youtubeIdOrUrl: string,
  options: {
    autoplay?: boolean;
    mute?: boolean;
    controls?: boolean;
  } = {}
): string {
  const id = extractYouTubeId(youtubeIdOrUrl) || youtubeIdOrUrl;
  const { autoplay = true, mute = false, controls = true } = options;

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    controls: controls ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : 'https://www.uomboniss.sc.tz',
  });

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
