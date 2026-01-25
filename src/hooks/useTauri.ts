/**
 * React hooks for Tauri integration
 */

import { useState, useEffect } from 'react';
import { isTauri, getAppInfo, type AppInfo } from '@/lib/tauri-bridge';

/**
 * Hook to check if running in Tauri environment
 */
export function useIsTauri(): boolean {
  const [inTauri, setInTauri] = useState(false);

  useEffect(() => {
    setInTauri(isTauri());
  }, []);

  return inTauri;
}

/**
 * Hook to get application info from Tauri backend
 */
export function useAppInfo(): {
  info: AppInfo | null;
  loading: boolean;
  error: Error | null;
} {
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchInfo() {
      try {
        const appInfo = await getAppInfo();
        if (mounted) {
          setInfo(appInfo);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to get app info'));
          setLoading(false);
        }
      }
    }

    fetchInfo();

    return () => {
      mounted = false;
    };
  }, []);

  return { info, loading, error };
}
