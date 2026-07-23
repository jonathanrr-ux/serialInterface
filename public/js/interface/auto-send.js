import { selectedTemplate, templateContentMap, fetchAuxiliar } from "./template.js";
import { formatConditionValue } from './rules.js';
import showToast from "../utils/toast-notifications.js";

//* ======================{ Variáveis Globais }======================

const newAutoSendBtn = document.getElementById('new-auto-send-button');
export const autoSendList = document.getElementById('auto-send-list');
const saveAutoSendBtn = document.getElementById('save-auto-send-button');
const socket = io();

// Footer
const nextAutoSendName = document.getElementById('next-auto-send-name');
const nextAutoSendCountdown = document.getElementById('next-auto-send-countdown');
const autoSendCount = document.getElementById('auto-send-count');

let count = 0;

let nextAutoSendActiveCount = 0;
let autoSendJobs = [];
let nextAutoSendRun = null;
let nextAutoSendNameValue = 'Nenhum';
let footerState = {
    count: 0,
    next: 'Nenhum',
    countdown: 0
};

//* ======================{ Controle da página }======================

// Adiciona evento de clique ao botão de adicionar
newAutoSendBtn.addEventListener('click', () => {
    createAutoSend();
});

// Adiciona evento de clique no botão de salvar
saveAutoSendBtn.addEventListener('click', async() => {
    const autoSendListChildren = autoSendList.children;
        
    // Obtêm regras
    const autoSends = [...autoSendListChildren].map(validateFields);
    
    // Caso existam regras inválidas retorna
    if (autoSends.some(rule => rule === null)) {
        showToast({ message: 'Existem campos obrigatórios não preenchidos' });
        return;
    }
    
    // Faz requisição para salvar regra
    const { success, data } = await fetchAuxiliar({ url: `/api/auto-send/${selectedTemplate}/template`, method: "POST", body: { autoSends } });
    if(!success) return;
    
    templateContentMap.get(selectedTemplate).autoSends = data.autoSendList;
});

//* Funções:

// Função responsável por criar um auto envio
export function createAutoSend({ autoSend = null } = {}) {
    const div = document.createElement('div');
    div.className = 'group card p-4';
    div.dataset.expanded = autoSend ? false : true;
    div.dataset.type = autoSend?.type ?? 'packet';
    div.dataset.connected = autoSend?.enabled ?? false;
    if(autoSend?.id) div.dataset.id = autoSend?.id;

    // Obtêm HTML
    div.innerHTML = getAutoSendHTML({ autoSend });

    // Adiciona ao DOM
    autoSendList.appendChild(div);

    // Gerencia eventos
    setupEvents({ el: div, autoSend });
    renderSelect({ el: div });
}

// Função responsável por obter o HTML
function getAutoSendHTML({ autoSend = null } = {}) {
    const uuid = crypto.randomUUID();

    return `
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-5">
                <svg class="group-data-[expanded=true]:rotate-270 show-rule rotate-180 w-3 h-3 cursor-pointer" xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 24 32">
                    <path stroke="#6366F1" stroke-width="2" d="M14.44,0,16,1.56,3.12,14.4,16,27.24,14.44,28.8,0,14.4Z"/>
                </svg>
                <input class="input name-input font-bold w-[18rem]" value="${autoSend?.name ?? 'Novo auto envio'}">
            </div>

            <div class="flex items-center gap-5">
                <button class="group-data-[connected=true]:!hidden flex start-button base-button success rounded-xl px-5 py-1">Iniciar</button>
                <button class="group-data-[connected=false]:!hidden flex stop-button base-button danger rounded-xl px-5 py-1">Parar</button>
                <button class="delete-button cursor-pointer size-[2rem]">
                    <img src="/img/icons/trash.svg" class="size-full hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(239,68,68,.7)] opacity-40 transition-all duration-200">
                </button>
            </div>
        </div>

        <div class="grid group-data-[expanded=true]:grid-rows-[1fr] grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
            <div class="overflow-hidden">
                <hr class="my-4 text-border">

                <div class="flex w-full justify-between gap-4">
                    <div class="flex flex-col w-[50%] gap-2">
                        <p class="text-[0.7em] font-bold">Tipo de envio</p>
                        <div class="flex flex-col p-2 rounded-xl gap-3 border-2 border-border">
                            <label class="flex gap-3 cursor-pointer">
                                <input type="radio" name="send-type-${autoSend?.id ?? uuid}" value="packet" ${autoSend?.type === 'packet' ? 'checked' : !autoSend ? 'checked' : ''} class="radio">
                                <div>
                                    <p class="text-[0.8em]">Enviar um pacote</p>
                                    <p class="text-text-secondary text-[0.5em]">Escolha um pacote específico do template para repetir</p>
                                </div>
                            </label>

                            <label class="flex gap-3 cursor-pointer">
                                <input type="radio" name="send-type-${autoSend?.id ?? uuid}" value="template" ${autoSend?.type === 'template' ? 'checked' : ''} class="radio">
                                <div>
                                    <p class="text-[0.8em]">Enviar template completo</p>
                                    <p class="text-text-secondary text-[0.5em]">Envia todos os pacotes do template na ordem definida</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="flex flex-col w-[50%] gap-2">
                        <div class="group-data-[type=template]:hidden flex flex-col">
                            <p class="text-[0.7em] font-bold">Pacotes:</p>
                            <select class="input h-[3rem]">
                            </select>
                        </div>

                        <p class="text-[0.7em] font-bold">Intervalo</p>
                        <div class="flex items-center w-full gap-2">
                            <input type="number" class="interval-input input h-[3rem] w-full" value="${autoSend?.interval ?? 0}">
                            <p class="text-text-secondary text-[0.7em] font-bold">ms</p>
                        </div>
                    </div>
                </div>

                <hr class="text-border w-full my-4">

                <div class="flex justify-between">
                    <div class="flex gap-4">
                        <label class="flex gap-2 items-center">
                            <input type="checkbox" ${autoSend?.start_on_connect ? 'checked' : ''} class="checkbox start-connect">
                            <span class="text-[0.8em]">Iniciar automaticamente ao conectar</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Função responsável por controlar o evento de select
function setupEvents({ el, autoSend }) {
    // Evento para deletar regra
    const iconBtn = el.querySelector('.delete-button');
    iconBtn.addEventListener('click', async() => {
        if(!confirm('Tem certeza que deseja excluir essa regra?')) return;
        
        // Caso seja uma regra já carregada deleta
        if(el?.dataset?.id) {
            const { success } = await fetchAuxiliar({ url: `/api/auto-send/${el.dataset.id}`, method: 'DELETE' });
            if(!success) return;

            const content = templateContentMap.get(selectedTemplate);
            content.autoSends = content.autoSends.filter(a => a.id !== el.dataset.id);
        }

        el.remove();
    });

    // Evento de esconder/mostrar regra
    const showRule = el.querySelector('.show-rule');
    showRule.addEventListener('click', function() {
        const willClose = el.dataset.expanded === 'true';

        el.dataset.expanded = !willClose;

        // Se abriu a regra
        if (!willClose) {
            setTimeout(() => {
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);
        }
    });

    // Adiciona evento de change aos radios
    const radios = el.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            const checked = el.querySelector('input[type="radio"]:checked');

            el.dataset.type = checked.value;
        });
    });

    const startBtn = el.querySelector('.start-button');
    startBtn.addEventListener('click', async() => {
        if(!el.dataset.id) {
            showToast({ message: 'Salve antes de iniciar' });
            return;
        }

        const { success } = await fetchAuxiliar({ url: `/api/auto-send/${el?.dataset?.id}/start`, method: 'POST', toast: false });
        if(!success) return;

        // count++;
        // updateCountFooter({ count });

        el.dataset.connected = true;
    });

    const stopBtn = el.querySelector('.stop-button');
    stopBtn.addEventListener('click', async() => {
        const { success } = await fetchAuxiliar({ url: `/api/auto-send/${el?.dataset?.id}/stop`, method: 'POST', toast: false });
        if(!success) return;

        // count--;
        // updateCountFooter({ count });

        el.dataset.connected = false;
    });
}

// Função responsável por renderizar o select
function renderSelect({ el }) {
    const select = el.querySelector("select");
    const packets = templateContentMap.get(selectedTemplate).packets;
    
    // Limpa opções anteriores
    select.replaceChildren();

    packets.forEach(p => {
        select.add(new Option(`${p.name} - ${formatConditionValue(p.bytes)}`, p.id));
    });
}

//* ======================{ Funções auxiliares }======================

// Função responsável por extrair conteúdos para salvar
function getAutoSendData(el) {
    const type = el.querySelector('input[type="radio"]:checked').value;
    
    return {
        // Obtêm id
        id: el.dataset.id ?? null,

        // Obtêm nome
        name: el.querySelector('.name-input').value,
        enabled: el.dataset.connected === 'true',

        type: el.querySelector('input[type="radio"]:checked').value,
        packet_id: type === 'packet' ? el.querySelector('select').value : null,
        interval: Number(el.querySelector('.interval-input').value),
        start_on_connect: el.querySelector('.start-connect').checked
    };
}

// Função responsável por validar campos e retornar os certos
function validateFields(el) {
    // Obtêm os objetos
    const autoSend = getAutoSendData(el);
    
    // Verificações
    if(autoSend.name === '') return null;
    if(autoSend.interval <= 0) return null;

    return autoSend;
}

export function refreshAutoSendPackets() {
    [...autoSendList.children].forEach(autoSendEl => {
        const select = autoSendEl.querySelector('select');

        const selectedPacket = select.value;

        const packets = templateContentMap.get(selectedTemplate)?.packets ?? [];

        select.replaceChildren();

        packets.forEach(packet => {
            select.add(
                new Option(
                    `${packet.name} - ${formatConditionValue(packet.bytes)}`,
                    packet.id
                )
            );
        });

        // mantém o pacote selecionado se ele ainda existir
        if (packets.some(p => p.id === selectedPacket)) {
            select.value = selectedPacket;
        }
    });
}

// Função responsável por atualizar o footer
export function updateFooter(data = {}) {
    footerState = {
        ...footerState,
        ...data
    };

    autoSendCount.textContent = footerState.count;
    nextAutoSendName.textContent = footerState.next;
    nextAutoSendCountdown.textContent = footerState.countdown;
}

// Função responsável por formatar 
function formatCountdown(ms) {
    if (ms <= 0) return 'Agora';

    const seconds = Math.floor(ms / 1000);

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Função responsável por atualizar o proximo job
function updateNextJob() {
    // Obtêm os jobs ativos
    const activeJobs = autoSendJobs.filter(job => job.active && job.nextRun);

    // Obtêm o com menor tempo
    const nextJob = activeJobs.sort((a, b) => a.nextRun - b.nextRun)[0];

    // Salva
    nextAutoSendRun = nextJob?.nextRun ?? null;

    // Atualiza texto
    if (nextJob) nextAutoSendNameValue = `${nextJob.name} + ${activeJobs.length - 1}`;
    else nextAutoSendNameValue = 'Nenhum';
}

//* ======================{ Sockets }======================

socket.on('autoSend:status', data => {
    autoSendJobs = data.jobs || [];

    updateNextJob();

    updateFooter({
        count: data.active,
        next: nextAutoSendNameValue,
        countdown: nextAutoSendRun
            ? formatCountdown(nextAutoSendRun - Date.now())
            : 0
    })
});

socket.on('autoSend:update', data => {
    const index = autoSendJobs.findIndex(job => job.id === data.id);

    if (index === -1) return;

    autoSendJobs[index] = {
        ...autoSendJobs[index],
        ...data
    };

    updateNextJob();

    updateFooter({
        next: nextAutoSendNameValue,
        countdown: nextAutoSendRun
            ? formatCountdown(nextAutoSendRun - Date.now())
            : 0
    });
});

setInterval(() => {
    if (!nextAutoSendRun) return;

    const remaining = nextAutoSendRun - Date.now();

    updateFooter({ countdown: formatCountdown(remaining) });
}, 1000);