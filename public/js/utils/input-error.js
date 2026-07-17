/**
 * Atualiza o estado de erro de um campo de input e do elemento de mensagem associado.
 *
 * Acessibilidade:
 * - Utiliza o atributo `aria-error` para indicar o estado de validação.
 *
 * @param {Object} params
 * @param {string} params.id - ID do elemento input.
 * @param {boolean} params.error - Indica se o campo está em estado de erro.
 * @param {string} [params.msg] - Mensagem de erro exibida quando `error` for true.
 *
 * @returns {void}
 */
export function changeInputErrorStatus({ id, error = true, msg = '' }) {
    if (!id) return;

    const inputEl = document.getElementById(id);
    if (!inputEl) return;

    const errorEl = inputEl.parentElement.nextElementSibling;
    if (!errorEl) return;
    
    inputEl.setAttribute('aria-error', error);
    errorEl.setAttribute('aria-error', error && msg !== '');

    if (msg !== '') errorEl.textContent = msg;
}

/**
 * Adiciona um comportamento de limpeza (clear) para múltiplos inputs.
 *
 * Para cada ID informado:
 * - Localiza o input correspondente no DOM
 * - Obtém o elemento irmão imediato (ex: botão ou ícone de limpar)
 * - Ao clicar nesse elemento, o valor do input é limpado para string vazia
 *
 * Observações:
 * - O elemento "clear" deve ser o próximo irmão (`nextElementSibling`) do input
 * - A função não remove atributos como `data-*`, apenas limpa o valor
 *
 * @param {Object} params - Objeto de configuração.
 * @param {string[]} params.InputIdList - Lista de IDs dos inputs que terão a funcionalidade de limpar.
 *
 * @example
 * clearInput({
 *   InputIdList: ['name-input', 'email-input']
 * });
 */
export function clearInput({ InputIdList = [] }) {
    InputIdList.forEach(iId => {
        const i = document.getElementById(iId);
        if (!i) return;

        const cb = i.nextElementSibling;
        if (!cb) return;

        cb.addEventListener('click', () => {
            i.value = '';
        })
    })
}