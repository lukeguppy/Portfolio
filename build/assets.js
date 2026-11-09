// Bundles src/styles and src/scripts into docs/assets.
// Each entry file becomes one output file, so pages only load what they use:
//   styles/main.css         shared on every page (tokens, base, layout, components)
//   styles/pages/<name>.css page-specific rules
//   scripts/main.js         shared on every page
//   scripts/pages/<name>.js page-specific behaviour
const path = require('node:path');
const fs = require('node:fs');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');

function entries(dir, ext) {
  const abs = path.join(src, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter((f) => f.endsWith(ext))
    .map((f) => path.join(abs, f));
}

async function buildAssets({ minify = true } = {}) {
  const common = {
    absWorkingDir: root,
    outdir: path.join(root, 'docs/assets'),
    outbase: src,
    bundle: true,
    minify,
    logLevel: 'warning',
  };

  await esbuild.build({
    ...common,
    entryPoints: [
      path.join(src, 'styles/main.css'),
      ...entries('styles/pages', '.css'),
    ],
    // Fonts are copied by Eleventy; keep the url() references as written.
    external: ['*.woff2'],
  });

  await esbuild.build({
    ...common,
    entryPoints: [
      path.join(src, 'scripts/main.js'),
      ...entries('scripts/pages', '.js'),
    ],
    format: 'esm',
    target: 'es2020',
  });
}

module.exports = { buildAssets };
