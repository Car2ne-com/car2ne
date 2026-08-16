/*
 * Loader Node --experimental-loader locale, usato SOLO per eseguire
 * script una tantum (es. scripts/run-seed-municipalities.ts) che
 * importano moduli reali dell'app scritti con l'alias "@/..."
 * (convenzione tsconfig/Next.js, non uno standard Node). Non fa
 * parte dell'app, non viene mai eseguito dal server Next.js.
 */
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const projectRoot = pathToFileURL(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..") + "/"
);

const EXTENSIONS = ["", ".ts", ".tsx", ".json"];

export async function resolve(specifier, context, nextResolve) {
  let base = null;

  if (specifier.startsWith("@/")) {
    base = new URL(specifier.slice(2), projectRoot);
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    base = new URL(specifier, context.parentURL);
  }

  if (!base) {
    return nextResolve(specifier, context);
  }

  for (const ext of EXTENSIONS) {
    const candidate = new URL(base.href + ext);
    if (existsSync(fileURLToPath(candidate))) {
      const result = await nextResolve(candidate.href, context);
      if (candidate.href.endsWith(".json")) {
        result.importAttributes = { ...result.importAttributes, type: "json" };
      }
      return result;
    }
  }

  return nextResolve(specifier, context);
}
