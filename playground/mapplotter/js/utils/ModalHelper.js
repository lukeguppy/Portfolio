/**
 * ModalHelper - Reusable modal utility for consistent overlay behavior
 * Extracts common patterns: overlay creation, escape handling, close animations
 */
class ModalHelper {
    /**
     * Create a modal overlay with standard styling
     * @param {Object} options - Configuration options
     * @param {string} options.width - Modal width (default: '340px')
     * @param {string} options.content - Inner HTML for modal body
     * @param {string} options.title - Modal header title
     * @param {Function} options.onClose - Callback when modal closes
     * @returns {Object} { overlay, modal, closeBtn, close, escHandler }
     */
    static create(options = {}) {
        const { width = '340px', content = '', title = 'Modal', onClose = null } = options;

        const overlay = document.createElement('div');
        overlay.className = 'picker-overlay active';

        overlay.innerHTML = `
            <div class="picker-modal" style="width: ${width}; max-width: 95vw;">
                <div class="picker-header">
                    <h3>${title}</h3>
                    <button class="picker-close">&times;</button>
                </div>
                <div class="picker-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeBtn = overlay.querySelector('.picker-close');
        let escHandler = null;

        const close = (result = null) => {
            if (escHandler) {
                document.removeEventListener('keydown', escHandler, { capture: true });
            }

            if (document.body.contains(overlay)) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                }, 300);
            }

            if (onClose) onClose(result);
        };

        escHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopImmediatePropagation();
                close(null);
            }
        };
        document.addEventListener('keydown', escHandler, { capture: true });

        // Standard close behaviors
        closeBtn.addEventListener('click', () => close(null));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(null);
        });

        return {
            overlay,
            modal: overlay.querySelector('.picker-modal'),
            body: overlay.querySelector('.picker-body'),
            closeBtn,
            close,
            escHandler
        };
    }

    /**
     * Create a confirmation modal with confirm/cancel buttons
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message (supports HTML)
     * @param {Function} onConfirm - Called when user confirms
     * @param {Function} onCancel - Called when user cancels (optional)
     */
    static confirm(title, message, onConfirm, onCancel = null) {
        const content = `
            <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 14px; line-height: 1.5;">${message}</p>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button class="btn btn-secondary modal-cancel-btn" style="padding: 10px 16px; border-radius: 8px;">Cancel</button>
                <button class="picker-save-btn modal-confirm-btn" style="min-width: 80px;">Confirm</button>
            </div>
        `;

        let confirmed = false;
        let enterHandler = null;

        const { overlay, close: baseClose } = ModalHelper.create({
            title,
            content,
            width: '400px',
            onClose: (result) => {
                // Always remove Enter handler when modal closes for any reason
                if (enterHandler) {
                    document.removeEventListener('keydown', enterHandler, { capture: true });
                    enterHandler = null;
                }
                if (!confirmed && onCancel) onCancel();
            }
        });

        const confirmBtn = overlay.querySelector('.modal-confirm-btn');
        const cancelBtn = overlay.querySelector('.modal-cancel-btn');

        confirmBtn.focus();

        // Add Enter key handler for quick confirm
        enterHandler = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopImmediatePropagation();
                confirmed = true;
                onConfirm();
                baseClose(true);
            }
        };
        document.addEventListener('keydown', enterHandler, { capture: true });

        confirmBtn.addEventListener('click', () => {
            confirmed = true;
            onConfirm();
            baseClose(true);
        });

        cancelBtn.addEventListener('click', () => baseClose(null));

        return { overlay, close: baseClose };
    }

    /**
     * Create an input modal with text field and save button
     * @param {string} title - Modal title
     * @param {string} placeholder - Input placeholder text
     * @param {Function} onSave - Called with input value when saved
     * @param {Object} options - Additional options
     */
    static input(title, placeholder, onSave, options = {}) {
        const { buttonText = 'Save', validator = (v) => v.trim().length > 0 } = options;

        const content = `
            <div class="picker-custom-row">
                <input type="text" 
                       id="modal-input" 
                       class="picker-hex-input" 
                       placeholder="${placeholder}" 
                       style="text-transform: none;">
                <button class="picker-save-btn modal-save-btn">${buttonText}</button>
            </div>
        `;

        const { overlay, close } = ModalHelper.create({ title, content });

        const input = overlay.querySelector('#modal-input');
        const saveBtn = overlay.querySelector('.modal-save-btn');

        // Initial state - disabled
        saveBtn.style.opacity = '0.5';
        saveBtn.disabled = true;

        // Validation on input
        input.addEventListener('input', () => {
            const valid = validator(input.value);
            saveBtn.disabled = !valid;
            saveBtn.style.opacity = valid ? '1' : '0.5';
        });

        const save = () => {
            const value = input.value.trim();
            if (value && validator(value)) {
                onSave(value);
                close(value);
            }
        };

        saveBtn.addEventListener('click', save);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !saveBtn.disabled) {
                save();
            }
        });

        // Focus input
        setTimeout(() => input.focus(), 50);

        return { overlay, close, input };
    }
}
