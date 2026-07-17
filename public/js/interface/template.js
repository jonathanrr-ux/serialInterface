import { groupsMap, groupsList, createTemplateInList } from "./template-groups.js";
import { changeInputErrorStatus } from "../utils/input-error.js";
import showToast from "../utils/toast-notifications.js";
import FetchService from "../utils/fetchService.js";
import { ruleList, createRule } from "./rules.js";
import { packetList, changeTab } from "./home.js";
import { createPacket } from "./home.js";

//* ======================{ Variáveis globais }======================

const api = new FetchService();
export let selectedTemplate = null;
export let selectedGroup = null;

// Modal
const templateModal = document.getElementById('template-modal');
const addNewTemplateBtn = document.getElementById('add-new-template');
const groupSelect = document.getElementById('group-select');
const templateNameInput = document.getElementById('template-name-input');
const templateDescriptionInput = document.getElementById('template-description-input');
const saveNewTemplateBtn = document.getElementById('save-new-template-button');

export const editPacketWrapper = document.querySelector('[data-active]');
const saveTemplateBtn = document.getElementById('save-template-button');

//* ======================{ Controle do modal }======================

//* Eventos:

// Adiciona evento de clique ao botão de abrir modal
addNewTemplateBtn.addEventListener('click', () => {
    // Limpa erro
    changeInputErrorStatus({ id: templateNameInput.id, error: false });

    // Cria grupos
    createGroups();

    // Limpa inputs
    templateNameInput.value = '';
    templateDescriptionInput.value = '';
});

// Adiciona evento de clique ao botão de salvar novo template
saveNewTemplateBtn.addEventListener('click', async() => {
    // Valida input
    const hasError = validateModalInputs();
    if(hasError) return;

    // Faz requisição para adicionar template
    const { message, data, success } = await api.request('/api/templates', { method: 'POST', body: { name: templateNameInput.value, description: templateDescriptionInput.value ?? '', group: groupSelect.value } });
    showToast({ type: success ? 'success' : 'error', message });
    if(!success) return;
    
    // Adiciona ao map
    const selectGroup = groupsMap.get(groupSelect.value);
    selectGroup.templates.push(data.template);
    
    // Fecha modal
    const container = groupsList.querySelector(`[data-group-id="${selectGroup.id}"]`);
    createTemplateInList({ template: data.template, group: selectGroup, container: container.querySelector('.templates-list'), creating: true });
    templateModal.close();
})

//* Funções:

// Função responsável por criar os grupos do select
function createGroups() {
    // Limpa lista
    groupSelect.innerHTML = '';
    if(!groupsMap.size === 0) return;

    for(const item of groupsMap.values()) {
        const option = new Option(item.name, item.id);
    
        groupSelect.appendChild(option);
    }
}

// Função responsável por validar inputs do modal
function validateModalInputs() {
    // Limpa erros
    changeInputErrorStatus({ id: templateNameInput.id, error: false });

    const setError = (id, msg) => {
        changeInputErrorStatus({ id, msg });

        return true;
    }

    if(!groupSelect.value) {
        showToast({ message: 'Grupo é obrigatório' });
        return true;
    } 
    if(!templateNameInput.value) setError(templateNameInput.id, 'Nome obrigatório');

    return false;
}

// Função responsável por cuidar dos cliques no template
export async function onTemplateClick({ event, el, group, template }) {
    // Deleta template
    // if (e.target.closest('.menu-btn')) return deleteTemplate(templateEl);

    // Seleciona template
    selectTemplate({ el, group, template });
}

// Função responsável por selecionar o template
function selectTemplate({ el, group ,template }) {
    // Limpa lista
    packetList.innerHTML = '';
    ruleList.innerHTML = '';
    
    // Remove seleção dos elementos
    groupsList.querySelectorAll('[aria-selected="true"]').forEach(el => el.setAttribute('aria-selected', 'false'));

    // Seleciona
    el.setAttribute('aria-selected', 'true');

    // Ativa páginas
    editPacketWrapper.dataset.active = true;
    changeTab({ tab: 'packets' });
    
    // Obtêm o template selecionado
    const selectedGp = groupsMap.get(group.id);
    const selectedTemp = selectedGp.templates.find(t => t.id === template.id);
    
    // Salva o template selecionado
    setSelectedGroup(selectedGp.id);
    setSelectedTemplate(selectedTemp.id);
    
    // Cria regras
    selectedTemp.rules.forEach(rule => { createRule({ rule }) });

    // Cria pacotes
    selectedTemp.packets.forEach(packet => { createPacket({ bytes: packet.bytes.length, values: packet.bytes, pck: packet }) });
}

//* ======================{ Lista }======================

// Adiciona evento de clique ao botão de salvar o template
saveTemplateBtn.addEventListener('click', async() => {
    // Obtêm o container do pacote
    const packetContainer = document.querySelectorAll('.packet-container');

    // Obtêm pacotes
    const packetData = [];
    for (const packet of packetContainer) {
        // Obtêm nome
        const name = packet.querySelector('.packet-name').value;
        const id = packet?.dataset?.id ?? null;

        // Verifica se foi passado nome para os pacote
        if (!name) {
            showToast({ message: "Nome inválido" });
            return;
        }

        // Obtêm os bytes
        const bytes = [...packet.querySelectorAll('.packet .packet-byte input')].map(input => parseInt(input.value, 16));
        packetData.push({ id, name, bytes });
    }

    // Edita template
    await postTemplate({ url: `/api/templates/${selectedTemplate}/group/${selectedGroup}`, method: 'PUT', body: { packet: packetData } });
});

async function postTemplate({ method, url, body }) {
    // Faz requisição para adicionar template
    const { message, success, data } = await api.request(url, { method, body });
    if(!success) {
        showToast({ message });
        return;
    };

    // Mostra mensagem de sucesso
    showToast({ type: 'success', message });
    
    const group = groupsMap.get(selectedGroup);
    const index = group.templates.findIndex(t => t.id === data.template.id);

    if (index !== -1) group.templates[index] = data.template;

    setSelectedTemplate(data.template.id);
    setSelectedGroup(group.id);
    
    return data.template;
}

export function setSelectedTemplate(id) {
    selectedTemplate = id;
}

export function setSelectedGroup(id) {
    selectedGroup = id;
}