import type { SVGProps } from 'react';
import type { IconType } from 'react-icons';
import { SiClaude, SiModelcontextprotocol, SiOpenai } from 'react-icons/si';

/**
 * Brand marks for the agent clients.
 *
 * These come from Simple Icons via react-icons — the real logos, already a
 * dependency, and bundled rather than fetched so they work offline and follow
 * the theme through currentColor.
 *
 * Cursor is the exception: Simple Icons does not carry it, so its mark below is
 * drawn. Swap it for the real SVG if you get one.
 */

type IconProps = SVGProps<SVGSVGElement>;

/** Claude's asterisk — used for both Claude clients, since both are Claude. */
export const ClaudeIcon = SiClaude;

/** Codex is OpenAI's, and ships under the OpenAI mark. */
export const CodexIcon = SiOpenai;

/** The Model Context Protocol mark. */
export const McpIcon = SiModelcontextprotocol;

/** Stand-in: Cursor is not in Simple Icons. */
export const CursorIcon: IconType = (props: IconProps) => {
  return (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Cursor</title>
      <path
        d="M12 2.6 20.4 7v10L12 21.4 3.6 17V7L12 2.6Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M12 12.1 20.4 7M12 12.1V21.4M12 12.1 3.6 7"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export const CLIENT_ICONS: Record<string, IconType> = {
  'claude-code': ClaudeIcon,
  'claude-desktop': ClaudeIcon,
  cursor: CursorIcon,
  codex: CodexIcon,
};
