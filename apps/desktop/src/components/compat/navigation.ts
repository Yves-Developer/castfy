import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

/**
 * Drop-in for next/navigation. Same names and shapes so ported components keep
 * calling `usePathname()` and `router.push(...)` unchanged.
 */

export function usePathname(): string {
  return useLocation().pathname;
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export interface RouterShim {
  push(href: string): void;
  replace(href: string): void;
  back(): void;
  forward(): void;
  /** No server components to revalidate; kept so call sites still compile. */
  refresh(): void;
  prefetch(href: string): void;
}

export function useRouter(): RouterShim {
  const navigate = useNavigate();

  return {
    push: useCallback((href: string) => navigate(href), [navigate]),
    replace: useCallback((href: string) => navigate(href, { replace: true }), [navigate]),
    back: useCallback(() => navigate(-1), [navigate]),
    forward: useCallback(() => navigate(1), [navigate]),
    refresh: useCallback(() => {}, []),
    prefetch: useCallback(() => {}, []),
  };
}
