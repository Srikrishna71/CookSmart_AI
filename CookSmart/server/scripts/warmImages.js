/**
 * One-off repair: run with   node scripts/warmImages.js
 *
 * Finds AI-generated recipes whose image is empty or is a Pollinations
 * hotlink, asks Pollinations to really generate each one (one at a time,
 * retrying while rate-limited), then saves the URL on the recipe.
 *
 * If an image still cannot be generated, image is set to "" so the card
 * shows the placeholder instead of the "Free limit reached" tile. Re-run
 * the script later to retry those.
 *
 * Use your PRODUCTION Mongo URI if that is where the broken recipes live:
 *   MONGO_URI="mongodb+srv://..." node scripts/warmImages.js
 */
const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const { buildImageUrl, waitForImage } = require("../utils/pollinationsImage");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const recipes = await Recipe.find({
    isAIGenerated: true,
    $or: [
      { image: "" },
      { image: { $exists: false } },
      { image: /image\.pollinations\.ai/ },
    ],
  }).select("title image");

  console.log(`Found ${recipes.length} recipe(s) to check\n`);

  let fixed = 0;
  let pending = 0;

  for (const [i, recipe] of recipes.entries()) {
    const url = buildImageUrl(recipe.title);
    process.stdout.write(`[${i + 1}/${recipes.length}] ${recipe.title} ... `);

    const ok = await waitForImage(url, { attempts: 8, delayMs: 50_000 });
    if (ok) {
      await Recipe.updateOne({ _id: recipe._id }, { image: url });
      fixed++;
      console.log("ready");
    } else {
      await Recipe.updateOne({ _id: recipe._id }, { image: "" });
      pending++;
      console.log("still rate-limited -> placeholder (re-run later)");
    }
  }

  console.log(`\nDone. ${fixed} ready, ${pending} on placeholder.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ warmImages failed:", err.message);
  process.exit(1);
});
