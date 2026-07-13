import FetchService from '../utils/fetchService.js';
import showToast from '../utils/toast-notifications.js';
import { responseInput } from './template.js';

//* ======================{ Variáveis Globais }======================

// Pop over
const details = document.querySelector('details');
const createNewPacketBtn = document.getElementById('create-new-packet-button');
const bytesQuantityInput = document.getElementById('bytes-quantity-input');

// Editor de pacotes
export const packetList = document.getElementById('packet-list');

const api = new FetchService();
const MAX_BYTES = 9;

//* ======================{ Controle da página }======================

//* Eventos:

// Adiciona elemento de clique a toda página
document.addEventListener('click', (e) => {
    // Caso clique for fora do pop over
    if (!details.contains(e.target)) details.removeAttribute('open');
});

//* ======================{ Controle do pop over }======================

//* Eventos:

// Adiciona evento de clique ao botão de criar novo pacote
createNewPacketBtn.addEventListener('click', () => {
    document.querySelectorAll('[aria-selected]').forEach(a => a.setAttribute('aria-selected', false));

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
    
    // Cria elemento
    const packet = document.createElement('div');
    packet.className = 'packet relative flex gap-3 border-b-2 border-border';
    packet.innerHTML = `
        <div class="flex absolute right-0 gap-2">
            <div class="delete-btn size-[3rem] rounded-md bg-danger hover:bg-danger-hover">
                <img src="/img/icons/trash.svg" class="size-full p-2">
            </div>
            <div class="send-btn size-[3rem] rounded-md bg-primary hover:bg-primary-hover">
                <img src="/img/icons/send.svg" class="size-full p-2">
            </div>
        </div>`;

    // Adiciona a lista
    packetList.appendChild(packet);

    // Cria cada byte
    for(let i = 0; i < bytes; i++) createPacketEl({ parent: packet, item: i, value: values[i] });
    
    // Cria botão de adicionar
    updateAddButton(packet);
}

// Função responsável por criar os bytes
export function createPacketEl({ parent, item, value = 0 }) {
    // Cria el
    const byte = document.createElement('div');
    byte.className = 'packet-byte relative flex flex-col gap-1';
    byte.innerHTML = `
        <input type="text" maxlength="2" value="${value.toString(16).padStart(2, '0').toUpperCase()}" class="text-center border-2 border-border rounded-md size-[3rem] bg-background outline-none p-2">
        <label class="text-center text-[0.6em]">Byte ${item + 1}</label>
        <div class="x-btn absolute right-0 top-0 -translate-x-2/2 text-[0.5em] cursor-pointer">X</div>
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
    const packet = e.target.closest('.packet');
    if (!packet) return;

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
        packet.remove();
        return;
    }

    // Envia pacote
    if (e.target.closest('.send-btn')) {
        const btn = e.target.closest('.send-btn');

        if (btn.disabled) return;

        btn.disabled = true;

        try {
            const packetData = [...packet.querySelectorAll('.packet-byte input')].map(input => parseInt(input.value, 16));

            await api.request('/api/serial/send', {
                method: 'POST',
                body: {
                    bytes: packetData,
                    responseLength: Number(responseInput.value)
                }
            });
        } finally {
            btn.disabled = false;
        }
    }
});

//* Funções:

// Função responsável por atualizar os labels
function updateLabels(parent) {
    parent.querySelectorAll('.packet-byte').forEach((byte, index) => {
        byte.querySelector('label').textContent = `Byte ${index + 1}`;
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
            add.className = 'add-container relative flex flex-col';
            add.innerHTML = `
                <div class="add-btn border-dashed border-2 border-border rounded-md size-[3.5rem] bg-background p-2 hover:bg-surface-light">
                    <img src="/img/icons/add.svg" class="size-full">
                </div>

                <p class="invisible">add</p>
            `;

            parent.append(add);
        }
    } else addContainer?.remove();
}

//* ======================{ Controle do envio de pacotes }======================