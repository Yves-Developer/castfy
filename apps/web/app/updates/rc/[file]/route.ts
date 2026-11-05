import { updateFile } from "@/server/update-files";

/**
 * castfy.app/updates/rc/<file>: the same for test builds (built from a
 * release/desktop-v...-rc branch), which update only to the newest published
 * pre-release, so they are never offered to testers on the real builds.
 */
export async function GET(
  _request: Request,
  context: RouteContext<"/updates/rc/[file]">
) {
  const { file } = await context.params;
  return updateFile(file, "rc");
}
