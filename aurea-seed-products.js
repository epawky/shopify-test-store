/**
 * Aurea — Seed Products & Collection
 * Usage: node aurea-seed-products.js
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

async function shopify(endpoint, body) {
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
  if (!res.ok) {
    throw { status: res.status, body: json };
  }
  return json;
}

// --------------- Product Definitions ---------------

const products = [
  {
    product: {
      title: "Vetiver No. 4",
      handle: "vetiver-no-4",
      product_type: "Eau de Parfum",
      vendor: "Aurea",
      status: "active",
      body_html:
        '<p>A grounding, slow-burning composition built around rare Haitian vetiver — harvested by hand at 18 months, steam-distilled on-site in the Artibonite Valley.</p><p>Vetiver No. 4 opens with cold smoke and damp earth, evolves through a heart of aged cedarwood and black pepper, and settles into a dry leather base that lasts well into the following day. Complex, unhurried, and unmistakably present.</p><p><strong>Scent notes:</strong> Haitian vetiver, smoked cedar, black pepper, dark amber, worn leather, cold stone</p><p><strong>Concentration:</strong> Eau de Parfum, 18%</p><p><strong>Longevity:</strong> 10–14 hours<br><strong>Projection:</strong> Close to moderate — intimate, not announcing</p>',
      tags: "woody, earthy, smoky, bestseller, vetiver, masculine-leaning, unisex",
      options: [{ name: "Size", values: ["50ml", "100ml", "200ml"] }],
      variants: [
        { option1: "50ml", price: "148.00", sku: "AUR-VET4-50", inventory_quantity: 24, requires_shipping: true, taxable: true, weight: 0.3, weight_unit: "kg" },
        { option1: "100ml", price: "196.00", sku: "AUR-VET4-100", inventory_quantity: 18, requires_shipping: true, taxable: true, weight: 0.45, weight_unit: "kg" },
        { option1: "200ml", price: "264.00", sku: "AUR-VET4-200", inventory_quantity: 8, requires_shipping: true, taxable: true, weight: 0.65, weight_unit: "kg" },
      ],
    },
    metafields: [
      { namespace: "aurea", key: "scent_notes", value: "Haitian vetiver · Smoked cedar · Black pepper · Dark amber · Cold stone", type: "single_line_text_field" },
      { namespace: "aurea", key: "family", value: "Woody · Earthy", type: "single_line_text_field" },
      { namespace: "aurea", key: "concentration", value: "Eau de Parfum — 18%", type: "single_line_text_field" },
      { namespace: "aurea", key: "origin_story", value: "Artibonite Valley, Haiti · Harvested at 18 months", type: "single_line_text_field" },
    ],
  },
  {
    product: {
      title: "Moss & Cedar",
      handle: "moss-cedar",
      product_type: "Eau de Parfum",
      vendor: "Aurea",
      status: "active",
      body_html:
        '<p>The smell of a forest after rain — captured precisely enough to be worn. Moss & Cedar was three years in development, each iteration chasing the impossible specificity of wet bark, crushed green leaf, and cold morning air.</p><p>It opens bright and slightly sharp — green fig and crushed stem — before the Atlas cedar comes forward, warm and dry, like a pencil sharpened in a quiet room. The base is white musk and oakmoss absolute, faintly animalic, deeply clean.</p><p><strong>Scent notes:</strong> Rain-soaked moss, Atlas cedar, green fig leaf, crushed stem, oakmoss absolute, white musk</p><p><strong>Concentration:</strong> Eau de Parfum, 16%</p><p><strong>Longevity:</strong> 8–12 hours<br><strong>Projection:</strong> Moderate — noticeable without announcing</p>',
      tags: "green, aquatic, cedar, woody, unisex, fresh, nature",
      options: [{ name: "Size", values: ["50ml", "100ml", "200ml"] }],
      variants: [
        { option1: "50ml", price: "96.00", sku: "AUR-MC-50", inventory_quantity: 32, requires_shipping: true, taxable: true, weight: 0.3, weight_unit: "kg" },
        { option1: "100ml", price: "138.00", sku: "AUR-MC-100", inventory_quantity: 22, requires_shipping: true, taxable: true, weight: 0.45, weight_unit: "kg" },
        { option1: "200ml", price: "188.00", sku: "AUR-MC-200", inventory_quantity: 12, requires_shipping: true, taxable: true, weight: 0.65, weight_unit: "kg" },
      ],
    },
    metafields: [
      { namespace: "aurea", key: "scent_notes", value: "Rain-soaked moss · Atlas cedar · Green fig leaf · Oakmoss absolute · White musk", type: "single_line_text_field" },
      { namespace: "aurea", key: "family", value: "Green · Aquatic", type: "single_line_text_field" },
      { namespace: "aurea", key: "concentration", value: "Eau de Parfum — 16%", type: "single_line_text_field" },
      { namespace: "aurea", key: "origin_story", value: "Azrou Forest, Morocco · Sustainably managed Cedrus atlantica", type: "single_line_text_field" },
    ],
  },
  {
    product: {
      title: "The Gold Set",
      handle: "the-gold-set",
      product_type: "Extrait de Parfum",
      vendor: "Aurea",
      status: "active",
      body_html:
        '<p>Our most ambitious composition. Three years of development, eleven revisions, and a cost per bottle that made our accountant uncomfortable. The Gold Set is not for every occasion. It is for the occasions you will remember.</p><p>It opens with wild Omani frankincense — resinous, milky, sacred. The heart reveals aged oud from Bangladesh, smooth and animalic without aggression. Tasmanian boronia, one of the rarest and most expensive naturals in perfumery, adds an impossible floral-fruit note that sits above everything like light. The base — vanilla absolute, benzoin, warm skin — lasts 18 hours minimum.</p><p><strong>Scent notes:</strong> Omani frankincense, aged oud, Tasmanian boronia, vanilla absolute, benzoin, warm skin</p><p><strong>Concentration:</strong> Extrait de Parfum, 40%</p><p><strong>Longevity:</strong> 16–24 hours<br><strong>Projection:</strong> Intimate — a fragrance discovered by those who come close</p><p><em>Limited production. Once this batch sells through, the next will not be available until the following harvest season.</em></p>',
      tags: "amber, resinous, oud, frankincense, limited, extrait, unisex, luxury, boronia",
      options: [{ name: "Size", values: ["50ml", "100ml"] }],
      variants: [
        { option1: "50ml", price: "210.00", sku: "AUR-GS-50", inventory_quantity: 12, requires_shipping: true, taxable: true, weight: 0.35, weight_unit: "kg" },
        { option1: "100ml", price: "320.00", sku: "AUR-GS-100", inventory_quantity: 6, requires_shipping: true, taxable: true, weight: 0.5, weight_unit: "kg" },
      ],
    },
    metafields: [
      { namespace: "aurea", key: "scent_notes", value: "Omani frankincense · Aged oud · Tasmanian boronia · Vanilla absolute · Benzoin", type: "single_line_text_field" },
      { namespace: "aurea", key: "family", value: "Amber · Resinous", type: "single_line_text_field" },
      { namespace: "aurea", key: "concentration", value: "Extrait de Parfum — 40%", type: "single_line_text_field" },
      { namespace: "aurea", key: "origin_story", value: "Dhofar Region, Oman · Huon Valley, Tasmania · Wild-harvested", type: "single_line_text_field" },
      { namespace: "aurea", key: "limited_edition", value: "true", type: "single_line_text_field" },
    ],
  },
];

// --------------- Main ---------------

async function main() {
  const productIds = [];

  for (const { product, metafields } of products) {
    try {
      const data = await shopify("/products.json", { product });
      const id = data.product.id;
      productIds.push(id);
      console.log(`✓ Created: ${product.title}  (ID: ${id})`);

      // Add metafields one by one
      for (const mf of metafields) {
        await shopify(`/products/${id}/metafields.json`, { metafield: mf });
      }
    } catch (err) {
      console.error(`✗ Failed to create: ${product.title}`);
      console.error(err.body ? JSON.stringify(err.body, null, 2) : err);
    }
  }

  // Create collection
  if (productIds.length > 0) {
    try {
      const collectionData = await shopify("/custom_collections.json", {
        custom_collection: {
          title: "The Collection",
          handle: "all",
          body_html: "<p>Every Aurea fragrance is composed slowly, from rare things, for people who notice.</p>",
          sort_order: "manual",
          collects: productIds.map((id) => ({ product_id: id })),
        },
      });
      console.log(`✓ Collection created and products added (ID: ${collectionData.custom_collection.id})`);
    } catch (err) {
      console.error("✗ Failed to create collection");
      console.error(err.body ? JSON.stringify(err.body, null, 2) : err);
    }
  }

  console.log("✓ Done — visit your store to confirm");
}

main();
