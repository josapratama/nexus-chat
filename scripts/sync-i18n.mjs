#!/usr/bin/env node
/**
 * 🌐 [Nexus Chat] Build-Time Translation Synchronizer
 * Downloads latest translations from Polyglot Hub (https://polyglot-hub.josapratama.com)
 * and generates clean JSON locale files with ZERO runtime latency.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_SLUG = process.argv[2] || "nexus-chat";
const TARGET_DIR = path.resolve(process.cwd(), process.argv[3] || "src/locales");
const POLYGLOT_URL = (process.argv[4] || process.env.POLYGLOT_HUB_URL || "https://polyglot-hub.josapratama.com").replace(/\/+$/, "");

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}

async function syncTranslations() {
  console.log("\n======================================================");
  console.log("🌐 [Polyglot Hub] Build-Time Translation Sync");
  console.log("======================================================");
  console.log(`📦 Project     : "${PROJECT_SLUG}"`);
  console.log(`📡 Server URL  : ${POLYGLOT_URL}`);
  console.log(`📁 Target Dir  : ${TARGET_DIR}`);

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const languages = [
    { code: "id", name: "Bahasa Indonesia" },
    { code: "en", name: "English" },
    { code: "ja", name: "Japanese" },
  ];

  let successCount = 0;

  for (const lang of languages) {
    const nestedUrl = `${POLYGLOT_URL}/api/v1/export/${PROJECT_SLUG}/${lang.code}?common=true&format=nested`;

    try {
      const res = await fetchWithRetry(nestedUrl);
      if (!res.ok) {
        console.error(`  ❌ Failed to fetch ${lang.code}: HTTP ${res.status}`);
        continue;
      }

      const dict = await res.json();
      const filePath = path.join(TARGET_DIR, `${lang.code}.json`);
      fs.writeFileSync(filePath, JSON.stringify(dict, null, 2), "utf-8");

      const keyCount = Object.keys(dict).length;
      console.log(`  ✓ Synced ${lang.code}.json (${keyCount} namespaces)`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Error syncing ${lang.code}:`, err.message);
    }
  }

  console.log(`\n✨ Successfully synced ${successCount} languages! Zero runtime lag.`);
  console.log("======================================================\n");
}

syncTranslations().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
