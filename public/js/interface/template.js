import FetchService from "../utils/fetchService.js";
import showToast from '../utils/toast-notifications.js';
import { createPacket, packetList } from './home.js';
import CustomSelect from '../utils/custom-select.js';

//* ======================{ Variáveis globais }======================

const api = new FetchService();

const templateNameInput = document.getElementById('template-name-input');
const saveNewTemplateBtn = document.getElementById('save-new-template-button');
const templatesList = document.getElementById('templates-list');
const deleteAllTemplates = document.getElementById('delete-all-templates');
const editPacketWrapper = document.querySelector('[data-active]');
const searchBar = document.getElementById('search-bar');
const addNewTemplate = document.getElementById('add-new-template');
const saveTemplateBtn = document.getElementById('save-template-button');

const templateSelect = new CustomSelect('select-template', { options: [], dropdownMaxHeight: '6rem' });

let templatesMap = new Map();
const colors = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899'
];

//* ======================{ Controle do modal }======================

//* Eventos:

// ADiciona evento de clique ao botão de salvar o template
saveTemplateBtn.addEventListener('click', async() => {
    // Obtêm elemento selecionado
    const selected = templatesList.querySelector('[aria-selected=true]');

    // Pega todos bytes do pacote
    const packets = document.querySelectorAll('.packet');

    // Obtêm pacotes
    const packetData = [...packets].map(packet => {
        const bytes = [...packet.querySelectorAll('.packet-byte input')].map(input => parseInt(input.value, 16));

        return bytes;
    });
    
    // Cria ou edita template
    const template = await postTemplate({ url: `/api/templates/${selected.dataset.id}/edit`, method: 'POST', body: { packet: packetData } });
})

// Adiciona evento de clique ao botão de salvar template
saveNewTemplateBtn.addEventListener('click', async() => {
    // Verifica se está adicionando
    if(!templateNameInput.value) {
        showToast({ message: 'Nome inválido' })
        return;
    }
    
    // Cria ou edita template
    const template = await postTemplate({ url: '/api/templates/save', method: 'POST', body: { name: templateNameInput.value } });

    // Cria template
    createTemplateEl({ item: template });
});

//* ======================{ Controle dos templates }======================

//* Eventos:

// Evento de clique ao botão de adicionar novo template
addNewTemplate.addEventListener('click', () => {
    // Limpa input
    templateNameInput.value = '';
});

// ADiciona evento de input a search bar
searchBar.addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();

    document.querySelectorAll('[data-id]').forEach(el => {
        const template = templatesMap.get(el.dataset.id);

        el.hidden = !template.name.toLowerCase().includes(search);
    })
});

// Adiciona evento de clique ao botão de excluir todos
deleteAllTemplates.addEventListener('click', async() => {
    // Pede confirmação
    if(!confirm('Deseja excluir todos templates?')) return;

    // Faz requisição
    const { success } = await api.request('/api/templates/delete', { method: 'DELETE' });
    if(!success) return;

    // Manda notificação e recarrega templates
    showToast({ type: 'success', message: 'Templates deletados com sucesso' });
    templatesMap.clear();
    editPacketWrapper.dataset.active = false;
    templatesList.innerHTML = '';
});

//* Funções:

// Função responsável por criar os templates
function createTemplatesList({ list }) {
    templatesList.innerHTML = '';
    if(!list.length) return;

    for(const item of list) {
        createTemplateEl({ item });
    }
}

// Função responsável por criar cada template
function createTemplateEl({ item }) {
    // Cria elemento
    const div = document.createElement('div');
    div.className = `template flex justify-between w-full p-5 rounded-xl transition-all duration-300
        bg-linear-to-b from-surface-3 to-surface shadow-[0_8px_24px_rgba(0,0,0,.35),inset_rgba(31,41,55)_1px_1px_1px] 
        hover:-translate-y-1 border border-white/10 hover:border-primary hover:shadow-[0_5px_15px_rgba(99,102,241,.25),inset_1px_1px_1px_rgba(31,41,55,.8)]
        aria-selected:border-primary group`;
    div.setAttribute('aria-selected', false);
    div.dataset.id = item.id;
    div.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full color-dot"></span>
            <p class="text-[0.9em]">${item.name}</p>
        </div>
        <img src='/img/icons/trash.svg' class="menu-btn">
    `;

    // Seta map
    templatesMap.set(item.id, item);

    // Defini uma cor aleatória
    const dot = div.querySelector('.color-dot');
    dot.style.backgroundColor = randomColor();

    // Adiciona ao DOM
    templatesList.appendChild(div);

    div.addEventListener('click', e => onTemplateClick(e, div));
}

// Função responsável por cuidar dos cliques no template
async function onTemplateClick(e, templateEl) {
    // Deleta template
    if (e.target.closest('.menu-btn')) return deleteTemplate(templateEl);

    // Seleciona template
    selectTemplate(templateEl);
}

// Função responsável por deletar template
async function deleteTemplate(templateEl) {
    // Pede confirmação
    if (!confirm('Deseja excluir o template?')) return;

    // Faz requisição para deletar template
    const { message, success } = await api.request(`/api/templates/${templateEl.dataset.id}/delete`, { method: 'DELETE' });
    if (!success) {
        showToast({ message });
        return;
    }

    // Mostra notificação
    showToast({ type: 'success', message });

    // Deleta do Map e el
    templatesMap.delete(templateEl.dataset.id);
    templateEl.remove();

    // Verifica se o elemento estava selecionado
    const wasSelected = templateEl.getAttribute('aria-selected') === 'true';
    if (wasSelected) {
        packetList.innerHTML = '';
        editPacketWrapper.dataset.active = false;
    }
}

// Função responsável por selecionar o template
function selectTemplate(templateEl) {
    // Limpa lista
    packetList.innerHTML = '';

    // Remove seleção dos elementos
    templatesList.querySelectorAll('[aria-selected="true"]').forEach(el => el.setAttribute('aria-selected', 'false'));

    // Seleciona
    templateEl.setAttribute('aria-selected', 'true');
    editPacketWrapper.dataset.active = true;

    // Obtêm o template selecionado
    const template = templatesMap.get(templateEl.dataset.id);

    // Cria pacotes
    template.packets.forEach(packet => { createPacket({ bytes: packet.length, values: packet }) });
}

//* ======================{ Funções auxiliares }======================

async function postTemplate({ method, url, body }) {
    // Faz requisição para adicionar template
    const { message, success, data } = await api.request(url, { method, body });
    if(!success) {
        showToast({ message });
        return;
    };

    // Mostra mensagem de sucesso
    showToast({ type: 'success', message });

    // Cria template
    templatesMap.set(data.template.id, data.template);
    return data.template;
}

// Função responsável por obter templates
async function getTemplates() {
    const { success, data } = await api.request('/api/templates');
    if(!success) return;
    
    // Cria lista de templates
    createTemplatesList({ list: data.templates });

    return data.templates.map(t => ({ value: t.id, name: t.name }));
}

// Pega cor aleatoria
function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

//* ======================{ Inicialização da página }======================

document.addEventListener('DOMContentLoaded', () => {
    getTemplates();
})