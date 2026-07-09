import FetchService from '../utils/fetchService.js';
const source = new EventSource('/api/guest/serial/events');

//* ======================{ Variáveis Globais }======================

const sendAllBtn = document.getElementById('send-all-button');
const packetName = document.getElementById('packet-name');
const receivedList = document.getElementById('received-list');


const api = new FetchService();

//* ======================{ Controle do pop hover }======================

//* Eventos:

//* Funções:



//* ======================{ Controle do modal }======================







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



// Fecha qualquer popover aberto ao clicar fora
document.addEventListener('click', () => closeAllPopovers({}));

//* Funções:







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




source.onmessage = event => {
    // Limpa lista
    receivedList.innerHTML = '';

    // Transforma data em JSOn
    const data = JSON.parse(event.data);
    
    // Transforma em array
    const packets = Array.isArray(data.bytes[0]) ? data.bytes : [data.bytes];

    for(const item of packets) {
        // Texto dos logs
        const logText = `Recebido: ${item.map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ')}`;

        // Texto do recebido
        const receivedText = `${item.map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ')}`;

        const log = document.createElement('p');
        log.textContent = logText;

        const received = document.createElement('p');
        received.textContent = receivedText;

        logsList.appendChild(log);
        receivedList.appendChild(received);
    }
};