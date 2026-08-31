import type { ComponentProps } from 'react';
import { Link as RouterLink } from 'react-router';

type NextLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

/**
 * Drop-in for next/link so ported components keep using `href`.
 *
 * A shim rather than rewriting every call site: react-router's Link takes `to`,
 * and mechanically renaming the prop across the tree is where a bulk port
 * quietly breaks something. Next-only props are accepted and ignored.
 */
export default function Link({ href, prefetch, scroll, replace, ...rest }: NextLinkProps) {
  void prefetch;
  void scroll;

  // Absolute URLs are not app routes — let the OS open them.
  if (/^https?:\/\//.test(href)) {
    return <a href={href} rel="noreferrer" target="_blank" {...rest} />;
  }

  return <RouterLink replace={replace} to={href} {...rest} />;
}
