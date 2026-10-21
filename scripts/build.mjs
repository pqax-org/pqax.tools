// Assembles the published folder of pqax.tools: index.html and the assets/ folder of this repository, plus the
// packages @pqax/pqax and @pqax/views from node_modules under lib/, where the import map of index.html finds them.
// Run it after `npm ci`.
//
//   node scripts/build.mjs [output]    default: _site at the root of the repository
//
// The output folder is emptied first. Only the JavaScript of the packages, their source maps, and the stylesheet are
// copied: no declaration file, and not the Node entry of the reader.
import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(process.argv[2] ?? join(root, "_site"));
const modules = join(root, "node_modules", "@pqax");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/** The version of an installed package, or an error that says to run npm ci. */
async function version(name) {
  const file = join(modules, name, "package.json");
  if (!(await exists(file))) {
    throw new Error(`${file} is missing: run npm ci first`);
  }
  return JSON.parse(await readFile(file, "utf8")).version;
}

/** Copies the .js and .js.map files of a dist folder, but the excluded names. */
async function copyDist(from, to, exclude = []) {
  await mkdir(to, { recursive: true });
  let count = 0;
  for (const name of await readdir(from)) {
    const base = name.replace(/\.js(\.map)?$/, "");
    if (!/\.js(\.map)?$/.test(name) || exclude.includes(base)) {
      continue;
    }
    await cp(join(from, name), join(to, name));
    count++;
  }
  return count;
}

const readerVersion = await version("pqax");
const viewsVersion = await version("views");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(join(root, "index.html"), join(output, "index.html"));
if (await exists(join(root, "assets"))) {
  await cp(join(root, "assets"), join(output, "assets"), { recursive: true });
}
const lib = join(output, "lib");
const readerFiles = await copyDist(join(modules, "pqax", "dist"), join(lib, "pqax"), ["node"]);
const viewFiles = await copyDist(join(modules, "views", "dist"), join(lib, "views"));
await cp(join(modules, "views", "styles.css"), join(lib, "views", "styles.css"));
console.log(
  `${output}: index.html, ${readerFiles} files of @pqax/pqax ${readerVersion}, ` +
    `${viewFiles + 1} files of @pqax/views ${viewsVersion}`,
);
