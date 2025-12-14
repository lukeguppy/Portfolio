module.exports = function (eleventyConfig) {
    // Passthrough copy for static assets
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/playground");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("dissertation.pdf");

    // Add Prism.js for code highlighting
    eleventyConfig.addPassthroughCopy({
        "node_modules/prismjs/themes/prism-tomorrow.css": "css/prism.css",
        "node_modules/prismjs/prism.js": "js/prism.js"
    });

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