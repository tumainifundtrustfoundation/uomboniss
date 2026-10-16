import { StudentResult } from '../types';

export const RESULTS_CACHE_NAME = 'uomboni-sec-results-v3';
export const RESULTS_API_URL = '/api/results';

export interface OfflineResultsStatus {
  isOffline: boolean;
  cachedCount: number;
  lastSyncedAt: number | null;
  serviceWorkerActive: boolean;
}

/**
 * Sends student results to the active Service Worker and writes directly
 * to the Cache Storage API so results are immediately accessible offline.
 */
export async function cacheStudentResultsOffline(results: StudentResult[]): Promise<{
  success: boolean;
  count: number;
  timestamp: number;
}> {
  const timestamp = Date.now();
  const count = results.length;

  try {
    // 1. Direct write to Cache Storage (Cache API)
    if ('caches' in window) {
      try {
        const cache = await caches.open(RESULTS_CACHE_NAME);
        const payload = {
          success: true,
          count,
          results,
          timestamp,
          source: 'uomboni-service-worker-cache',
        };

        const jsonResponse = new Response(JSON.stringify(payload), {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-Uomboni-Cache': 'offline-ready',
            'X-Cache-Timestamp': String(timestamp),
          },
        });

        await cache.put(RESULTS_API_URL, jsonResponse.clone());
        await cache.put(`${RESULTS_API_URL}?cached=true`, jsonResponse.clone());

        // Cache individual student results by exam number for instant lookups
        for (const student of results) {
          const studentPayload = {
            success: true,
            student,
            timestamp,
            source: 'uomboni-service-worker-cache',
          };
          const studentResponse = new Response(JSON.stringify(studentPayload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
          const safeKey = encodeURIComponent(student.examNumber);
          await cache.put(`${RESULTS_API_URL}?examNumber=${safeKey}`, studentResponse);
        }

        localStorage.setItem('uomboni_offline_results_synced_at', String(timestamp));
        localStorage.setItem('uomboni_offline_results_count', String(count));
      } catch (cacheErr) {
        console.warn('Direct Cache Storage put warning:', cacheErr);
      }
    }

    // 2. Post message to active Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_STUDENT_RESULTS',
        payload: {
          results,
          count,
          timestamp,
        },
      });
    }

    return { success: true, count, timestamp };
  } catch (err) {
    console.error('Failed to cache student results for offline use:', err);
    return { success: false, count: 0, timestamp };
  }
}

/**
 * Retrieves student results from Cache Storage if offline or network is unavailable
 */
export async function getCachedStudentResultsOffline(): Promise<StudentResult[] | null> {
  try {
    if ('caches' in window) {
      const cache = await caches.open(RESULTS_CACHE_NAME);
      const cachedResponse = await cache.match(RESULTS_API_URL);
      if (cachedResponse) {
        const data = await cachedResponse.json();
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          return data.results;
        }
      }
    }
  } catch (err) {
    console.warn('Could not read cached student results:', err);
  }
  return null;
}

/**
 * Checks current offline status and cache statistics
 */
export async function getOfflineResultsStatus(): Promise<OfflineResultsStatus> {
  const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
  let cachedCount = 0;
  let lastSyncedAt: number | null = null;
  const serviceWorkerActive = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

  try {
    const storedCount = localStorage.getItem('uomboni_offline_results_count');
    const storedTime = localStorage.getItem('uomboni_offline_results_synced_at');
    if (storedCount) cachedCount = parseInt(storedCount, 10) || 0;
    if (storedTime) lastSyncedAt = parseInt(storedTime, 10) || null;

    if ('caches' in window) {
      const cache = await caches.open(RESULTS_CACHE_NAME);
      const cachedResponse = await cache.match(RESULTS_API_URL);
      if (cachedResponse) {
        const data = await cachedResponse.json();
        if (data && Array.isArray(data.results)) {
          cachedCount = data.results.length;
          if (data.timestamp) lastSyncedAt = data.timestamp;
        }
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  return {
    isOffline,
    cachedCount,
    lastSyncedAt,
    serviceWorkerActive,
  };
}

/**
 * Listens for network online/offline transitions and service worker messages
 */
export function setupOfflineResultsListener(
  onStatusChange: (status: OfflineResultsStatus) => void
): () => void {
  const updateStatus = async () => {
    const status = await getOfflineResultsStatus();
    onStatusChange(status);
  };

  const handleOnline = () => updateStatus();
  const handleOffline = () => updateStatus();

  const handleMessage = (event: MessageEvent) => {
    if (event.data && (event.data.type === 'STUDENT_RESULTS_CACHED' || event.data.type === 'OFFLINE_CACHE_READY')) {
      updateStatus();
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handleMessage);
  }

  // Initial call
  updateStatus();

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  };
}
