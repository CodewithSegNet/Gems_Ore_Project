import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "../.env") });

// Parse  cloudinary://<api_key>:<api_secret>@<cloud_name>
const rawUrl = process.env.CLOUDINARY_URL ?? "";
const match = rawUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
if (!match) {
  console.error("❌ CLOUDINARY_URL is missing or malformed in .env");
  console.error("   Expected: cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>");
  process.exit(1);
}
const [, apiKey, apiSecret, cloudName] = match;

cloudinary.config({
  api_key: apiKey,
  api_secret: apiSecret,
  cloud_name: cloudName,
  secure: true,
});


// ─── Assets to upload ────────────────────────────────────────────────────────
// All files live in /public/assets/.
// SVGs are uploaded as resource_type: "image".
// Videos (.mp4) are uploaded as resource_type: "video".
// Everything else is resource_type: "auto".

const ASSETS_TO_UPLOAD = [
  // ── Hero / section images (large) ──
  "Frame01.avif",
  "jewels.avif",
  "mbg.avif",
  "neckless.avif",
  "earrings.avif",
  "bracklet.avif",
  "bracs.avif",
  "rings.avif",
  "watches.avif",
  "male_collection_1.avif",
  "male_collection_2.avif",
  "male_collection_3.avif",
  "male_collection_4.avif",
  "male_collection_5.avif",
  "male_collection_6.avif",
  // ── Product category icons (small PNGs) ──
  "watch.png",
  "ring.png",
  "necklace.png",
  "earrings.png",
  "bracelet.png",
  // ── Brand / logo ──
  "logos.png",
  "logoreview.png",
  // ── UI icons ──
  "icon1.png",
  "icon2.png",
  "iconcart.png",
  "iconlove.png",
  "iconprofile.png",
  "iconsearch.png",
  "heart.png",
  "heart1.png",
  "favorite11.png",
  "fast.png",
  "filter.png",
  "search.png",
  "hot.png",
  "stock.png",
  "foundation.png",
  "material.png",
  "nigeria.png",
  "Star1.png",
  "Rectangle.png",
  "email1.png",
  // ── Payment / social icons ──
  "pay.png",
  "bitcoin.png",
  "usdt.png",
  "call.png",
  "email.png",
  "whatsapp.png",
  "instagram.png",
  "facebook.png",
  "tiktok.png",
  "twitter.png",
  "snapchat.png",
  // ── SVGs ──
  "CheckCircle.svg",
  "Clock1.svg",
  "Package.svg",
  "Rectangle2.svg",
  "Truck.svg",
  "first.svg",
  "second.svg",
  "third.svg",
  "fouth.svg",
  "eemail.svg",
  "fullname.svg",
  "phonenumber.svg",
  "shield.svg",
  // ── Videos ──
  "video.mp4",
  "male_video.mp4",
];


// ─── Config ───────────────────────────────────────────────────────────────────
const CLOUD_FOLDER = "gems_ore"; // Cloudinary folder prefix
const uniqueAssets = [...new Set(ASSETS_TO_UPLOAD)];
const assetsDir = path.join(__dirname, "../public/assets");
const mapFile = path.join(__dirname, "cloudinary-map.json");

// Load any previously saved map so we skip re-uploads
let existingMap = {};
if (fs.existsSync(mapFile)) {
  try {
    existingMap = JSON.parse(fs.readFileSync(mapFile, "utf-8"));
  } catch {
    existingMap = {};
  }
}

// ─── Upload ───────────────────────────────────────────────────────────────────
async function uploadAll() {
  console.log(`\n🚀 Starting upload for ${uniqueAssets.length} assets to Cloudinary folder "${CLOUD_FOLDER}"...\n`);

  const resultMap = { ...existingMap };
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const filename of uniqueAssets) {
    if (resultMap[filename]) {
      console.log(`⏩ Skipping (already mapped): ${filename}`);
      skipCount++;
      continue;
    }

    const filePath = path.join(assetsDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found, skipping: ${filename}`);
      continue;
    }

    const ext = path.extname(filename).toLowerCase();
    const publicId = `${CLOUD_FOLDER}/${path.parse(filename).name}`;

    let resourceType = "auto";
    if (ext === ".svg") resourceType = "image";
    if ([".mp4", ".webm", ".mov"].includes(ext)) resourceType = "video";

    console.log(`⬆️  Uploading ${filename} (${resourceType})...`);

    try {
      const res = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        use_filename: true,
        unique_filename: false,
      });

      resultMap[filename] = res.secure_url;
      console.log(`✅ ${filename}: ${res.secure_url}`);
      successCount++;

      // Save incrementally so progress isn't lost on failure
      fs.writeFileSync(mapFile, JSON.stringify(resultMap, null, 2));
    } catch (err) {
      console.error(`❌ Failed ${filename}:`, err.message);
      failCount++;
    }
  }

  console.log(
    `\n🎉 Done! Success: ${successCount} | Skipped: ${skipCount} | Failed: ${failCount}`
  );
  console.log(`📁 Map saved to: ${mapFile}`);
}

uploadAll().catch(console.error);
