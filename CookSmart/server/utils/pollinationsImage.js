/**
 * Pollinations image helper (server-side).
 *
 * Why this exists: the anonymous Pollinations tier answers rate-limited
 * requests with HTTP 402 and a "Free limit reached" JPEG. Browsers happily
 * draw that body inside an <img>, so the tile shows up on recipe cards.
 *
 * Instead of saving a hotlink and letting every visitor's browser trigger
 * generation, the server requests the image itself, one job at a time,
 * retries while rate-limited, and only saves recipe.image once Pollinations
 * has really produced the picture. Until then recipe.image stays "" and the
 * frontend shows /placeholder-recipe.jpg.
 *
 * No new dependencies: uses Node's built-in fetch (Node 18+).
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildImageUrl = (recipeTitle) => {
  const prompt = recipeTitle ? `${recipeTitle} food` : "delicious food";
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
};

// One request. True only for a 2xx response whose body is an image.
// (The rate-limit tile arrives as 402 + image/jpeg, so res.ok is what rejects it.)
const requestOnce = async (url, timeoutMs) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    const type = res.headers.get("content-type") || "";
    await res.arrayBuffer().catch(() => {}); // drain so the socket is released
    return res.ok && type.startsWith("image/");
  } catch {
    return false;
  }
};

// Retry until the image is generated. Default spacing is just over the
// 45 s limit that Pollinations reports.
const waitForImage = async (
  url,
  { attempts = 6, delayMs = 50_000, timeoutMs = 90_000 } = {}
) => {
  for (let i = 1; i <= attempts; i++) {
    if (await requestOnce(url, timeoutMs)) return true;
    if (i < attempts) await sleep(delayMs);
  }
  return false;
};

// Strictly one image job at a time, so two new recipes never compete for
// the same rate-limit window. In-memory: a server restart drops pending
// jobs (scripts/warmImages.js recovers those).
let queue = Promise.resolve();

const queueImageJob = (recipeId, title) => {
  queue = queue
    .then(async () => {
      const url = buildImageUrl(title);
      const ok = await waitForImage(url);
      if (!ok) {
        console.warn("[Image] gave up for recipe", String(recipeId), "- run scripts/warmImages.js later");
        return;
      }
      const Recipe = require("../models/Recipe"); // lazy: keeps this file testable alone
      await Recipe.findByIdAndUpdate(recipeId, { image: url });
    })
    .catch((err) => console.error("[Image] job failed:", err?.message));
};

module.exports = { buildImageUrl, waitForImage, queueImageJob };
