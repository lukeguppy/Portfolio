const { buildAssets } = require("./build/assets");

module.exports = function (eleventyConfig) {
    // Static files copied as-is. Legacy css/js still serve the game sub-pages.
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("dissertation.pdf");
    eleventyConfig.addPassthroughCopy({
        "src/playground/blockblast": "playground/blockblast",
        "src/playground/chess": "playground/chess",
        "src/playground/mapplotter": "playground/mapplotter",
        "src/playground/wordle": "playground/wordle",
        "src/playground/countries-quiz/assets": "playground/countries-quiz/assets",
        "src/playground/countries-quiz/index.html": "playground/countries-quiz/index.html",
        "src/playground/countries-quiz/style.css": "playground/countries-quiz/style.css",
        "src/playground/countries-quiz/world.geojson": "playground/countries-quiz/world.geojson",
    });

    // Self-hosted fonts (no runtime request to Google).
    eleventyConfig.addPassthroughCopy({
        "node_modules/@fontsource-variable/overpass/files/overpass-latin-wght-normal.woff2": "assets/fonts/overpass-latin-wght-normal.woff2",
        "node_modules/@fontsource-variable/literata/files/literata-latin-wght-normal.woff2": "assets/fonts/literata-latin-wght-normal.woff2",
        "node_modules/@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2": "assets/fonts/bebas-neue-latin-400-normal.woff2",
        "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2": "assets/fonts/jetbrains-mono-latin-wght-normal.woff2"
    });

    // Bundle modular CSS/JS after each Eleventy build (also runs under --serve).
    eleventyConfig.addWatchTarget("src/styles/");
    eleventyConfig.addWatchTarget("src/scripts/");
    eleventyConfig.on("eleventy.after", () => buildAssets());

    return {
        pathPrefix: "/Portfolio/",
        dir: {
            input: "src",
            output: "docs"
        },
        templateFormats: ["njk", "md"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk"
    };
};