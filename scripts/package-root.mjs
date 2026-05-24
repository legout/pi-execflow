import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export function currentPackageRoot() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}
