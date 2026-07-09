import FetchService from '../utils/fetchService.js';
import showToast from '../utils/toast-notifications.js';

//* ======================{ Variáveis Globais }======================

const api = new FetchService();

const bytesQuantityInput = document.getElementById('bytes-quantity-input');
const createNewPacketBtn = document.getElementById('create-new-packet');
const packetList = document.getElementById('packet-list');
const logsList = document.getElementById('logs-list');
const templatesList = document.getElementById('templates-list');

// Modal de save template
const dataTemplate = document.querySelector('[data-template]');
const saveTemplateRadio = document.querySelectorAll('[type="radio"]');
const saveTemplateBtn = document.getElementById('save-template-button');
const nameInput = document.getElementById('name-input');
const selectList = document.getElementById('select-list');

const templatesCache = new Map();
let currentTemplateId = null;

//* ======================{ Controle do pop hover }======================

//* Eventos:

// Adiciona evento de clique ao botão de criar novo pacote
createNewPacketBtn.addEventListener('click', () => {
    // Obtêm a quantidade de bytes para criar
    const bytes = Number(bytesQuantityInput.value);

    // Caso seja bytes inválidos, retorna
    if (!bytes || bytes < 1 || bytes > 9) return;
    
    // Cria inputs
    createPacket({ num: bytes });
});

//* Funções:

// Função responsável por criar os inputs dos bytes
function createPacket({ num, values = [] } = {}) {
    // Cria elemento
    const packet = document.createElement('div');
    packet.className = 'flex gap-2';

    // Adiciona a lista
    packetList.appendChild(packet);

    // Bytes
    for (let i = 0; i < num; i++) {
        // Obtêm elemento criado
        const el = createByteField({ index: i, value: values[i] });

        // Adiciona ao DOM
        packet.appendChild(el);
    }

    // Obtêm elemento do botão de excluir
    const deleteBtnEl = createActionButton({ 
        iconSrc: '/img/icons/trash.svg', 
        bgClasses: 'bg-danger hover:bg-danger-hover', 
        onClick: () => packet.remove()
    });
    packet.appendChild(deleteBtnEl);

    // Obtêm elemento do botão de excluir
    const sendBtnEl = createActionButton({
        iconSrc: '/img/icons/send.svg',
        bgClasses: 'bg-primary hover:bg-primary-hover',
        onClick: async () => sendSerialBuffer({ packet: getPacketBytes({ packet }) })
    });
    packet.appendChild(sendBtnEl);
}

// Função responsável por criar o campo de um byte individual, já com validação hexadecimal
function createByteField({ index, value }) {
    const byte = document.createElement('div');
    byte.className = 'flex flex-col w-[4rem] justify-center gap-2';

    // Obtêm o valor hexadecimal
    const hex = value !== undefined ? value.toString(16).toUpperCase().padStart(2, '0') : '00';

    // Cria input
    byte.innerHTML = `
        <p class="text-center text-[0.6em]">Byte ${index + 1}</p>
        <div class="relative size-[4rem] rounded-md bg-background p-1">
            <div class="delete-btn absolute top-1 right-1 text-[0.5em] cursor-pointer">X</div>
            <input type="text" maxlength="2" value="${hex}" class="text-center size-full outline-none">
        </div>
    `;

    // Obtêm inputs
    const input = byte.querySelector('input');

    // Ao sair do campo, garante 2 dígitos preenchidos
    input.addEventListener('blur', () => {
        input.value = input.value ? input.value.padStart(2, '0') : '00';
    });


    // Obtêm inputs
    const deleteBtn = byte.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() { byte.remove() });

    return byte;
}

//* ======================{ Controle da página }======================

//* Funções:

// Função responsável por criar os logs
function createLogs({ mode, arr }) {
    let colors = {
        TX: 'text-primary',
        RX: 'text-success',
        Error: 'text-danger'
    }
    console.log(mode)
    const p = document.createElement('p');
    p.className = 'border-b-2 border-border';
    p.innerHTML = `
        <span class="${colors[mode]} mr-3">${mode}</span> 
        ${arr.map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
    `;
    logsList.appendChild(p);
}

//* ======================{ Controle do modal }======================

//* Eventos:

// Adiciona evento de clique ao template
saveTemplateRadio.forEach(r => {
    r.addEventListener('change', function() {
        dataTemplate.dataset.template = this.value;
    })
});

// Adiciona evento de clique no botão de salvar template
saveTemplateBtn.addEventListener('click', async() => { 
    // Se não houver pacotes, retorna
    if (!packetList.children.length) return;

    // Obtêm os pacotes
    const packet = [...packetList.children].map(packet => getPacketBytes({ packet }));

    // Caso for o template novo
    if(dataTemplate.dataset.template === 'new-template') {
        // Se não tiver nome retorna
        if(!nameInput.value) return;

        // Salva template
        await saveTemplate({ name: nameInput.value.trim(), packet });
        return;
    }

    // Obtêm o selecionado
    const id = selectList.value;
    if (!id) return;

    // Edita template
    await editTemplate({ id, packet });
});

//* Funções:

// Função responsável por editar template
async function editTemplate({ id, packet }) {
    // Faz requisição para salvar novo template
    const { success } = await api.request(`/api/interface/${id}/edit`, { method: 'POST', body: { packet } });
    if(!success) return;

    // Atualiza o template no cache local
    // const item = templatesCache.get(String(id));
    // if (item) item.packets = packet;

    // // Mantém o template como selecionado
    // setActiveTemplate({ id: String(id) });
    // if (item) packetName.textContent = `Pacote ${item.name}`;
}

// Função responsável por salvar template
async function saveTemplate({ name, packet }) {
    // Faz requisição para salvar novo template
    const { success, data } = await api.request('/api/interface/save', { method: 'POST', body: { name, packet } });
    if(!success) return;
    
    // Atualiza cache e listas
    // templatesCache.set(String(data.template.id), data.template);
    // templatesList.appendChild(createItemElement({ item: data.template }));
    // createSelectItem({ item: data.template });

    // nameInput.value = '';
}

//* ======================{ Templates }======================

// Delegação de clique única para toda a lista de templates
templatesList.addEventListener('click', async function(e) {
    // Limpa todos selecionados
    templatesList.querySelector('[aria-selected=true]')?.setAttribute('aria-selected', false);
    
    // Obtêm o item
    const itemEl = e.target.closest('[aria-selected]');
    if (!itemEl) return;

    // Seleciona o elemento
    itemEl.setAttribute('aria-selected', true);

    // if (action === 'toggle-options') {
    //     e.stopPropagation();
    //     return;
    // }

    // if (action === 'delete') {
    //     e.stopPropagation();
    //     await deleteTemplate({ id });
    //     return;
    // }

    // Clique no item carrega o template no editor de pacotes
    loadTemplate({ id: itemEl.dataset.id });
});

// Carrega os pacotes de um template no editor
function loadTemplate({ id }) {
    // Obtêm o template
    const item = templatesCache.get(String(id));
    if (!item) return;

    // Limpa lista
    packetList.innerHTML = '';

    for (const byte of item.packets) createPacket({ num: byte.length, values: byte });
}

// Função responsável por obter templates
async function getTemplates() {
    const { message, success, data } = await api.request('/api/interface/templates');
    if(!success) return;

    // Cria lista de templates
    createTemplatesList({ list: data.templates });

    // Cria lista do select
    // createSelectList({ list: data.templates })
}

// Função responsável por criar os templates
function createTemplatesList({ list }) {
    // Limpa lista
    templatesList.innerHTML = ''; 
    templatesCache.clear();

    // Se não tiver lista, retorna
    if(!list.length) return;

    for(const item of list) {
        // Adiciona templates ao Map
        templatesCache.set(item.id, item);

        // Adiciona itens
        templatesList.appendChild(createItemElement({ item }));
    } 
}

// Função responsável por criar o elemento visual de um item de template
function createItemElement({ item }) {
    const div = document.createElement('div');
    div.className = 'flex justify-between w-full border-2 border-border p-3 rounded-md bg-surface-light aria-selected:border-primary aria-selected:shadow-lg aria-selected:shadow-primary/30';
    div.dataset.id = item.id;
    div.setAttribute('aria-selected', false);
    div.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            <p class="text-[0.9em]">${item.name}</p>
        </div>
        <p>⋮</p>

        <div class="popover hidden absolute right-0 w-32 bg-white border rounded shadow-lg z-50">
            <button class="text-[0.7em] delete-template w-full text-left px-3 py-2 hover:bg-red-100 text-danger" data-action="delete">
                Excluir
            </button>
        </div>
    `;

    return div;
}

//* ======================{ Funções auxiliares }======================

// Função responsável por enviar o buffer
async function sendSerialBuffer({ packet }) {
    if(!packet) return;
    
    // Sempre transforma em array
    const packets = Array.isArray(packet[0]) ? packet : [packet];
    
    // Faz requisição POST para enviar os bytes
    const { message, success, data } = await api.request('/api/serial/send', { method: 'POST', body: { bytes: packets } });
    if(!success) {
        showToast({ message });
        return;
    } 
    
    for(const arr of packets) {
        createLogs({ mode: 'TX', arr });
    }
}

// Função responsável por criar um botão de ação
function createActionButton({ iconSrc, bgClasses, onClick }) {
    // Cria elemento
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col w-[4rem] justify-end gap-2';
    wrapper.innerHTML = `
        <img src="${iconSrc}" class="rounded-md p-2 ${bgClasses}">
    `;

    // Adiciona evento de clique
    wrapper.addEventListener('click', onClick);

    // Retorna elemento criado
    return wrapper;
}

// Função responsável por obter os pacotes digitados
function getPacketBytes({ packet }) {
    // Retorna os bytes
    return [...packet.querySelectorAll('input')].map(input => {
        // Obtêm o valor
        const value = input.value.trim();

        // Obtêm os bytes
        const byte = Number.parseInt(value, 16);

        // Retorna
        return Number.isNaN(byte) ? 0 : byte;
    });
}

//* ======================{ Inicialização da página }======================

document.addEventListener('DOMContentLoaded', () => {
    getTemplates();
})