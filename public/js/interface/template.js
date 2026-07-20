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

    // Valida input
    if(!isMoving) {
        const hasError = validateModalInputs();
        if(hasError) return;
    }
    
    // Faz requisição
    const response = await updateTemplate({ 
        url: isEditing || isMoving ? `/api/templates/${selectedTemplateMenu.id}/group/${selectTemplateGroup.id}` : '/api/templates', 
        method: isEditing || isMoving ? 'PUT' : 'POST',
        body: isMoving 
            ? { newGroupId: groupSelect.value } 
            : { name: templateNameInput.value, description: templateDescriptionInput.value ?? '', newGroupId: groupSelect.value } 
    });
    if(!response.success) return;

    // Atualiza o Map
    const group = upsertTemplate({ 
        oldGroupId: isEditing || isMoving ? selectTemplateGroup.id : null,
        newGroupId: groupSelect.value,
        template: response.data.template 
    });

    // Caso esteja editando, remove o elemento para ser criado novamente
    if(isEditing || isMoving) selectedTemplateElement.remove();
    
    // Recria na lista
    const container = groupsList.querySelector(`[data-group-id="${group.id}"]`);
    createTemplateInList({ 
        template: response.data.template, 
        group, 
        container: container.querySelector('.templates-list'), 
        creating: isEditing || isMoving ? false : true
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
    changeInputErrorStatus({ id: templateNameInput.id, error: false });

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
    if(!templateNameInput.value) return setError(templateNameInput.id, 'Nome obrigatório');

    return false;
}

//* ======================{ Controle da lista }======================

// Função responsável por cuidar dos cliques no template
export async function onTemplateClick({ event, el, group, template }) {
    // Opções template
    if (event.target.closest('.menu-btn')) return templateOptions({ el, event, template, group });

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

//* ======================{ Controle do pop over da lista }======================

//* Eventos:

// Adiciona evento de clique ao botão de excluir template
deleteTemplate.addEventListener("click", async () => {
    if (!selectedTemplateMenu) return;
    if (!confirm("Deseja excluir este template?")) return;

    // Faz requisição para excluir o template
    const response = await updateTemplate({ url: `/api/templates/${selectedTemplateMenu.id}/group/${selectTemplateGroup.id}`, method: 'DELETE' });
    if(!response.success) return;

    // remove do DOM
    selectedTemplateElement.remove();

    // remove do Map
    const group = groupsMap.get(String(selectTemplateGroup.id));
    group.templates = group.templates.filter(t => t.id !== selectedTemplateMenu.id);

    // Esconde pop over
    popover.classList.add("hidden");
});

// Abre modal de edição de template
editTemplate.addEventListener('click', () => {
    // Abre modal
    openModal({ type: 'edit', name: selectedTemplateMenu.name, description: selectedTemplateMenu.description, group: selectTemplateGroup.id });
});

// Adiciona evento de clique ao botão de mover template
moveTemplate.addEventListener('click', () => {
    // Abre modal
    openModal({ type: 'move', group: selectTemplateGroup.id });
})

//* Funções:

// Função responsável pelo controle do pop over
function templateOptions({ el, event, template, group }) {
    // Evento de clique
    event.stopPropagation();

    // Salva elementos selecionados
    selectedTemplateMenu = template;
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

    // Salva os pacotes
    savePackets({ packet: packetData });
});

//* Funções:

// Função responsável por obter os pacotes
function getPackets() {
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

    // Retorna os pacotes
    return packetData;
}

// Função responsável por salvar os pacotes
async function savePackets({ packet }) {
    // Faz requisição para editar o pacote
    const response = await updateTemplate({ url: `/api/templates/${selectedTemplate}/group/${selectedGroup}/packets`, method: 'PUT', body: { packet } });
    if(!response.success) return;

    // Atualiza Map
    const group = groupsMap.get(selectedGroup);
    const index = group.templates.findIndex(t => t.id === data.template.id);
    if (index !== -1) group.templates[index] = data.template;

    // Atualiza as variáveis
    setSelectedTemplate(data.template.id);
    setSelectedGroup(group.id);
}

//* ======================{ Funções auxiliares }======================

// Função responsável por atualizar template
async function updateTemplate({ method, url, body }) {
    // Faz requisição para atualizar template
    const response = await api.request(url, { method, body });

    // Verifica resposta
    if (!response.success) showToast({ message: response.message });
    else showToast({ type: "success", message: response.message });

    return response;
}

// Função responsável por atualizar o Map com novo template
function upsertTemplate({ newGroupId, oldGroupId, template }) {
    // Obtêm o grupo
    const oldGroup = oldGroupId ? groupsMap.get(String(oldGroupId)) : null;
    const newGroup = groupsMap.get(String(newGroupId));

    // Se estiver editando
    if (oldGroup && oldGroup.id !== newGroup.id) oldGroup.templates = oldGroup.templates.filter(t => t.id !== template.id);

    // Obtêm o index do template
    const index = newGroup.templates.findIndex(t => t.id === template.id);

    // Caso não tenha o template, cria, se tiver, atualiza
    if (index === -1) newGroup.templates.push(template);
    else newGroup.templates[index] = template;

    // Atualiza contadores
    updateTemplateLength(newGroup);

    if (oldGroup && oldGroup.id !== newGroup.id) updateTemplateLength(oldGroup);

    // Retorna grupo
    return newGroup;
}

function updateTemplateLength(group) {
    if(!group) return;

    document.querySelectorAll(`[data-group-id="${group.id}"]`).forEach(groupEl => {
        const lengthEl = groupEl.querySelector(".templates-length");

        if (lengthEl) lengthEl.textContent = `(${group.templates.length})`;
    });
}

// Função responsável por atualizar o template selecionado
export function setSelectedTemplate(id) {
    selectedTemplate = id;
}

// Função responsável por atualizar o grupo selecionado
export function setSelectedGroup(id) {
    selectedGroup = id;
}