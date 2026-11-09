/**
 * Contact page:
 * 1. One-click clipboard copy for `lukewguppy@gmail.com`
 * 2. Subtle ambient background on `#contact-canvas`
 */
const copyBtn = document.querySelector('[data-copy-email]');
const toast = document.getElementById('contact-toast');
let toastTimer = null;

if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.getAttribute('data-copy-email') || 'lukewguppy@gmail.com';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      const temp = document.createElement('textarea');
      temp.value = email;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }

    copyBtn.classList.add('is-copied');

    if (toast) {
      if (toastTimer) clearTimeout(toastTimer);
      toast.classList.add('is-visible');
      toast.setAttribute('aria-hidden', 'false');

      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
        toast.setAttribute('aria-hidden', 'true');
        copyBtn.classList.remove('is-copied');
        toastTimer = null;
      }, 3000);
    }
  });
}

const canvas = document.getElementById('contact-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      20,
      width * 0.5,
      height * 0.45,
      Math.max(width, height) * 0.55,
    );
    grad.addColorStop(0, 'rgba(45, 212, 191, 0.06)');
    grad.addColorStop(1, 'rgba(6, 9, 17, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
}
