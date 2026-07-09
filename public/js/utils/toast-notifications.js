// Ícones dos tipos de toast
const TOAST_ICONS = {
    success: `<svg class="size-[1rem] md:size-[2rem] lg:size-[1.5rem]" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" /></svg>`,
    error: `<svg class="size-[1rem] md:size-[2rem] lg:size-[1.5rem]" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18" stroke="white" stroke-width="3.5" stroke-linecap="round"/><path d="M18 6L6 18" stroke="white" stroke-width="3.5" stroke-linecap="round"/></svg>`,
    warning: `<svg class="size-[1rem] md:size-[2rem] lg:size-[1.5rem]" viewBox="0 0 24 24" fill="none"><path d="M12 5V14" stroke="white" stroke-width="3.5" stroke-linecap="round"/><path d="M12 18V18.2" stroke="white" stroke-width="3.5" stroke-linecap="round"/></svg>`,
    info: `<svg class="size-[1rem] md:size-[2rem] lg:size-[1.5rem]" viewBox="0 0 24 24" fill="none"><path d="M12 5V5.2" stroke="white" stroke-width="3.5" stroke-linecap="round"/><path d="M12 10V18" stroke="white" stroke-width="3.5" stroke-linecap="round"/></svg>`
};

// Cores: [background, texto, barra]
const TOAST_COLORS = {
    success: ["bg-green-100", "text-green-900", "bg-green-800"],
    error: ["bg-red-100", "text-red-900", "bg-red-500"],
    warning: ["bg-yellow-100", "text-yellow-900", "bg-yellow-500"],
    info: ["bg-blue-100", "text-blue-900", "bg-blue-500"]
};

const TYPES = {
    error: 'Erro',
    warning: 'Aviso',
    success: 'Sucesso',
    info: 'Info',
}

/**
 * Exibe um toast de notificação.
 *
 * @param {Object} options
 * @param {"success"|"error"|"warning"|"info"} [options.type="error"]
 * @param {string} [options.message=""]
 * @param {number} [options.duration=5000]
 */
export default function showToast({ type = 'error', message = '', duration = 5000 }) {
    // Verifica se há o container para conter as notifications
    let container = document.querySelector('#toast-container');

    // Cria container
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';

        // Obtêm o tamanho do cabeçalho
        const headerHeight = document.querySelector('header').getBoundingClientRect().height;

        container.className = `fixed right-2 flex flex-col-reverse gap-3 z-40`;
        container.style.top = `${headerHeight + 5}px`;

        document.body.appendChild(container);
    }

    // Define paleta de cores, caso não encontre colocar a de erro
    const [bgColor, textColor, barColor] = TOAST_COLORS[type] || TOAST_COLORS.error;

    // Remove warnings anteriores
    if (type === 'warning') {
        const existing = container.querySelector('.toast-warning');
        if (existing) existing.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `
        toast-${type} relative flex flex-col justify-between min-h-[4.3rem] w-[18rem] bg-white ${textColor}
        rounded-md overflow-hidden animate-slide-in md:w-[25rem] md:min-h-[6rem] lg:w-[20rem] lg:min-h-[4.3rem]
    `;

    // Remove o arredondado caso o elemento seja do tipo warning
    const icon = 
        `<div class="flex justify-center items-center size-[2rem] text-white rounded-full font-bold ${barColor} md:size-[3rem] lg:size-[2rem]">
                ${TOAST_ICONS[type]}
        </div>`

    toast.innerHTML = `
        <button class="absolute top-1 right-2 font-bold text-[0.6em]">⨉</button>
        <div class="flex flex-row m-auto justify-start items-center size-full p-1 md:p-2">
            <div class="flex justify-center items-center self-start w-1/6 h-full pt-3">
                ${icon}
            </div>
            <div class='flex flex-col pl-2'>
                <p class='font-bold text-[0.9em]'>${TYPES[type]}</p>
                <div class="flex flex-col justify-center w-full h-full pr-5 whitespace-normal hyphens-auto text-[0.8em]">
                    ${message}
                </div>
            </div>
        </div>
        <div class="h-[0.4rem] ${barColor} transition-all w-full toast-bar"></div>
        `;

    // Fechar manualmente
    toast.querySelector("button").addEventListener("click", () => toast.remove());

    // Barra de tempo animada
    const bar = toast.querySelector(".toast-bar");
    setTimeout(() => {
        bar.style.width = "0%";
        bar.style.transitionDuration = `${duration}ms`;
        bar.style.transitionTimingFunction = 'linear';
        bar.classList.remove("w-full");
        bar.classList.add("w-0");
    }, 20);

    // Remoção automática
    setTimeout(() => {toast.remove()}, duration);

    // Limite de toasts
    if (container.children.length >= 7) container.firstChild.remove();

    container.appendChild(toast);
}