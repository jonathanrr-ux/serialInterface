import { groupsMap, groupsList, clearInputError, expandGroup } from "./groups.js";
import { changeInputErrorStatus } from "../utils/input-error.js";
import showToast from "../utils/toast-notifications.js";
import FetchService from "../utils/fetchService.js";
import { ruleList, createRule } from "./rules.js";
import { packetList, changeTab } from "./home.js";
import { createPacket } from "./home.js";
import { createAutoSend, autoSendList } from "./auto-send.js";

//* ======================{ Variáveis globais }======================

const api = new FetchService();
export const templatesMap = new Map();
export const templateContentMap = new Map();

export let selectedTemplate = null;
export let selectedGroup = null;
let selectedTemplateMenu = null;
let selectedTemplateElement = null;
let selectTemplateGroup = null;

// Modal
const templateModal = document.getElementById('template-modal');
const modalTitle = templateModal.querySelector('.title');
const addNewTemplateBtn = document.getElementById('add-new-template');
const groupSelect = document.getElementById('group-select');
const templateNameInput = document.getElementById('template-name-input');
const templateDescriptionInput = document.getElementById('template-description-input');
const saveNewTemplateBtn = document.getElementById('save-new-template-button');

// Pop over
const popover = document.getElementById("popover");
const deleteTemplate = popover.querySelector('.delete-button');
const editTemplate = popover.querySelector('.edit-button');
const moveTemplate = popover.querySelector('.move-button');
const copyTemplate = popover.querySelector('.copy-button');

export const editPacketWrapper = document.querySelector('[data-active]');
const saveTemplateBtn = document.getElementById('save-template-button');

const titles = {
    add: "Adicionar template",
    edit: "Editar template",
    move: "Mover template"
}

//* ======================{ Controle do modal }======================

//* Eventos:

// Adiciona evento de clique ao botão de abrir modal
addNewTemplateBtn.addEventListener('click', () => {
    // Abre modal
    openModal();
});

// Adiciona evento de clique ao botão de salvar novo template
saveNewTemplateBtn.addEventListener('click', async() => {
    // Obtêm estado do modal
    const isEditing = templateModal.dataset.modal === 'edit';
    const isMoving = templateModal.dataset.modal === 'move';
    const isUpdate = isEditing || isMoving;

    // Monta requisição
    const request = {
        url: isUpdate ? `/api/templates/${templatesMap.get(selectedTemplateMenu).id}` : '/api/templates',
        method: isUpdate ? 'PUT': 'POST',
        body: { groupId: groupSelect.value }
    }

    // Valida input
    if(!isMoving) {
        // Verifica erros
        const hasError = validateModalInputs();
        if(hasError) return;

        // Adiciona campos da requisição
        request.body.name = templateNameInput.value;
        request.body.description = templateDescriptionInput.value ?? "";
    }
    
    // Faz requisição
    const { success, data } = await fetchAuxiliar({ ...request });
    if(!success) return;
    
    // Atualiza o Map
    const oldGroupId = selectTemplateGroup?.id;

    templatesMap.set(data.template.id, data.template);

    if(oldGroupId) updateTemplateCount(oldGroupId);
    updateTemplateCount(data.template.group_id);

    // Caso esteja editando, remove o elemento para ser criado novamente
    if(isUpdate) selectedTemplateElement.remove();
    
    // Recria na lista
    const container = groupsList.querySelector(`[data-group-id="${data.template.group_id}"]`);
    if(!container) return;

    createTemplateInList({ 
        template: data.template, 
        group: groupsMap.get(data.template.group_id), 
        container: container.querySelector('.templates-list'), 
        creating: !isUpdate,
        expand: true,
        keepSelected: isMoving
    });

    // Fecha modal
    templateModal.close();
});

//* Funções:

// Função responsável por abrir o modal
function openModal({ type = 'add', name = '', description = '', group = '' } = {}) {
    // Atualiza dataset
    templateModal.dataset.modal = type;

    // Limpa erro
    if(type !== 'move') clearInputError({ inputs: [templateNameInput, templateDescriptionInput] });

    // Cria grupos
    createGroups();

    // Atualiza valores
    templateNameInput.value = name;
    templateDescriptionInput.value = description;
    groupSelect.value = group;

    // Atualiza titulo do modal
    modalTitle.textContent = titles[type];

    // Mostra modal
    templateModal.showModal();
}

// Função responsável por criar os grupos do select
function createGroups() {
    // Limpa lista
    groupSelect.innerHTML = '';
    if(groupsMap.size === 0) return;

    for(const item of groupsMap.values()) {
        const option = new Option(item.name, item.id);
    
        groupSelect.appendChild(option);
    }
}

// Função responsável por validar inputs do modal
function validateModalInputs() {
    // Limpa erros
    clearInputError({ inputs: [templateNameInput, templateDescriptionInput] });
    groupSelect.classList.remove('!border-danger');

    // Função para setar erro
    const setError = (id, msg) => {
        changeInputErrorStatus({ id, msg });

        return true;
    }

    if(!groupSelect.value) {
        groupSelect.classList.add('!border-danger');
        return true;
    } 
    if(!templateNameInput.value) return setError(templateNameInput.id, 'Nome obrigatório');
    if(templateNameInput.value.length > 40) return setError(templateNameInput.id, 'Nome deve conter no máximo 40 caracteres');

    if(templateDescriptionInput && templateDescriptionInput.value.length > 100) return setError(templateDescriptionInput.id, 'Descrição deve conter no máximo 100 caracteres');

    return false;
}

//* ======================{ Controle da lista }======================

// Função responsável por criar o template na lista
export async function createTemplateInList({ template, group, container, creating = false, expand = false, keepSelected = false }) {
    if (expand) expandGroup(group.id);
    
    const div = document.createElement('div');
    div.className = 'template flex gap-3 items-center group-color z-20';
    div.dataset.templateId = template.id;
    div.dataset.name = template.name.toLowerCase();
    div.setAttribute('aria-selected', selectedTemplate === template.id);
    div.style.setProperty('--group-color', group.color);
    div.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="shrink-0 size-3 rounded-full inline-block" style="background-color: var(--group-color); box-shadow: 0 0 8px var(--group-color);"></span>
            <div>
                <p class="text-[0.7em] font-bold break-all">${template.name}</p>
                <p class="text-[0.6em] text-text-secondary break-normal">${template.description ?? ''}</p>
            </div>
        </div>
        <img src="/img/icons/more.svg" class="menu-btn cursor-pointer size-[2rem]">
    `;

    container.appendChild(div);

    if(creating || keepSelected) await activateTemplate({ el: div, group, template });
    
    div.addEventListener('click', e => { onTemplateClick({ event: e, el: div, group: groupsMap.get(group.id), template: templatesMap.get(template.id) }) });
}

// Função responsável por cuidar dos cliques no template
export async function onTemplateClick({ event, el, group, template }) {
    // Opções template
    if (event.target.closest('.menu-btn')) return templateOptions({ el, event, template, group });

    // Seleciona template
    selectTemplate({ el, group, template });
}

// Função responsável por selecionar o template
async function selectTemplate({ el, group ,template }) {
    await activateTemplate({ el, group, template });
}

async function activateTemplate({ el, group, template }) {
    // Limpa listas
    packetList.innerHTML = '';
    ruleList.innerHTML = '';
    autoSendList.innerHTML = '';

    // Salva seleção
    setSelectedGroup(group.id);
    setSelectedTemplate(template.id);

    // Carrega conteúdo
    await getTemplateContent({ templateId: template.id });

    // Remove seleção antiga
    groupsList.querySelectorAll('[aria-selected="true"]').forEach(item => item.setAttribute('aria-selected', 'false'));

    // Seleciona elemento atual
    if (el) el.setAttribute('aria-selected', 'true');

    // Abre editor
    editPacketWrapper.dataset.active = true;
    changeTab({ tab: 'packets' });
}

// Função responsável por obter o conteúdo do template
async function getTemplateContent({ templateId }) {
    let data = templateContentMap.get(templateId);
    
    if (!data) {
        // Faz requisição
        const response = await fetchAuxiliar({ url: `/api/templates/${templateId}/content`, toast: false });
        if (!response.success) return;

        data = response.data;

        // Atualiza Map
        templateContentMap.set(templateId, response.data);
    }
    
    data.packets.forEach(packet => {
        // Cria pacotes
        createPacket({ bytes: packet.bytes.length, values: packet.bytes, pck: packet });
    });

    data.rules.forEach(rule => {
        // Cria regras
        createRule({ rule });
    });

    data.autoSends.forEach(a => {
        createAutoSend({ autoSend: a });
    })
}

//* ======================{ Controle do pop over da lista }======================

//* Eventos:

// Adiciona evento de clique ao botão de excluir template
deleteTemplate.addEventListener("click", async () => {
    const template = templatesMap.get(selectedTemplateMenu);

    if (!template) return;
    if (!confirm("Deseja excluir este template?")) return;

    // Faz requisição para excluir o template
    const { success } = await fetchAuxiliar({ url: `/api/templates/${template.id}`, method: 'DELETE' });
    if(!success) return;

    // remove do DOM
    selectedTemplateElement.remove();

    // Remove do Map
    templatesMap.delete(template.id);
    templateContentMap.delete(template.id);
    updateTemplateCount(template.group_id);

    // Caso o template excluido esteja selecionado
    if (selectedTemplate === template.id) {
        setSelectedTemplate(null);
        setSelectedGroup(null);

        packetList.innerHTML = "";
        ruleList.innerHTML = "";

        editPacketWrapper.dataset.active = false;
        changeTab({ tab: 'groups' });
    }

    selectedTemplateMenu = null;
    selectedTemplateElement = null;
    selectTemplateGroup = null;

    // Esconde pop over
    popover.classList.add("hidden");
});

// Abre modal de edição de template
editTemplate.addEventListener('click', () => {
    const template = templatesMap.get(selectedTemplateMenu);

    // Abre modal
    openModal({ type: 'edit', name: template.name, description: template.description, group: template.group_id });
});

// Adiciona evento de clique ao botão de mover template
moveTemplate.addEventListener('click', () => {
    const template = templatesMap.get(selectedTemplateMenu);

    // Abre modal
    openModal({ type: 'move', group: template.group_id });
})

copyTemplate.addEventListener('click', async() => {
    // Obtêm o template
    const template = templatesMap.get(selectedTemplateMenu);
    if (!template) return;

    // Faz requisição
    const { success, data } = await fetchAuxiliar({ url: `/api/templates/${template.id}/copy`, method: 'POST', body: { groupId: template.group_id } });
    if (!success) return;

    // Obtêm o novo template
    const newTemplate = data.template;

    // Seta Map
    templatesMap.set(newTemplate.id, newTemplate);

    // Cria template
    const container = groupsList.querySelector(`[data-group-id="${newTemplate.group_id}"] .templates-list`);
    createTemplateInList({
        template: newTemplate,
        group: groupsMap.get(newTemplate.group_id),
        container,
        creating: true,
        expand: true
    });

    popover.classList.add('hidden');
});

//* Funções:

// Função responsável pelo controle do pop over
function templateOptions({ el, event, template, group }) {
    // Evento de clique
    event.stopPropagation();
    
    // Salva elementos selecionados
    selectedTemplateMenu = template.id;
    selectedTemplateElement = el;
    selectTemplateGroup = group;
    
    // Obtêm rect
    const rect = event.target.getBoundingClientRect();

    // Adiciona posições
    popover.style.left = `${rect.right - popover.offsetWidth}px`;
    popover.style.top = `${rect.bottom}px`;

    // Mostra pop over
    popover.classList.remove("hidden");
}

//* ======================{ Página de pacotes }======================

//* Eventos:

// Adiciona evento de clique ao botão de salvar o template
saveTemplateBtn.addEventListener('click', async() => {
    // Obtêm os pacotes
    const packetData = getPackets();
    if(!packetData) return;

    // Salva os pacotes
    savePackets({ packets: packetData });
});

//* Funções:

// Função responsável por obter os pacotes
function getPackets() {
    // Obtêm o container do pacote
    const packetContainer = document.querySelectorAll('.packet-container');

    // Obtêm pacotes
    const packetData = [];
    packetContainer.forEach((packet, index) => {
        // Obtêm nome
        const name = packet.querySelector('.packet-name').value;
        const id = packet?.dataset?.id ?? null;

        // Verifica se foi passado nome para os pacote
        if (!name) {
            showToast({ message: "Nome inválido" });
            return null;
        }

        // Obtêm os bytes
        const bytes = [...packet.querySelectorAll('.packet .packet-byte input')].map(input => parseInt(input.value, 16));
        packetData.push({ id, name, bytes, order: index });
    });

    // Retorna os pacotes
    return packetData;
}

// Função responsável por salvar os pacotes
async function savePackets({ packets }) {
    // Faz requisição para editar o pacote
    const { data, success } = await fetchAuxiliar({ url: `/api/templates/${selectedTemplate}/packets`, method: 'PUT', body: { packets } });
    if(!success) return;

    // Atualiza pacotes
    const template = templateContentMap.get(selectedTemplate);
    if (template) template.packets = data.packets;
}

//* ======================{ Funções auxiliares }======================

// Função responsável por obter os templates
async function getTemplates() {
    // Faz requisição para obter os templates
    const { success, data } = await fetchAuxiliar({ url: '/api/templates', toast: false });
    if(!success) return;

    data.templateList.forEach(t => {
        // Salva templates no Map
        templatesMap.set(t.id, t);

        // Obtêm container do grupo
        const container = groupsList.querySelector(`[data-group-id="${t.group_id}"] .templates-list`);

        // Cria os templates
        createTemplateInList({ template: t, group: groupsMap.get(t.group_id), container });

        // Atualiza contador inicial
        updateTemplateCount(t.group_id);
    })
}

// Função responsável por atualizar template
export async function fetchAuxiliar({ method, url, body, toast = true }) {
    // Faz requisição para atualizar template
    const response = await api.request(url, { method, body });
    
    // Verifica resposta
    if (!response.success && toast) showToast({ message: response.message });
    else if(toast) showToast({ type: "success", message: response.message });

    return response;
}

function updateTemplateCount(groupId) {
    const total = [...templatesMap.values()].filter(template => template.group_id === groupId).length;

    const groupElement = document.querySelectorAll(`[data-group-id="${groupId}"]`);

    for(const group of groupElement) {
        const tempLength = group.querySelector(".templates-length");
        if(!tempLength) continue;
            
        tempLength.textContent = `(${total})`;
    }
}

// Função responsável por atualizar o template selecionado
export function setSelectedTemplate(id) {
    selectedTemplate = id;
}

// Função responsável por atualizar o grupo selecionado
export function setSelectedGroup(id) {
    selectedGroup = id;
}

// Função responsável por iniciar os templates
export async function initTemplates() {
    await getTemplates();
}
