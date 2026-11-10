/**
 * Contact page: one-click clipboard copy for `lukewguppy@gmail.com`.
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
