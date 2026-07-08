import FetchService from '../utils/fetchService.js';

//* ======================{ Variáveis Globais }======================

const createNewPacketBtn = document.getElementById('create-new-packet');
const bytesQuantityInput = document.getElementById('bytes-quantity-input');
const packetList = document.getElementById('packet-list');
const sendAllBtn = document.getElementById('send-all-button');
const templatesList = document.getElementById('templates-list');
const packetName = document.getElementById('packet-name');

// Modal de save template
const dataTemplate = document.querySelector('[data-template]');
const saveTemplateRadio = document.querySelectorAll('[type="radio"]');
const saveTemplateBtn = document.getElementById('save-template-button');
const nameInput = document.getElementById('name-input');
const selectList = document.getElementById('select-list');

const api = new FetchService();
const clickedTemplate = null;

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
    packet.className = 'flex w-full items-end gap-2';

    // Adiciona a lista
    packetList.appendChild(packet);

    // Bytes
    for (let i = 0; i < num; i++) {
        // Cria elemento
        const byte = document.createElement('div');
        byte.className = 'flex flex-col w-20 gap-1';
        byte.innerHTML = `
            <label class="block text-[0.7em] text-text-secondary">Byte ${i + 1}</label>
            <input maxlength="2" value="${values.length ? values[i].toString(16).toUpperCase().padStart(2, '0') : '00'}" class="rounded-lg border border-border bg-background p-3 text-center outline-none focus:border-primary">
        `;

        // Adiciona
        packet.appendChild(byte);
    }

    // Cria elemento de remover
    const remove = document.createElement('div');
    remove.className = 'flex flex-col w-20 gap-1';

    // Adiciona ícone
    remove.innerHTML = `
        <label class="invisible">.</label>
        <div class="h-[3.5rem] w-full cursor-pointer rounded-lg bg-danger transition hover:bg-danger-hover">
            <img src="/img/icons/trash.svg" class="size-full p-2">
        </div>
    `;

    // Adiciona evento de clique ao botão de remover
    remove.addEventListener('click', () => packet.remove());
    packet.appendChild(remove);

    // Cria elemento de enviar
    const send = document.createElement('div');
    send.className = 'flex flex-col w-20 gap-1';

    // Adiciona ícone
    send.innerHTML = `
        <label class="invisible">.</label>
        <div class="h-[3.5rem] w-full cursor-pointer rounded-lg bg-primary transition hover:bg-primary-hover">
            <img src="/img/icons/send.svg" class="size-full p-2">
        </div>
    `;

    // Adiciona evento de clique ao botão de enviar
    send.addEventListener('click', async () => {
        await sendSerialBuffer({ packet: getPacketBytes({ packet }) });
    });
    packet.appendChild(send);
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
    // Obtêm os pacotes
    const packet = [...packetList.children].map(packet => getPacketBytes({ packet }));

    // Caso for o template novo
    if(dataTemplate.dataset.template === 'new-template') {
        // Se não tiver nome retorna
        if(!nameInput.value) return;

        // Salva template
        await saveTemplate({ name: nameInput.value, packet });

        return;
    }

    // Obtêm o selecionado
    const id = selectList.value;

    // Edita template
    await editTemplate({ id, packet });
});

//* Funções:

async function editTemplate({ id, packet }) {
    // Faz requisição para salvar novo template
    const { message, success } = await api.request(`/api/guest/${id}/edit`, { method: 'POST', body: { packet } });
    if(!success);

    // Recarrega templates
    getTemplates();

    packetList.innerHTML = '';
    packetName.textContent = 'Pacote manual';
}

// Função responsável por salvar template
async function saveTemplate({ name, packet }) {
    // Faz requisição para salvar novo template
    const { message, success, data } = await api.request('/api/guest/save', { method: 'POST', body: { name, packet } });
    if(!success);
    
    // Cria item
    createItem({ item: data.template });
    console.log(data.template)
    createSelectItem({ item: data.template})
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

//* Funções:

// Função responsável por criar os templates
function createTemplatesList({ list }) {
    // Limpa lista
    templatesList.innerHTML = '';

    // Se não tiver lista, retorna
    if(!list) return;

    for(const item of list) createItem({ item });
}

// Função responsável por criar um novo item
function createItem({ item }) {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between w-full h-[3.5rem] border-2 rounded-md px-5 font-bold bg-background border-border hover:bg-surface-light';
    div.dataset.id = item.id;
    div.innerHTML = `
        <p class="font-bold">${item.name}</p>
        <button class="template-options rounded p-1 hover:bg-black/10">⋮</button>
    `;

    // Clique
    div.addEventListener('click', function(e) {
        e.stopPropagation();

        // Limpa lista
        packetList.innerHTML = '';

        packetName.textContent = `Pacote ${item.name}`;

        for(const byte of item.packets) {
            // Cria pacote
            createPacket({ num: byte.length, values: byte });
        }
    });

    const templateOptions = div.querySelector('.template-options');
    templateOptions.addEventListener('click', function() {

    });

    templatesList.appendChild(div);
}

//* ======================{ Funções auxiliares }======================

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
    const packets = Array.isArray(packet) ? packet : [packet];
    
    // Faz requisição POST para enviar os bytes
    const { message, success, data } = await api.request('/api/guest/send', { method: 'POST', body: { bytes: packets } });
    if(!success) return;

    //TODO logs
}

//* ======================{ Inicialização da página }======================

document.addEventListener('DOMContentLoaded', () => {
    getTemplates();
})