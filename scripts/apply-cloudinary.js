/**
 * apply-cloudinary.js
 *
 * Reads scripts/cloudinary-map.json and replaces every /assets/<filename>
 * string reference in the src/ files with the corresponding Cloudinary URL.
 *
 * Also handles:
 *  - `import X from "../../assets/filename.png"` style imports → converts to
 *    `const X = "https://res.cloudinary.com/..."` string constants
 *  - Videos: replaces src strings, removes the old `import X from "/assets/video"` syntax
 *
 * Run AFTER upload-assets.js:
 *   node scripts/apply-cloudinary.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mapFile = path.join(__dirname, "cloudinary-map.json");
const srcDir = path.join(__dirname, "../src");

// ─── Load map ─────────────────────────────────────────────────────────────────
if (!fs.existsSync(mapFile)) {
  console.error("❌ cloudinary-map.json not found. Run `npm run upload-assets` first.");
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(mapFile, "utf-8"));
const uploadedFiles = Object.keys(map);
console.log(`\n📦 Loaded ${uploadedFiles.length} Cloudinary mappings.\n`);

// ─── Collect all .jsx/.tsx/.js/.ts in src/ ────────────────────────────────────
function collectFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      collectFiles(full, results);
    } else if (entry.isFile() && /\.(jsx|tsx|js|ts)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const files = collectFiles(srcDir);
let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf-8");
  let modified = false;
  let replacements = 0;

  for (const [filename, cloudUrl] of Object.entries(map)) {
    const baseName = path.basename(filename);      // e.g. "Frame01.avif"
    const nameNoExt = path.parse(baseName).name;   // e.g. "Frame01"

    // ── 1. Public-asset string references: "/assets/filename.ext"
    //    Matches both single and double quotes
    const publicRef = new RegExp(
      `(["'\`])/assets/${escapeRegex(baseName)}\\1`,
      "g"
    );
    if (publicRef.test(content)) {
      content = content.replace(publicRef, `$1${cloudUrl}$1`);
      replacements++;
      modified = true;
    }

    // ── 2. ES import → const string: import X from "...assets/filename.ext"
    //    Converts:  import logo from "../../assets/logoreview.png"
    //    To:        const logo = "https://...";
    const importRef = new RegExp(
      `import\\s+(\\w+)\\s+from\\s+["'\`][^"'\`]*${escapeRegex(baseName)}["'\`]`,
      "g"
    );
    if (importRef.test(content)) {
      content = content.replace(importRef, `const $1 = "${cloudUrl}"`);
      replacements++;
      modified = true;
    }

    // ── 3. Named import from "/assets/..." (used for videos with `import male from ...`)
    const namedImportRef = new RegExp(
      `import\\s+(\\w+)\\s+from\\s+["'\`]/assets/${escapeRegex(baseName)}["'\`]`,
      "g"
    );
    if (namedImportRef.test(content)) {
      content = content.replace(namedImportRef, `const $1 = "${cloudUrl}"`);
      replacements++;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, "utf-8");
    console.log(`✅ ${path.relative(process.cwd(), file)} (${replacements} replacement${replacements > 1 ? "s" : ""})`);
    totalReplacements += replacements;
  }
}

console.log(`\n🎉 Done! ${totalReplacements} total replacements across ${files.length} scanned files.\n`);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
