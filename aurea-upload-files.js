/**
 * Aurea — Upload theme images to Shopify Files (GraphQL staged uploads)
 * Then update settings_data.json to wire images into sections.
 *
 * Usage: node aurea-upload-files.js
 */

const { readFileSync, writeFileSync, statSync } = require("fs");
const { resolve, basename } = require("path");

// Load .env
try {
  const envPath = resolve(__dirname, ".env");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.+)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
} catch {}

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_TOKEN;
const GQL = `https://${STORE}/admin/api/2024-01/graphql.json`;

if (!STORE || !TOKEN) {
  console.error("Missing SHOPIFY_STORE or SHOPIFY_TOKEN environment variables.");
  process.exit(1);
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function graphql(query, variables = {}) {
  await delay(500);
  const res = await fetch(GQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw { errors: json.errors };
  }
  return json.data;
}

/**
 * Upload a local file to Shopify Files via staged upload
 * Returns the file URL (shopify CDN url)
 */
async function uploadFile(localPath, altText) {
  const filename = basename(localPath);
  const fileSize = statSync(localPath).size.toString();
  const fileContent = readFileSync(localPath);

  // Step 1: Create staged upload target
  const stagedData = await graphql(`
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    input: [{
      resource: "FILE",
      filename: filename,
      mimeType: "image/png",
      fileSize: fileSize,
      httpMethod: "POST",
    }],
  });

  const target = stagedData.stagedUploadsCreate.stagedTargets[0];
  if (!target) {
    const errs = stagedData.stagedUploadsCreate.userErrors;
    throw new Error(`Staged upload failed: ${JSON.stringify(errs)}`);
  }

  // Step 2: Upload to staged URL (multipart form)
  const formData = new FormData();
  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }
  formData.append("file", new Blob([fileContent], { type: "image/png" }), filename);

  const uploadRes = await fetch(target.url, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok && uploadRes.status !== 201) {
    const text = await uploadRes.text();
    throw new Error(`Upload failed (${uploadRes.status}): ${text}`);
  }

  // Step 3: Create file record in Shopify
  await delay(500);
  const fileData = await graphql(`
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          alt
          ... on MediaImage {
            image {
              url
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    files: [{
      alt: altText,
      contentType: "IMAGE",
      originalSource: target.resourceUrl,
    }],
  });

  const errs = fileData.fileCreate.userErrors;
  if (errs && errs.length > 0) {
    throw new Error(`fileCreate error: ${JSON.stringify(errs)}`);
  }

  const fileId = fileData.fileCreate.files[0].id;
  console.log(`  ✓ Uploaded: ${filename} (${fileId})`);

  // Return the filename for shopify://shop_images/ reference
  return filename;
}

// Images to upload and where they go
const imageAssignments = [
  {
    file: "elizapawky_no_bright_colors_no_white_backgrounds_no_product_t_5c986b43-ced7-4aee-b12d-40a00fce956a_3.png",
    alt: "Woman experiencing Aurea fragrance in golden afternoon light",
    section: "aurea-hero",
    setting: "hero_image",
  },
  {
    file: "elizapawky_a_woman_perfumer_in_her_50s_silver-streaked_dark_h_7f4a4ab4-309e-4965-8d63-a2aaac1927bc_3.png",
    alt: "Élise Morand, founder and master perfumer, in her atelier",
    section: "aurea-story",
    setting: "story_image",
  },
];

async function main() {
  console.log("Uploading theme images to Shopify Files...\n");

  const uploaded = [];

  for (const img of imageAssignments) {
    const localPath = resolve(__dirname, "assets", img.file);
    try {
      const filename = await uploadFile(localPath, img.alt);
      uploaded.push({ ...img, shopifyRef: `shopify://shop_images/${filename}` });
    } catch (err) {
      console.error(`  ✗ Failed: ${img.file}`);
      console.error(err.message || err);
    }
  }

  // Update settings_data.json to wire images into sections
  if (uploaded.length > 0) {
    console.log("\nUpdating settings_data.json...");
    const settingsPath = resolve(__dirname, "config", "settings_data.json");
    const settings = JSON.parse(readFileSync(settingsPath, "utf8"));

    // Ensure sections exist at the current level
    if (!settings.current.sections) {
      settings.current.sections = {};
    }

    for (const img of uploaded) {
      if (!settings.current.sections[img.section]) {
        settings.current.sections[img.section] = { type: img.section, settings: {} };
      }
      if (!settings.current.sections[img.section].settings) {
        settings.current.sections[img.section].settings = {};
      }
      settings.current.sections[img.section].settings[img.setting] = img.shopifyRef;
      console.log(`  ✓ ${img.section}.${img.setting} → ${img.shopifyRef}`);
    }

    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
    console.log("  ✓ settings_data.json saved");
  }

  console.log("\n✓ Done — images are uploaded and wired into your theme");
  console.log("  Note: It may take a minute for Shopify to process the images.");
  console.log("  If images don't appear immediately, check Files in your Shopify admin.");
}

main();
