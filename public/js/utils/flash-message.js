import showToast from './toast-notifications.js';

const MESSAGE = 'flash-message';
const TYPE = 'flash-message-type';

document.addEventListener('DOMContentLoaded', () => {
    const msg = sessionStorage.getItem(MESSAGE);
    const type = sessionStorage.getItem(TYPE);

    if (msg) {
        if (typeof showToast === 'function') {
            showToast({ type: type || 'error', message: msg});
        }
        sessionStorage.removeItem(MESSAGE);
        sessionStorage.removeItem(TYPE);
    }
});

/**
 * Define uma mensagem global para a próxima página
 */
export function setFlashMessage({message, type = 'error' }) {
    sessionStorage.setItem(MESSAGE, message);
    sessionStorage.setItem(TYPE, type);
}