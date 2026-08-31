import { useEffect, useState } from 'react';

/**
 * Drop-in for next/offline's useOffline.
 *
 * navigator.onLine only reports whether the machine has a network interface up,
 * which is the honest amount a renderer can know. It stays useful here because
 * sharing and license checks are the parts that need the network — recording
 * and export do not.
 */
export function useOffline(): boolean {
  const [offline, setOffline] = useState(() =>
    typeof navigator === 'undefined' ? false : !navigator.onLine
  );

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return offline;
}
