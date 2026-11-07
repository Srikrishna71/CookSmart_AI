/**
 * Pollinations image helper (server-side).
 *
 * Why this exists: the anonymous Pollinations tier answers rate-limited
 * requests with HTTP 402 and a "Free limit reached" JPEG. Browsers happily
 * draw that body inside an <img>, so the tile shows up on recipe cards.
 *
 * Instead of saving a hotlink and letting every visitor's browser trigger
 * generation, the server requests the image itself and only saves
 * recipe.image once Pollinations has really produced the picture:
 *
 *   1. resolveImage()   - one inline attempt before the API responds, so the
 *                         image is usually ready the moment the recipe appears.
 *   2. queueImageJob()  - if that attempt fails (rate limit / slow), retry in
 *                         the background, one job at a time. Until it succeeds
 *                         recipe.image is "" and the frontend shows the placeholder.
 *
 * No new dependencies: uses Node's built-in fetch (Node 18+).
 */

if (typeof fetch !== "function") {
  console.error("[Image] global fetch is missing - Node 18+ is required. Images will NOT be generated.");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildImageUrl = (recipeTitle) => {
  const prompt = recipeTitle ? `${recipeTitle} food` : "delicious food";
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
};

// One request. ok:true only for a 2xx response whose body is an image.
// (The rate-limit tile arrives as 402 + image/jpeg, so res.ok is what rejects it.)
const requestOnce = async (url, timeoutMs) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    const type = res.headers.get("content-type") || "";
    await res.arrayBuffer().catch(() => {}); // drain so the socket is released
    if (res.ok && type.startsWith("image/")) return { ok: true };
    return { ok: false, reason: `HTTP ${res.status} (${type || "no content-type"})` };
  } catch (err) {
    return {
      ok: false,
      reason: err?.name === "TimeoutError" ? "timed out" : err?.message || String(err),
    };
  }
};

// Retry until the image is generated. Default spacing is just over the
// 45 s limit that Pollinations reports. Logs WHY each attempt failed so the
// Render logs show whether it is rate-limiting, timeouts, or something else.
const waitForImage = async (
  url,
  { attempts = 6, delayMs = 50_000, timeoutMs = 90_000 } = {}
) => {
  for (let i = 1; i <= attempts; i++) {
    const result = await requestOnce(url, timeoutMs);
    if (result.ok) return true;
    console.warn(`[Image] attempt ${i}/${attempts} failed: ${result.reason}`);
    if (i < attempts) await sleep(delayMs);
  }
  return false;
};

// Inline, single attempt (capped at 25 s). Returns the URL when the image is
// ready, or "" so the caller can save the recipe and queue background retries.
const resolveImage = async (title) => {
  const url = buildImageUrl(title);
  const ok = await waitForImage(url, { attempts: 1, timeoutMs: 25_000 });
  return ok ? url : "";
};

// Strictly one background job at a time, so two new recipes never compete for
// the same rate-limit window. In-memory: a server restart drops pending jobs
// (scripts/warmImages.js recovers those).
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

module.exports = { buildImageUrl, waitForImage, resolveImage, queueImageJob };
