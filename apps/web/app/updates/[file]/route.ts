import { updateFile } from "@/server/update-files";

/**
 * castfy.app/updates/<file>: where installed apps look for updates (the
 * `publish` URL in apps/desktop/electron-builder.yml). The latest published
 * release; see server/update-files.ts.
 */
export async function GET(
  _request: Request,
  context: RouteContext<"/updates/[file]">
) {
  const { file } = await context.params;
  return updateFile(file, "stable");
}
