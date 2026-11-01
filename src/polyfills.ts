/**
 * Browser polyfills and runtime guards for Android WebView 80+, older Chrome,
 * and low-end mobile devices on slow connections.
 */

// 1. crypto.randomUUID Polyfill (Chrome 92+)
if (typeof window !== 'undefined') {
  try {
    if (!window.crypto) {
      // @ts-expect-error - polyfill missing crypto object
      window.crypto = {};
    }
    if (!window.crypto.randomUUID) {
      window.crypto.randomUUID = function (): `${string}-${string}-${string}-${string}-${string}` {
        if (typeof window.crypto.getRandomValues === 'function') {
          return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
            const n = Number(c);
            return (n ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))).toString(16);
          }) as `${string}-${string}-${string}-${string}-${string}`;
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }) as `${string}-${string}-${string}-${string}-${string}`;
      };
    }
  } catch {
    // Graceful fallback
  }

  // 2. structuredClone Polyfill (Chrome 98+)
  try {
    if (typeof window.structuredClone !== 'function') {
      window.structuredClone = function <T>(obj: T): T {
        if (obj === undefined) return undefined as unknown as T;
        return JSON.parse(JSON.stringify(obj));
      };
    }
  } catch {
    // Graceful fallback
  }

  // 3. matchMedia.addEventListener Polyfill for older Chrome / WebView (< 86)
  try {
    if (typeof window.matchMedia === 'function') {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = function (query: string): MediaQueryList {
        const mql = originalMatchMedia.call(window, query);
        if (mql && !mql.addEventListener && typeof mql.addListener === 'function') {
          mql.addEventListener = function (
            type: string,
            listener: EventListenerOrEventListenerObject
          ) {
            if (type === 'change') {
              // @ts-expect-error - compatibility bridge
              mql.addListener(listener);
            }
          };
          mql.removeEventListener = function (
            type: string,
            listener: EventListenerOrEventListenerObject
          ) {
            if (type === 'change') {
              // @ts-expect-error - compatibility bridge
              mql.removeListener(listener);
            }
          };
        }
        return mql;
      };
    }
  } catch {
    // Graceful fallback
  }

  // 4. Safe RequestAnimationFrame Guard
  if (typeof window.requestAnimationFrame !== 'function') {
    window.requestAnimationFrame = function (callback: FrameRequestCallback): number {
      return window.setTimeout(() => callback(Date.now()), 16);
    };
    window.cancelAnimationFrame = function (id: number): void {
      clearTimeout(id);
    };
  }
}

/**
 * Check if user is on a slow connection (2G, 3G, or Save-Data mode).
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  try {
    // @ts-expect-error - NetworkInformation API
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      if (conn.saveData === true) return true;
      const type = String(conn.effectiveType || '').toLowerCase();
      if (type.includes('2g') || type.includes('3g') || type === 'slow-2g') {
        return true;
      }
    }
  } catch {
    // Ignore error
  }
  return false;
}

/**
 * Check if client device is severely memory constrained.
 * Undefined navigator.deviceMemory or hardwareConcurrency defaults to false (not low-end).
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // @ts-expect-error - deviceMemory API
    const mem = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    // Only flag if both memory and cores are strictly reported and minimal
    if (typeof mem === 'number' && typeof cores === 'number' && mem <= 1 && cores <= 1) {
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
}
