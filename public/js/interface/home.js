import FetchService from '../utils/fetchService.js';
import showToast from '../utils/toast-notifications.js';

//* ======================{ Variáveis Globais }======================

// Pop over
const details = document.querySelector('details');
const createNewPacketBtn = document.getElementById('create-new-packet-button');
const bytesQuantityInput = document.getElementById('bytes-quantity-input');
const sendAllBtn = document.getElementById('send-all-button');
const responseInput = document.getElementById('response-input');
const tabsBtn = document.querySelectorAll('[data-tab]');
const packageEditorContainer = document.getElementById('package-editor-container');

// Editor de pacotes
export const packetList = document.getElementById('packet-list');

const api = new FetchService();
const MAX_BYTES = 9;

// Inicializa página
packageEditorContainer.dataset.activeTab = '';

//* ======================{ Controle das tabs }======================

// Adiciona evento de clique as abas
tabsBtn.forEach(t => {
    t.addEventListener('click', function() {
        changeTab({ tab: this.dataset.tab });
    });
})

//* ======================{ Controle da página }======================

//* Eventos:

// Adiciona elemento de clique a toda página
document.addEventListener('click', (e) => {
    // Caso clique for fora do pop over
    if (!details.contains(e.target)) details.removeAttribute('open');
});

sendAllBtn.addEventListener('click', async() => {
    // Pega todos bytes do pacote
    const packets = document.querySelectorAll('.packet');

    // Obtêm pacotes
    const packetData = [...packets].map(packet => {
        const bytes = [...packet.querySelectorAll('.packet-byte input')].map(input => parseInt(input.value, 16));

        return bytes;
    });

    // Faz requisição para enviar
    const { message, success } = await api.request('/api/serial/send', { method: 'POST',  body: { bytes: packetData } });
    if(!success) return;
});

//* ======================{ Controle do pop over }======================

//* Eventos:

// Adiciona evento de clique ao botão de criar novo pacote
createNewPacketBtn.addEventListener('click', () => {
    // Obtêm o input
    const value = Number(bytesQuantityInput.value);

    // Caso valor seja invalido retorna
    if(!value || value > 9) return;

    // Cria pacote de bytes
    createPacket({ bytes: value });
});


//* Funções:

// Função responsável por criar o pacote de bytes
export function createPacket({ bytes, values = [] }) {
    if(!bytes) return;
    
    const packet = document.createElement('div');
    packet.className = 'packet-container flex w-full items-center justify-between border-b-2 border-border p-2';
    packet.innerHTML = `
        <div class="packet flex items-center gap-1"></div>
        <div class="flex gap-2">
            <div class="delete-btn size-[3.5rem] rounded-xl base-button danger">
                <img src="/img/icons/trash.svg" class="size-full p-2">
            </div>
            <div class="send-btn size-[3.5rem] rounded-xl base-button primary">
                <img src="/img/icons/send.svg" class="size-full p-2">
            </div>
        </div>`;

    // Adiciona a lista
    packetList.appendChild(packet);

    // Obtêm o a div dos pacotes
    const packetContent = packet.querySelector('.packet');

    // Cria cada byte
    for(let i = 0; i < bytes; i++) createPacketEl({ parent: packetContent, item: i, value: values[i] });
    
    // Cria botão de adicionar
    updateAddButton(packetContent);
}

// Função responsável por criar os bytes
export function createPacketEl({ parent, item, value = 0 }) {
    // Cria el
    const byte = document.createElement('div');
    byte.className = 'packet-byte group';
    byte.innerHTML = `
        <input type="text" maxlength="2" value="${value.toString(16).padStart(2, '0').toUpperCase()}" class="size-full outline-none text-center">
        <label class="text-center text-[0.6em]">${item + 1}</label>
        <div class="x-btn absolute right-0 top-0 -translate-x-1/2 text-[0.6em] cursor-pointer">✕</div>
    `;
    
    const addContainer = parent.querySelector('.add-container');

    if (addContainer) parent.insertBefore(byte, addContainer);
    else parent.append(byte);
};

//* ======================{ Controle da lista de bytes }======================

//* Eventos: 

// Adiciona evento de clique a lista
packetList.addEventListener('click', async(e) => {
    // Obtêm pacote
    const packetContainer = e.target.closest('.packet-container');
    const packet = e.target.closest('.packet')
    if (!packetContainer) return;

    // Remove byte
    if (e.target.closest('.x-btn')) {
        e.target.closest('.packet-byte').remove();

        // Atualiza texto e bota botão de add caso necessário
        updateLabels(packet);
        updateAddButton(packet);

        return;
    }

    // Adiciona byte
    if (e.target.closest('.add-btn')) {
        // Obtêm quantos tem
        const total = packet.querySelectorAll('.packet-byte').length;

        // Cria byte
        createPacketEl({ parent: packet, item: total });

        // Atualiza texto e botão de adicionar
        updateLabels(packet);
        updateAddButton(packet);

        return;
    }

    // Remove pacote
    if (e.target.closest('.delete-btn')) {
        packetContainer.remove();
        return;
    }

    // Envia pacote
    if (e.target.closest('.send-btn')) {
        // Obtêm o pacote
        const packetData = [...packetContainer.querySelectorAll('.packet-byte input')].map(input => parseInt(input.value, 16));

        // Faz requisição para enviar
        const { message, success } = await api.request('/api/serial/send', { method: 'POST',  body: { bytes: packetData } });
        if(!success) return;
    }
});

//* Funções:

// Função responsável por atualizar os labels
function updateLabels(parent) {
    parent.querySelectorAll('.packet-byte').forEach((byte, index) => {
        byte.querySelector('label').textContent = `${index + 1}`;
    });
}

// Função responsável por atualizar o botão de adicionar
export function updateAddButton(parent) {
    // Obtêm quantos pacotes tem
    const total = parent.querySelectorAll('.packet-byte').length;

    // Container de add
    const addContainer = parent.querySelector('.add-container');

    if (total < MAX_BYTES) {
        // Caso ainda não tenha o add
        if (!addContainer) {
            // Cria el
            const add = document.createElement('div');
            add.className = 'add-container relative flex flex-col w-[4rem] h-[5rem] items-center justify-between gap-1 rounded-xl p-2 bg-background border-dashed border-2 border-border cursor-pointer';
            add.innerHTML = `
                <div class="add-btn rounded-md size-[3.5rem] bg-background p-2 hover:bg-surface-light">
                    <img src="/img/icons/add.svg" class="size-full">
                </div>

                <p class="invisible">add</p>
            `;

            parent.append(add);
        }
    } else addContainer?.remove();
}

//* ======================{ Controle do recebimento de pacotes }======================

responseInput.addEventListener('input', async function () {
    // Verifica se o valor escrito é valido
    if (!this.value.trim().length) return;

    // Envia novo valor a uma rota para fazer a alteração da leitura
    await api.request('/api/serial/byte-length', {
        method: 'POST',
        body: {
            byteLength: Number(this.value)
        }
    });
})

//* ======================{ Funções auxiliares }======================

// Função responsável por selecionar a tab
export function changeTab({ tab }) {
    // Desabilita todos
    tabsBtn.forEach(b => b.setAttribute('aria-selected', false));

    // Seleciona tab certa
    document.querySelector(`[data-tab="${tab}"]`).setAttribute('aria-selected', true);

    // Seleciona
    packageEditorContainer.dataset.activeTab = tab;
}