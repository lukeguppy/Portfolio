/**
 * Interactive PDF.js viewer controller for `#pdf-container` on the Dissertation page.
 * Supports zoom controls and internal/external PDF link annotations, with a native iframe fallback.
 */
const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs';
const PDFJS_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

export function initPdfViewer(container) {
  if (!container) return;

  let zoomLevel = 1.0;
  let pdfDoc = null;
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomDisplay = document.getElementById('zoom-value');

  async function renderPage(pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-page-wrapper';
    container.appendChild(wrapper);

    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page-canvas';
    wrapper.appendChild(canvas);

    const annotationLayerDiv = document.createElement('div');
    annotationLayerDiv.className = 'annotationLayer';
    wrapper.appendChild(annotationLayerDiv);

    const viewportPadding = 40;
    const containerWidth = Math.max(300, container.clientWidth - viewportPadding);
    const standardWidth = Math.min(containerWidth, 800);
    const targetWidth = standardWidth * zoomLevel;

    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });
    const outputScale = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    wrapper.style.width = `${Math.floor(viewport.width)}px`;
    wrapper.style.height = `${Math.floor(viewport.height)}px`;

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
      transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
    }).promise;

    const annotations = await page.getAnnotations();
    annotations.forEach((annotation) => {
      if (annotation.subtype === 'Link' && (annotation.url || annotation.dest)) {
        const link = document.createElement('a');
        const rect = viewport.convertToViewportRectangle(annotation.rect);
        link.style.left = `${rect[0]}px`;
        link.style.top = `${rect[1]}px`;
        link.style.width = `${rect[2] - rect[0]}px`;
        link.style.height = `${rect[3] - rect[1]}px`;

        if (annotation.url) {
          link.href = annotation.url;
          link.target = '_blank';
          link.rel = 'noopener';
        } else if (annotation.dest) {
          link.href = '#';
          link.addEventListener('click', async (e) => {
            e.preventDefault();
            let dest = annotation.dest;
            if (typeof dest === 'string') dest = await pdfDoc.getDestination(dest);
            if (dest) {
              const pageIndex = await pdfDoc.getPageIndex(dest[0]);
              const targetWrapper = container.querySelectorAll('.pdf-page-wrapper')[pageIndex];
              if (targetWrapper) targetWrapper.scrollIntoView({ behavior: 'smooth' });
            }
          });
        }
        annotationLayerDiv.appendChild(link);
      }
    });
  }

  async function renderAllPages() {
    container.querySelectorAll('.pdf-page-wrapper').forEach((p) => p.remove());
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      await renderPage(pageNum);
    }
  }

  function changeZoom(delta) {
    const next = Math.round((zoomLevel + delta) * 10) / 10;
    if (next >= 0.6 && next <= 2.6 && pdfDoc) {
      zoomLevel = next;
      if (zoomDisplay) zoomDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
      renderAllPages();
    }
  }

  async function init() {
    const basePath = container.dataset.baseUrl || '/';
    const pdfPath = `${basePath}dissertation.pdf`;
    try {
      const pdfjsLib = await import(/* @vite-ignore */ PDFJS_URL);
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      pdfDoc = await pdfjsLib.getDocument(pdfPath).promise;

      const loader = container.querySelector('.pdf-loading');
      if (loader) loader.remove();

      if (zoomInBtn) zoomInBtn.addEventListener('click', () => changeZoom(0.2));
      if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => changeZoom(-0.2));

      await renderAllPages();
    } catch {
      const loader = container.querySelector('.pdf-loading');
      if (loader) loader.remove();
      const iframe = document.createElement('iframe');
      iframe.src = pdfPath;
      iframe.title = 'Dissertation PDF';
      iframe.style.cssText = 'width:100%;height:100%;border:0;flex:1;';
      container.appendChild(iframe);
    }
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          init();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(container);
  } else {
    init();
  }
}
