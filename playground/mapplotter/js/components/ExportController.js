/**
 * ExportController - Handles map export to PNG with optional legend
 * Extracted from app.js for separation of concerns
 */
class ExportController {
    constructor(app) {
        this.app = app;
    }

    /**
     * Export the current map view as a PNG image
     */
    async exportMapAsImage() {
        const btn = document.getElementById('export-image-btn');
        const originalHTML = btn.innerHTML;

        try {
            btn.innerHTML = '<span class="action-label" style="font-size: 10px;">Capturing</span>';
            btn.disabled = true;

            // Get the map container
            const mapElement = document.getElementById('map');

            // Temporarily hide user interface elements on the map (like radius circle)
            const wasRadiusVisible = this.app.mapManager.radiusCircle && this.app.mapManager.radiusVisible;
            if (wasRadiusVisible) {
                this.app.mapManager.radiusCircle.remove();
            }

            // Use html2canvas to capture
            const canvas = await html2canvas(mapElement, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#0a0a0a',
                scale: 2
            });

            // Convert to data URL for preview
            const dataUrl = canvas.toDataURL('image/png');

            // Show export modal with preview
            this.showExportModal(dataUrl, canvas);

        } catch (error) {
            console.error('Export failed:', error);
            this.app.ui.showNotification('Failed to capture map', 'error');
        } finally {
            // Restore radius circle if it was visible
            if (this.app.mapManager.radiusVisible && this.app.mapManager.radiusCircle) {
                this.app.mapManager.radiusCircle.addTo(this.app.mapManager.map);
            }

            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }

    /**
     * Helper to generate the final canvas with optional legend
     */
    async generateMapWithLegend(originalCanvas, includeLegend) {
        if (!includeLegend) {
            return originalCanvas;
        }

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = originalCanvas.width;
        finalCanvas.height = originalCanvas.height;
        const ctx = finalCanvas.getContext('2d');

        // Draw Map
        ctx.drawImage(originalCanvas, 0, 0);

        // --- Legend Configuration ---
        const padding = 20;
        const margin = 20;
        const itemGap = 12;
        const fontSize = 16;
        const lineHeight = 20;
        const swatchSize = 12;
        const textLeftOffset = 30;
        const maxTextWidth = 160;

        // Font Setup
        ctx.font = `${fontSize}px Inter, sans-serif`;

        // Gather Visible Items
        const items = [];
        this.app.categories.forEach(cat => {
            if (cat.visible) items.push({ color: cat.color, name: cat.name });
        });
        this.app.customPins.forEach(pin => {
            items.push({ color: pin.color, name: pin.name });
        });

        if (items.length === 0) return finalCanvas;

        // Helper to wrap text with hyphenation
        const getLines = (text, maxWidth) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = words[0];

            const processWord = (word) => {
                if (ctx.measureText(word).width <= maxWidth) return [word];

                const chunks = [];
                let remaining = word;
                while (ctx.measureText(remaining).width > maxWidth) {
                    let splitIndex = remaining.length - 1;
                    while (splitIndex > 0 && ctx.measureText(remaining.substring(0, splitIndex) + '-').width > maxWidth) {
                        splitIndex--;
                    }
                    if (splitIndex === 0) splitIndex = 1;
                    chunks.push(remaining.substring(0, splitIndex) + '-');
                    remaining = remaining.substring(splitIndex);
                }
                chunks.push(remaining);
                return chunks;
            };

            if (ctx.measureText(currentLine).width > maxWidth) {
                const chunks = processWord(currentLine);
                lines.push(...chunks.slice(0, -1));
                currentLine = chunks[chunks.length - 1];
            }

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = ctx.measureText(currentLine + " " + word).width;

                if (width < maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;

                    if (ctx.measureText(currentLine).width > maxWidth) {
                        const chunks = processWord(currentLine);
                        lines.push(...chunks.slice(0, -1));
                        currentLine = chunks[chunks.length - 1];
                    }
                }
            }
            lines.push(currentLine);
            return lines;
        };

        // Calculate Box Height & Width
        let currentY = padding;
        let finalBoxWidth = 0;

        items.forEach(item => {
            item.lines = getLines(item.name, maxTextWidth);
            const itemHeight = Math.max(item.lines.length * lineHeight, swatchSize * 2);
            item.height = itemHeight;
            currentY += itemHeight + itemGap;

            item.lines.forEach(line => {
                const w = ctx.measureText(line).width + textLeftOffset + padding * 2;
                if (w > finalBoxWidth) finalBoxWidth = w;
            });
        });

        const boxHeight = currentY - itemGap + padding;
        const boxWidth = Math.max(finalBoxWidth, 160);

        // --- Draw Legend Box ---
        const boxX = finalCanvas.width - boxWidth - margin;
        const boxY = margin;

        ctx.fillStyle = 'rgba(26, 26, 26, 0.85)';

        // Rounded Rect
        const r = 12;
        ctx.beginPath();
        ctx.moveTo(boxX + r, boxY);
        ctx.lineTo(boxX + boxWidth - r, boxY);
        ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + r);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight - r);
        ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - r, boxY + boxHeight);
        ctx.lineTo(boxX + r, boxY + boxHeight);
        ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - r);
        ctx.lineTo(boxX, boxY + r);
        ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // --- Draw Items ---
        let drawY = boxY + padding;

        items.forEach(item => {
            const swatchCenterY = drawY + (fontSize / 2) + 2;

            // Draw Swatch
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(boxX + padding + (swatchSize / 2), swatchCenterY, swatchSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw Text Lines
            ctx.fillStyle = '#ffffff';
            ctx.font = `${fontSize}px Inter, sans-serif`;

            item.lines.forEach((line, i) => {
                ctx.fillText(line, boxX + padding + textLeftOffset, drawY + fontSize + (i * lineHeight));
            });

            drawY += item.height + itemGap;
        });

        return finalCanvas;
    }

    showExportModal(dataUrl, canvas) {
        const exportHTML = `
            <div class="export-preview-container">
                <img src="${dataUrl}" alt="Map Preview" class="export-preview-image" id="export-preview-img">
            </div>

            <div class="export-filename-group" style="margin-top: 20px;">
                <label>Filename</label>
                <div style="flex: 1; position: relative;">
                    <input type="text" id="export-filename" placeholder="Enter file name..." style="width: 100%; box-sizing: border-box; padding-right: 50px;">
                    <span class="filename-extension" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;">.png</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 8px; border-left: 1px solid var(--border-color); padding-left: 16px; margin-left: 4px;">
                    <label style="margin: 0; font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer;" for="include-legend-checkbox">Legend</label>
                    <label class="switch" style="transform: scale(0.9); margin: 0;">
                        <input type="checkbox" id="include-legend-checkbox" checked>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div class="export-actions">
                <button id="cancel-export-btn" class="btn btn-secondary">Cancel</button>
                <button id="download-export-btn" class="btn btn-primary">Download</button>
            </div>
        `;

        const { overlay, close } = ModalHelper.create({
            title: 'Export as Image',
            content: exportHTML,
            width: '700px'
        });

        const previewImg = overlay.querySelector('#export-preview-img');
        const checkbox = overlay.querySelector('#include-legend-checkbox');

        // Initial preview update if default Checked
        if (checkbox.checked) {
            this.generateMapWithLegend(canvas, true).then(newCanvas => {
                previewImg.src = newCanvas.toDataURL('image/png');
            });
        }

        // Handle Live Preview Update
        checkbox.addEventListener('change', async (e) => {
            const includeLegend = e.target.checked;
            const newCanvas = await this.generateMapWithLegend(canvas, includeLegend);
            previewImg.src = newCanvas.toDataURL('image/png');
        });

        // Handle cancel
        overlay.querySelector('#cancel-export-btn').addEventListener('click', () => close());

        const inputField = overlay.querySelector('#export-filename');
        const downloadBtn = overlay.querySelector('#download-export-btn');

        // Initial state: disabled (force input)
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = '0.5';
        downloadBtn.style.cursor = 'default';

        // Validate on input
        inputField.addEventListener('input', (e) => {
            const isValid = e.target.value.trim().length > 0;
            downloadBtn.disabled = !isValid;
            downloadBtn.style.opacity = isValid ? '1' : '0.5';
            downloadBtn.style.cursor = isValid ? 'pointer' : 'default';
        });

        // Handle download
        downloadBtn.addEventListener('click', async () => {
            const filename = inputField.value.trim();
            if (!filename) return; // Should be blocked by disabled state, but extra safety

            // Show loading state
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = 'Saving...';
            downloadBtn.disabled = true;

            const includeLegend = checkbox.checked;
            const finalCanvas = await this.generateMapWithLegend(canvas, includeLegend);

            finalCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `${filename}.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);

                close();
                this.app.ui.showNotification(
                    includeLegend ? 'Map exported with legend' : 'Map exported successfully',
                    'success'
                );
            }, 'image/png');
        });
    }
}

// Export for Node.js/Jest testing (won't affect browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportController;
}
