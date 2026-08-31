import { useCallback, useEffect, useState } from 'react';
import { bridge } from './bridge';

/**
 * Local stand-in for the dashboard's useConvexQuery.
 *
 * Same contract on purpose — `undefined` until the first result lands, and a
 * re-render whenever the underlying data changes — so ported components do not
 * care that the source moved from a cloud subscription to the filesystem.
 *
 * The "subscription" is the main process's chokidar watcher: any write under
 * the library folder fires library:changed and every live query refetches.
 */
export function useLocalQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [data, setData] = useState<T>();

  // deps are the query's arguments; the fetcher itself is a fresh closure on
  // every render and would otherwise restart the effect endlessly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  useEffect(() => {
    let active = true;

    const load = () => {
      run()
        .then((value) => {
          if (active) setData(value);
        })
        .catch((error) => {
          // Leave the caller in its loading state rather than taking the page
          // down — same posture the Convex version took.
          console.error('Local query failed:', error);
        });
    };

    load();
    const unsubscribe = bridge.onChange(load);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [run]);

  return data;
}
