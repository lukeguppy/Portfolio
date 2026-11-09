# Builds the site and runs the local development server with live reload.
# Usage: .\dev.ps1 [-PreviewOnly]

param(
    [switch]$PreviewOnly
)

$ErrorActionPreference = "Stop"

if ($PreviewOnly) {
    Write-Host "Building production output to ./docs..." -ForegroundColor Cyan
    npm run build
    node tools/preview.mjs --open
} else {
    Write-Host "Starting Eleventy + esbuild live-reload dev server at http://localhost:8080/Portfolio/ ..." -ForegroundColor Cyan
    npm run dev
}
