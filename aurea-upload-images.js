/**
 * Aurea — Upload Product Images via Shopify Admin API
 * Usage: node aurea-upload-images.js
 * Reads SHOPIFY_STORE and SHOPIFY_TOKEN from .env
 */

const { readFileSync } = require("fs");
const { resolve } = require("path");

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
const API_VERSION = "2024-01";
const BASE = `https://${STORE}/admin/api/${API_VERSION}`;

if (!STORE || !TOKEN) {
  console.error("Missing SHOPIFY_STORE or SHOPIFY_TOKEN environment variables.");
  process.exit(1);
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function shopifyGet(endpoint) {
  await delay(500);
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { "X-Shopify-Access-Token": TOKEN },
  });
  return res.json();
}

async function shopifyPost(endpoint, body) {
  await delay(500);
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw { status: res.status, body: json };
  return json;
}

function loadImage(filename) {
  const filepath = resolve(__dirname, "assets", filename);
  return readFileSync(filepath).toString("base64");
}

// Image assignments per product
const productImages = {
  "Vetiver No. 4": [
    {
      filename: "elizapawky_minimalist_luxury_perfume_bottle_dark_smoked_glass_d03247ef-fe45-4746-97c3-2ad1eb1e2e6a_2.png",
      alt: "Vetiver No. 4 — dark smoked glass bottle with gold accents",
      position: 1,
    },
    {
      filename: "elizapawky_aerial_close-up_of_vetiver_grass_roots_being_hand-_698c8b00-dc85-4d3c-a220-1d421de91fb1_1.png",
      alt: "Hand-harvested vetiver roots from the Artibonite Valley, Haiti",
      position: 2,
    },
  ],
  "Moss & Cedar": [
    {
      filename: "elizapawky_luxury_perfume_bottle_deep_charcoal_glass_with_sag_5794f23b-83f3-4b3e-bf3b-e985f68b45a7_2.png",
      alt: "Moss & Cedar — charcoal glass bottle resting on rain-soaked moss",
      position: 1,
    },
    {
      filename: "elizapawky_luxury_perfume_bottle_dark_forest_green_glass_gold_51f7f46b-ff35-4a94-847b-2dec2098f6d3_1.png",
      alt: "Moss & Cedar — forest green glass bottle with gold cap",
      position: 2,
    },
    {
      filename: "elizapawky_ancient_Atlas_cedar_forest_in_Morocco_at_golden_ho_4337779c-80ee-430e-93b8-3393c8064705_0.png",
      alt: "Ancient Atlas cedar forest in Morocco at golden hour",
      position: 3,
    },
  ],
  "The Gold Set": [
    {
      filename: "elizapawky_opulent_luxury_perfume_bottle_rounded_dark_amber_g_98019fa4-18c4-4253-b90a-8a2b8728310c_3.png",
      alt: "The Gold Set — ornate dark amber bottle with gold filigree",
      position: 1,
    },
    {
      filename: "elizapawky_chunks_of_golden_Omani_frankincense_resin_on_a_pie_7ef422e4-ca87-4c68-b6b3-72a606571cc8_1.png",
      alt: "Golden Omani frankincense resin — a key ingredient in The Gold Set",
      position: 2,
    },
  ],
};

async function main() {
  // Fetch all products to find IDs by title
  const { products } = await shopifyGet("/products.json?vendor=Aurea&limit=50");

  if (!products || products.length === 0) {
    console.error("No Aurea products found. Run aurea-seed-products.js first.");
    process.exit(1);
  }

  const productMap = {};
  for (const p of products) {
    productMap[p.title] = p.id;
  }

  for (const [title, images] of Object.entries(productImages)) {
    const productId = productMap[title];
    if (!productId) {
      console.error(`✗ Product not found: ${title}`);
      continue;
    }

    for (const img of images) {
      try {
        const attachment = loadImage(img.filename);
        await shopifyPost(`/products/${productId}/images.json`, {
          image: {
            attachment,
            filename: img.filename,
            alt: img.alt,
            position: img.position,
          },
        });
        console.log(`✓ ${title} — uploaded image ${img.position}: ${img.alt}`);
      } catch (err) {
        console.error(`✗ ${title} — failed image ${img.position}`);
        console.error(err.body ? JSON.stringify(err.body, null, 2) : err);
      }
    }
  }

  console.log("\n✓ Done — check your products in Shopify admin");
}

main();
