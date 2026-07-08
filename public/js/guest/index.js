import FetchService from '../utils/fetchService.js';

//* ======================{ Variáveis Globais }======================

const createNewPacketBtn = document.getElementById('create-new-packet');
const bytesQuantityInput = document.getElementById('bytes-quantity-input');
const packetList = document.getElementById('packet-list');
const sendAllBtn = document.getElementById('send-all-button');
const templatesList = document.getElementById('templates-list');
const packetName = document.getElementById('packet-name');
const logsList = document.getElementById('logs-list');

// Modal de save template
const dataTemplate = document.querySelector('[data-template]');
const saveTemplateRadio = document.querySelectorAll('[type="radio"]');
const saveTemplateBtn = document.getElementById('save-template-button');
const nameInput = document.getElementById('name-input');
const selectList = document.getElementById('select-list');

const api = new FetchService();
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

// Função responsável por criar o campo de um byte individual, já com validação hexadecimal
function createByteField({ index, value }) {
    const byte = document.createElement('div');
    byte.className = 'flex flex-col w-20 gap-1';

    // Obtêm o valor hexadecimal
    const hex = value !== undefined ? value.toString(16).toUpperCase().padStart(2, '0') : '00';

    // Cria input
    byte.innerHTML = `
        <label class="block text-[0.7em] text-text-secondary">Byte ${index + 1}</label>
        <input maxlength="2" value="${hex}" class="rounded-lg border border-border bg-background p-3 text-center outline-none focus:border-primary">
    `;

    // Obtêm inputs
    const input = byte.querySelector('input');

    // Ao sair do campo, garante 2 dígitos preenchidos
    input.addEventListener('blur', () => {
        input.value = input.value ? input.value.padStart(2, '0') : '00';
    });

    return byte;
}

// Função responsável por criar um botão de ação
function createActionButton({ iconSrc, bgClasses, onClick }) {
    // Cria elemento
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col w-20 gap-1';
    wrapper.innerHTML = `
        <label class="invisible">.</label>
        <div class="h-[3.5rem] w-full cursor-pointer rounded-lg ${bgClasses} transition">
            <img src="${iconSrc}" class="size-full p-2">
        </div>
    `;

    // Adiciona evento de clique
    wrapper.addEventListener('click', onClick);

    // Retorna elemento criado
    return wrapper;
}

// Função responsável por criar os inputs dos bytes
function createPacket({ num, values = [] } = {}) {
    // Cria elemento
    const packet = document.createElement('div');
    packet.className = 'flex w-full items-end gap-2';

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

//* ======================{ Controle do modal }======================

//* Eventos:

// Adiciona evento de clique ao template
saveTemplateRadio.forEach(r => {
    r.addEventListener('change', function() {
        dataTemplate.dataset.template = this.value;

        if (this.value !== 'new-template' && currentTemplateId) {
            selectList.value = currentTemplateId;
        }
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
    const { success } = await api.request(`/api/guest/${id}/edit`, { method: 'POST', body: { packet } });
    if(!success) return;

    // Atualiza o template no cache local
    const item = templatesCache.get(String(id));
    if (item) item.packets = packet;

    // Mantém o template como selecionado
    setActiveTemplate({ id: String(id) });
    if (item) packetName.textContent = `Pacote ${item.name}`;
}

// Função responsável por salvar template
async function saveTemplate({ name, packet }) {
    // Faz requisição para salvar novo template
    const { success, data } = await api.request('/api/guest/save', { method: 'POST', body: { name, packet } });
    if(!success) return;
    
    // Atualiza cache e listas
    templatesCache.set(String(data.template.id), data.template);
    templatesList.appendChild(createItemElement({ item: data.template }));
    createSelectItem({ item: data.template });

    nameInput.value = '';
}

// Função responsável por criar a lista do select
function createSelectList({ list }) {
    selectList.innerHTML = '';
    if(!list.length) return;
    
    // Cria select
    for(const item of list) createSelectItem({ item })
}

function createSelectItem({ item }) {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;

    selectList.appendChild(option);
}

//* ======================{ Controle da página }======================

//* Eventos:

// Adiciona evento de clique ao botão de enviar buffer
sendAllBtn.addEventListener('click', async () => {
    // Caso esteja vazio retorna
    if (packetList.children.length === 0) return;

    // Obtêm pacote
    const packet = [...packetList.children].map(packet => getPacketBytes({ packet }));

    // Manda pacote
    await sendSerialBuffer({ packet });
});

// Delegação de clique única para toda a lista de templates
templatesList.addEventListener('click', async (e) => {
    // Obtêm o item
    const itemEl = e.target.closest('[data-id]');
    if (!itemEl) return;

    // Obtêm id e action
    const id = itemEl.dataset.id;
    const action = e.target.dataset.action;
    currentTemplateId = id;

    if (action === 'toggle-options') {
        e.stopPropagation();
        closeAllPopovers({ except: itemEl.querySelector('.popover') });
        itemEl.querySelector('.popover').classList.toggle('hidden');
        return;
    }

    if (action === 'delete') {
        e.stopPropagation();
        await deleteTemplate({ id });
        return;
    }

    // Clique no item carrega o template no editor de pacotes
    loadTemplate({ id });
});

// Fecha qualquer popover aberto ao clicar fora
document.addEventListener('click', () => closeAllPopovers({}));

//* Funções:

// Função responsável por criar os templates
function createTemplatesList({ list }) {
    // Limpa lista
    templatesList.innerHTML = ''; 
    templatesCache.clear();

    // Se não tiver lista, retorna
    if(!list.length) return;

    for(const item of list) {
        templatesCache.set(String(item.id), item);
        templatesList.appendChild(createItemElement({ item }));
    } 

    if (currentTemplateId) setActiveTemplate({ id: currentTemplateId });
}

// Função responsável por criar o elemento visual de um item de template
function createItemElement({ item }) {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between w-full h-[3.5rem] border-2 rounded-md px-5 font-bold bg-background border-border hover:bg-surface-light cursor-pointer';
    div.dataset.id = item.id;
    div.innerHTML = `
        <p class="font-bold">${item.name}</p>
        <div class="relative">
            <button class="template-options rounded p-1" data-action="toggle-options">⋮</button>

            <div class="popover hidden absolute right-0 w-32 bg-white border rounded shadow-lg z-50">
                <button class="text-[0.7em] delete-template w-full text-left px-3 py-2 hover:bg-red-100 text-danger" data-action="delete">
                    Excluir
                </button>
            </div>
        </div>
    `;

    return div;
}

// Carrega os pacotes de um template no editor
function loadTemplate({ id }) {
    // Obtêm o template
    const item = templatesCache.get(String(id));
    if (!item) return;

    // Limpa lista
    packetList.innerHTML = '';
    packetName.textContent = `Pacote ${item.name}`;

    for (const byte of item.packets) createPacket({ num: byte.length, values: byte });
}

// Define ou limpa, se chamado sem id qual template está selecionado,
function setActiveTemplate({ id } = {}) {
    currentTemplateId = id ?? null;

    // Remove destaque de todos os itens
    templatesList.querySelectorAll('[data-id]').forEach(el => {
        el.classList.remove('bg-primary/10', 'border-primary');
    });

    // Aplica destaque no item selecionado, se houver
    if (currentTemplateId) {
        templatesList.querySelector(`[data-id="${currentTemplateId}"]`)
            ?.classList.add('bg-primary/10', 'border-primary');
    }
}

// Exclui um template (após confirmação)
async function deleteTemplate({ id }) {
    const item = templatesCache.get(String(id));
    if (!item) return;

    // Pede confirmação
    if (!confirm(`Excluir "${item.name}"?`)) return;

    const { success } = await api.request(`/api/guest/${id}/delete`, { method: 'DELETE' });
    if (!success) return;

    // Remove do cache e das listas
    templatesCache.delete(String(id));
    templatesList.querySelector(`[data-id="${id}"]`)?.remove();
    selectList.querySelector(`option[value="${id}"]`)?.remove();

    // Se esse template estava aberto, limpa a tela
    if (currentTemplateId === String(id)) {
        setActiveTemplate({});
        packetList.innerHTML = '';
        packetName.textContent = 'Pacote manual';
    }
}

//* ======================{ Funções auxiliares }======================

function closeAllPopovers({ except } = {}) {
    templatesList.querySelectorAll('.popover').forEach(popover => {
        if (popover !== except) popover.classList.add('hidden');
    });
}

// Função responsável por obter templates
async function getTemplates() {
    const { message, success, data } = await api.request('/api/guest/templates');
    if(!success) return;

    // Cria lista de templates
    createTemplatesList({ list: data.templates });

    // Cria lista do select
    createSelectList({ list: data.templates })
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

// Função responsável por enviar o buffer
async function sendSerialBuffer({ packet }) {
    if(!packet) return;
    
    // Sempre transforma em array
    const packets = Array.isArray(packet[0]) ? packet : [packet];
    
    // Faz requisição POST para enviar os bytes
    const { message, success, data } = await api.request('/api/guest/send', { method: 'POST', body: { bytes: packets } });
    if(!success) return;
    
    for(const arr of packets) {
        const p = document.createElement('p');
        p.textContent = `Enviado: ${arr.map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ')}`;
        logsList.appendChild(p);
    }
}

//* ======================{ Inicialização da página }======================

document.addEventListener('DOMContentLoaded', () => {
    getTemplates();
})