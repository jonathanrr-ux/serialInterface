import FetchService from "../utils/fetchService.js";
import showToast from '../utils/toast-notifications.js';
import { createPacket, packetList } from './home.js';
import CustomSelect from '../utils/custom-select.js';

//* ======================{ Variáveis globais }======================

const api = new FetchService();

const addNewTemplateBtn = document.getElementById('add-new-template-button');
const templateNameInput = document.getElementById('template-name-input');
const radioButtons = document.querySelectorAll('input[type="radio"]');
const dataTemplate = document.querySelector('[data-template]');
const saveTemplateBtn = document.getElementById('save-template-button');
export const responseInput = document.getElementById('response-input');
const templatesList = document.getElementById('templates-list');
const deleteAllTemplates = document.getElementById('delete-all-templates');
const searchBar = document.getElementById('search-bar');

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

// Adiciona evento de clique ao botão de adicionar template
addNewTemplateBtn.addEventListener('click', (e) => {
    if(!responseInput.value || responseInput.value == 0) {
        e.preventDefault();
        e.stopPropagation();
        showToast({ message: 'Digite o tamanho da resposta do pacote' });
        return;
    }

    templateSelect.options = [...templatesMap.values()].map(t => ({ value: t.id, name: t.name }))

    // Limpa input
    templateNameInput.value = '';
});

// Adiciona evento a checkbox de change
radioButtons.forEach(r => {
    r.addEventListener('change', function() {
        dataTemplate.dataset.template = this.value; 
    })
});

// Adiciona evento de clique ao botão de salvar template
saveTemplateBtn.addEventListener('click', async() => {
    // Pega todos bytes do pacote
    const packets = document.querySelectorAll('.packet');

    // Obtêm pacotes
    const packetData = [...packets].map(packet => {
        const bytes = [...packet.querySelectorAll('.packet-byte input')].map(input => parseInt(input.value, 16));

        return bytes;
    });

    // Verifica se está adicionando
    const newTemplate = dataTemplate.dataset.template == 'new-template';
    if(newTemplate && !templateNameInput.value) {
        showToast({ message: 'Nome inválido' })
        return;
    }
    
    // Cria ou edita template
    const template = await postTemplate(
        { 
            url: newTemplate ? '/api/templates/save' : `/api/templates/${templateSelect.value}/edit`, 
            method: 'POST', 
            body: newTemplate ? { name: templateNameInput.value, packet: packetData, response: responseInput.value } : { packet: packetData, response: responseInput.value }
        }
    );

    // Cria template
    if(newTemplate) createTemplateEl({ item: template });
});

//* ======================{ Controle dos templates }======================

//* Eventos:

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
    getTemplates();
});

// Adiciona evento de clique a lista de templates
templatesList.addEventListener('click', async function(e) {
    // Obtêm o elemento
    const el = e.target.closest('.template');
    if(!el) return;
    
    packetList.innerHTML = '';

    if(e.target.closest('.menu-btn')) {
        // Verifica confirmação
        if(!confirm('Deseja excluir o template?')) return;

        // Faz requisição
        const { success } = await api.request(`/api/templates/${el.dataset.id}/delete`, { method: 'DELETE' });
        if(!success) return;

        // Remove item
        templatesMap.delete(el.dataset.id)
        el.remove();
        return;
    }

    // Desabilita botão habilitado
    this.querySelectorAll('[aria-selected]').forEach(a => a.setAttribute('aria-selected', false));

    // Adiciona aria selected
    el.setAttribute('aria-selected', true);
    
    // Obtêm o template selecionado
    const selectedTemplate = templatesMap.get(el.dataset.id);
    responseInput.value = selectedTemplate.response;

    selectedTemplate.packets.forEach(p => {
        createPacket({ bytes: p.length, values: p });
    });
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
        hover:-translate-y-1 hover:border-primary hover:shadow-[0_5px_15px_rgba(99,102,241,.25),inset_1px_1px_1px_rgba(31,41,55,.8)]
    aria-selected:border-primary`;
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
    showToast({ type: 'success', message: 'Template salvo com sucesso' });

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