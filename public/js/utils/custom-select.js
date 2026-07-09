/**
 * Classe que cria um select personalizável
 */
export default class CustomSelect {
    #config;
    #readyPromise;
    #resolveReady;
    #isOpen = false;

    /** @type {string|null} Valor selecionado atualmente */
    selectedValue = null;

    /**
     * Construtor da classe CustomSelect
     * @param {string} id - ID do container do select
     * @param {Object} config - Configurações do select
     * @param {string} [config.placeholderText] - Texto exibido quando nenhum item está selecionado
     * @param {string} [config.dropdownMaxHeight] - Altura máxima do dropdown
     * @param {string} [config.dropdownMaxWidth] - Largura máxima do dropdown
     * @param {Array} [config.options] - Lista de opções do select ({id, value, name})
     * @param {string|number|null} [config.initialValue] - Valor inicial selecionado
     */
    constructor (id = '', config = {}) {

        // Obtêm elemento
        this.containerEl = document.getElementById(id);

        // Caso não seja passado elemento, retorna
        if(!this.containerEl) return;

        this.#readyPromise = new Promise(resolve => {
            this.#resolveReady = resolve;
        });

        // Cria uma variável de configurações
        this.#config = {
            placeholderText: config.placeholderText ?? '',
            dropdownMaxHeight: config.dropdownMaxHeight ?? '15rem',
            dropdownMaxWidth: config.dropdownMaxWidth ?? '100%',
            options: [],
            initialValue: config.initialValue ?? null,
            side: config.side ?? 'center',
            textCenter: config.textCenter ?? false
        };

        this.#renderButton();
        this.#renderDropdown();
        this.#cacheElements();
        this.#bindEvents();

        
        const applyOptions = (options) => {
            this.options = options;

            if (this.#config.initialValue !== null) {
                this.#setValue(this.#config.initialValue);
            }

            this.#resolveReady();
        };

        const loadOptions = config.options;

        if (typeof loadOptions === 'function') {
            loadOptions().then(applyOptions);
        } else {
            applyOptions(loadOptions);
        }
    }

    /**
     * Armazena referências para elementos criados
     * @private
     */
    #cacheElements() {
        this.dropdownEl = this.containerEl.querySelector('ul');
        this.optionsEl = this.containerEl.querySelectorAll('li');
        this.labelEl = this.containerEl.querySelector('span');
    }

    /**
     * Renderiza o botão principal do select
     * @private
     */
    #renderButton() {
        // Função genérica para criar elemento
        this.#createElement({ 
            parentEl: this.containerEl,
            element: 'button', 
            type: 'button', 
            className: 'w-full h-full flex justify-between items-center px-2 border-2 border-border rounded-md bg-background',
            innerHTML: `<span class="text-start max-w-[85%] max-h-full break-all truncate">${this.#config.placeholderText}</span> <svg class="rotate-270 w-3 h-3" xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 24 32"><path stroke="#475569" stroke-width="2" d="M14.44,0,16,1.56,3.12,14.4,16,27.24,14.44,28.8,0,14.4Z"/></svg>`
        });
    }

    /**
     * Cria o container do dropdown (<ul>) e inicializa
     * a lista de opções do select.
     *
     * Esse método deve ser chamado apenas uma vez,
     * normalmente durante a inicialização do componente.
     *
     * @private
     */
    #renderDropdown() {
        // Obtêm retorno do elemento criado
        this.ul = this.#createElement({ 
            parentEl: this.containerEl,
            element: 'ul',
            className: `hidden absolute ${this.#config.side}-0 w-max min-w-full border-2 border-border rounded-md ${this.#config.side == 'right' ? 'rounded-tr-none' : this.#config.side == 'center' ? '' : 'rounded-tl-none'} p-2 z-10 overflow-y-auto overflow-x-hidden scroll-auto bg-background`,            
            style: `max-width: ${this.#config.dropdownMaxWidth}; max-height: ${this.#config.dropdownMaxHeight}`
        });
        this.#renderDropdownList();
    }

    /**
     * Renderiza (ou re-renderiza) a lista de opções do dropdown
     * com base nas opções definidas em config.options.
     * Limpa os itens existentes e cria novos elementos <li>.
     *
     * @private
     */
    #renderDropdownList() {
        this.ul.innerHTML = '';

        // Cria cada item dentro da lista
        this.#config.options.forEach(item => {
            // Caso seja passado id nas lista, pega id, se não pega o value
            const value = item.id || item.value || item.code;

            this.#createElement({ 
                parentEl: this.ul,
                element: 'li',
                className: `${this.#config.textCenter ? 'text-center' : ''} break-all w-full border-b-2 last:border-b-0 p-2 last:rounded-b-sm first:rounded-t-sm cursor-pointer active:bg-surface-light border-border cursor-pointer hover:bg-surface-light`,
                attr: 'data-value',
                attrVal: value,
                text: `${item.name}`
            });
        })
    }

    /**
     * Cria um elemento HTML genérico e adiciona ao DOM
     * @param {Object} params - Parâmetros para criação do elemento
     * @param {HTMLElement} params.parentEl - Elemento pai
     * @param {string} params.element - Tipo do elemento (ex: 'div', 'li')
     * @param {string} [params.id] - ID do elemento
     * @param {string} [params.type] - Tipo do elemento (ex: 'button')
     * @param {string} [params.className] - Classes CSS
     * @param {string} [params.attr] - Atributo a ser adicionado
     * @param {string} [params.attrVal] - Valor do atributo
     * @param {string} [params.innerHTML] - HTML interno
     * @param {string} [params.text] - Texto do elemento
     * @returns {HTMLElement} Elemento criado
     * @private
     */
    #createElement({ parentEl, element, id = '', type = '', className = '', attr = '', attrVal = '', innerHTML = '', text = '', style = '' }) {
        const el = document.createElement(element);
        if(id) el.id = id;
        if(type) el.type = type;
        if(className) el.className = className;
        if(attr) el.setAttribute(`${attr}`, `${attrVal}`);
        if(innerHTML) el.innerHTML = innerHTML;
        if(text) el.textContent = text;
        if(style) el.style = style
        parentEl.appendChild(el);
        return el;
    }

    /**
     * Abre o dropdown
     * @private
     */
    #openDropdown() {
        this.dropdownEl.classList.remove('hidden');
        this.#isOpen = true;

        document.addEventListener('click', this.#handleOutsideClick, true);
    }

    /**
     * Fecha o dropdown
     * @private
     */
    #closeDropdown() {
        this.dropdownEl.classList.add('hidden');
        this.#isOpen = false;

        document.removeEventListener('click', this.#handleOutsideClick, true);
    }

    /**
     * Adiciona eventos ao select e itens do dropdown
     * @private
     */
    #bindEvents() {
        // Adicionar evento de clique a select box
        this.containerEl.addEventListener('click', (e) => {
            e.stopPropagation();
            // Caso esteja aberto fecha e fechado abre
            this.#isOpen ? this.#closeDropdown() : this.#openDropdown();
        });

        // Adiciona evento de clique a página
        document.addEventListener('click', (e) => this.#handleOutsideClick(e));

        // Adiciona evento de clique na lista 
        this.ul.addEventListener('click', (e) => {

            // Procura o li mais próximo
            const item = e.target.closest('li');
            if (!item) return;
    
            e.stopPropagation();

            const options = this.ul.querySelectorAll('li');
    
            options.forEach(o => o.classList.remove('bg-surface-light'));

            this.labelEl.textContent = item.textContent;
            this.selectedValue = item.dataset.value;
            item.classList.add('bg-surface-light');

            // Dispara evento de mudança de elemento selecionado
            this.containerEl.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    
            this.#closeDropdown();
        });
    }

    /**
     * Fecha o dropdown ao clicar fora do container
     * @param {Event} e - Evento de clique
     * @private
     */
    #handleOutsideClick = (e) => {
        if (!this.containerEl.contains(e.target)) {
            this.#closeDropdown();
        }
    }

    /**
     * Seta um valor específico no select
     * @param {string|number} value - Valor a ser selecionado
     * @private
     */
    #setValue(value) {
        const options = this.containerEl?.querySelectorAll('li');

        if (value === null || value === undefined) {
            this.selectedValue = null;

            options?.forEach(o => o.classList.remove('bg-surface-light'));

            if (this.labelEl) {
                this.labelEl.textContent = this.#config.placeholderText;
            }

            return;
        }

        const option = Array.from(options)?.find(item => item.dataset.value == value);

        if (!option) return;

        options.forEach(o => o.classList.remove('bg-surface-light'));

        this.labelEl.textContent = option.textContent;
        this.selectedValue = value;

        option.classList.add('bg-surface-light');
    }
    

    /**
     * Retorna o valor selecionado
     * @returns {string|number|null} Valor selecionado
     */
    get value() {
        return this.selectedValue;
    }

    /**
     * Altera o valor selecionado
     * @param {string|number} v - Valor a ser selecionado
     */
    set value(v) {
        this.#setValue(v);
    }

    // Obtêm a opção selecionada
    get option() {
        return this.#config.options.find(item => (item.id || item.value || item.code) == this.selectedValue) || null;
    }

    /**
     * Altera a lista de opções
     * @param {string|number} l - lista a ser implementada
     */
    set options(l) {
        this.#config.options = l;

        this.#renderDropdownList();
    }

    ready() {
        return this.#readyPromise;
    }
    
    /**
     * Reseta o estado do componente de seleção.
     *
     * - Recarrega os elementos em cache.
     * - Remove a classe de destaque das opções selecionadas.
     * - Limpa o valor atualmente selecionado.
     * - Restaura o texto do label para o placeholder padrão.
     *
     * @returns {void}
     */
    clear() {
        this.selectedValue = null;

        if (this.labelEl) {
            this.labelEl.textContent = this.#config.placeholderText;
        }

        this.optionsEl = this.containerEl?.querySelectorAll('li');

        this.optionsEl?.forEach(o => o.classList.remove('bg-surface-light'));
    }
}