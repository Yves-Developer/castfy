/**
 * Connections change from inside a dialog, while the thing that cares — the
 * first-run gate — sits above it. A window event is the smallest way to let one
 * tell the other without threading state through every layer between them.
 */
export const CLIENTS_CHANGED = 'castfy:clients-changed';
