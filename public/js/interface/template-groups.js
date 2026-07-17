import { ICONS_DEFINITIONS } from "../utils/icons.js";
import showToast from "../utils/toast-notifications.js";
import FetchService from "../utils/fetchService.js";
import { changeInputErrorStatus } from "../utils/input-error.js";
import { onTemplateClick, setSelectedTemplate, editPacketWrapper, setSelectedGroup, selectedTemplate } from './template.js';
import { packetList } from './home.js';

//* ======================{ Variáveis globais }======================

const api = new FetchService();
export const groupsMap = new Map();
let editingGroupId = null;

// Modal
const groupModal = document.getElementById('group-modal');
const addNewGroupBtn = document.getElementById('add-new-group-button');

// Previews
const visualizationName = document.getElementById('visualization-name');
const iconPreview = document.getElementById('icon-preview');
const colorPreview = document.getElementById('color-preview');

// Conteúdo
const groupNameInput = document.getElementById('group-name-input');
const groupDescriptionInput = document.getElementById('group-description-input');
const categoryList = document.getElementById('category-list');
const iconsList = document.getElementById("icons-list");
const colorsList = document.getElementById('colors-list');
const colorBtn = document.querySelectorAll('.color-button');
const customColorInput = document.getElementById("custom-color");
const customColorBtn = document.getElementById("custom-color-button");
const saveGroupBtn = document.getElementById('save-group-button');

// Página
export const groupsList = document.getElementById('groups-list');
const groupsTabList = document.getElementById('groups-tab-list');

//* ======================{ Controle do modal }======================

//* Eventos:

// Adiciona evento de clique ao botão de abrir modal
addNewGroupBtn.addEventListener('click', () => {
    resetModalForm();
    editingGroupId = null;
})

// Adiciona evento de clique ao input
groupNameInput.addEventListener('input', (e) => {
    visualizationName.textContent = e.target.value;
})

// Adiciona evento de clique aos botões de cor
colorBtn.forEach(c => {
    c.addEventListener('click', function() {
        // Função responsável por selecionar item
        selectItem({ container: colorsList, element: this });

        // Atualiza preview
        updatePreview();
    })
})

// Adiciona evento de clique ao botão de cor
customColorInput.addEventListener("input", () => {
    const color = customColorInput.value;

    // Define cores
    customColorBtn.style.background = color;
    customColorBtn.dataset.color = color;

    // Seleciona item
    selectItem({ container: colorsList, element: customColorBtn });

    // Atualiza preview
    updatePreview();
});

// Adiciona evento de clique ao botão de salvar grupo
saveGroupBtn.addEventListener('click', function() { saveGroup({ el: this }) } );

//* Funções:

// Função responsável por salvar/editar grupo
async function saveGroup({ el }) {
    // Evita duplo clique
    if (el.disabled) return;

    // Limpa erro
    changeInputErrorStatus({ id: groupNameInput.id, error: false });

    // Verifica se foi passado nome para o grupo
    if(!groupNameInput.value) {
        changeInputErrorStatus({ id: groupNameInput.id, msg: 'Nome obrigatório' });
        return;
    }

    // Obtêm itens selecionados
    const { selectedIcon, selectedColor } = getSelectedItens();

    // Obtêm informações
    const icon = selectedIcon.querySelector("span").textContent.trim();
    const color = selectedColor?.dataset.color ?? "#6366F1";
    const name = groupNameInput.value;
    const description = groupDescriptionInput.value || null;

    const isEditing = editingGroupId !== null;

    // Trava o botão durante a requisição
    saveGroupBtn.disabled = true;

    try {
        // Requisição
        const { message, success, data } = await 
            fetchAuxiliar({ 
                url: isEditing ? `/api/groups/${editingGroupId}` : '/api/groups', 
                method: isEditing ? 'PUT' : 'POST',
                body: { icon, color, name, description }
            });

        // Mostra mensagem e retorna
        showToast({ type: success ? 'success' : 'error', message });
        if(!success) return;

        // Caso esteja editando
        if (isEditing) {
            // Atualiza grupo existente no map e no DOM
            const updatedGroup = { ...groupsMap.get(String(editingGroupId)), ...data.group };

            // Seta Map
            groupsMap.set(String(editingGroupId), updatedGroup);

            // Atualiza no DOM
            updateGroupInDom({ group: updatedGroup });
        } else {
            // Cria grupo na lista de templates
            groupsMap.set(String(data.group.id), data.group);

            // Cria elementos
            createGroupInList({ group: data.group });
            createGroupInTab({ group: data.group });
        }
        
        // Fecha modal e limpa formulário
        groupModal.close();
        resetModalForm();
        editingGroupId = null;
    } finally {
        saveGroupBtn.disabled = false;
    }
}

async function fetchAuxiliar({ url, method, body }) {
    return api.request(url, { method, body });
}

// Limpa o formulário do modal e volta ao estado inicial
function resetModalForm() {
    groupNameInput.value = '';
    groupDescriptionInput.value = '';
    visualizationName.textContent = '';

    // Reseta seleção de ícone para o primeiro da categoria atual
    const firstIconBtn = iconsList.querySelector('.icon-button');
    if (firstIconBtn) selectItem({ container: iconsList, element: firstIconBtn });

    // Reseta seleção de cor
    colorsList.querySelectorAll('[data-selected]').forEach(item => item.setAttribute('data-selected', 'false'));
    customColorBtn.style.background = '';

    updatePreview();
}

// Abre o modal já preenchido com os dados do grupo, para edição
function openEditModal({ group }) {
    // Salva grupo editado
    editingGroupId = group.id;

    // Bota informações do grupo
    groupNameInput.value = group.name;
    groupDescriptionInput.value = group.description ?? '';
    visualizationName.textContent = group.name;

    // Seleciona a cor do grupo, se existir entre os botões pré-definidos
    const matchingColorBtn = colorsList.querySelector(`[data-color="${group.color}"]`);
    if (matchingColorBtn) selectItem({ container: colorsList, element: matchingColorBtn });
    else {
        customColorInput.value = group.color;
        customColorBtn.style.background = group.color;
        customColorBtn.dataset.color = group.color;
        selectItem({ container: colorsList, element: customColorBtn });
    }

    // Tenta selecionar o ícone correspondente, se estiver na lista renderizada atualmente
    const matchingIconBtn = Array.from(iconsList.querySelectorAll('.icon-button')).find(btn => btn.querySelector('span').textContent.trim() === group.icon);
    if (matchingIconBtn) selectItem({ container: iconsList, element: matchingIconBtn });

    updatePreview();
    groupModal.showModal ? groupModal.showModal() : groupModal.show();
}

// Função responsável por criar botões das categorias dos ícones
function createCategoryButtons() {
    // Limpa lista
    categoryList.innerHTML = '';

    // Verifica se existem ícones
    if(!Object.keys(ICONS_DEFINITIONS).length) {
        iconsList.classList.add('hidden');
        return;
    }

    for(const [key, value] of Object.entries(ICONS_DEFINITIONS)) {
        // Cria elemento
        const div = document.createElement('div');

        // Adiciona atributos
        div.dataset.category = key;
        div.setAttribute('aria-selected', key === 'templates' ? true : false);

        // Adiciona classes
        div.className = 'flex items-center px-3 h-[2.3rem] gap-2 rounded-lg bg-surface-2 hover:bg-surface-3 whitespace-nowrap aria-selected:bg-primary cursor-pointer';
        div.innerHTML = `
            <span class="material-symbols-rounded">${value.icon}</span>
            ${value.name}
        `;

        // Adiciona ao DOM
        categoryList.appendChild(div);

        // Adiciona evento de clique em cada botão
        div.addEventListener('click', function() {
            // Seleciona itens
            selectItem({ container: categoryList, element: this });

            // Renderiza icons
            renderIcons({ icons: value.icons, category: key });

            this.scrollIntoView({
                behavior: "smooth",
                inline: "center"
            });
        })
    }
}

// Função responsável por renderizar os ícones
function renderIcons({ icons }) {
    // Limpa lista de ícones
    iconsList.innerHTML = "";

    icons.forEach((icon, index) => {
        const button = document.createElement("button");
        button.className = "icon-button aria-selected:!border-primary aria-selected:bg-primary/15 aria-selected:text-primary";
        button.setAttribute('aria-selected', index === 0);
        button.innerHTML = `
            <span class="material-symbols-rounded">
                ${icon}
            </span>
        `;

        iconsList.appendChild(button);

        button.addEventListener('click', function() {
            // Seleciona item
            selectItem({ container: iconsList, element: this });

            // Atualiza preview
            updatePreview();
        })
    })
    
    // Atualiza preview com o primeiro ícone
    updatePreview();
}

// Função responsável por atualizar o preview
function updatePreview() {
    const { selectedIcon, selectedColor } = getSelectedItens();
    if (!selectedIcon) return;

    const icon = selectedIcon.querySelector("span").textContent.trim();
    const color = selectedColor?.dataset.color ?? "#6366F1";

    iconPreview.textContent = icon;
    colorPreview.style.background = color;
}

//* ======================{ Controle da tab de grupos }======================

//* Eventos:

document.addEventListener('click', () => {
    document.querySelectorAll('.pop-over').forEach(pop => pop.classList.add('hidden'));
});

//* Funções:

// Cria o grupo na lista
function createGroupInList({ group }) {
    const div = document.createElement('div');
    div.className = 'flex flex-col gap-3 group group-color';
    div.dataset.groupId = group.id;
    div.dataset.expanded = false;
    div.style.setProperty('--group-color', group.color);

    div.innerHTML = `
        <div class="group-header flex items-center justify-between px-4 cursor-pointer">
            <div class="flex gap-3">
                <span class="material-symbols-rounded" style="color: var(--group-color)">${group.icon}</span>
                <p class="group-name text-[0.8em] font-bold">${group.name} <span class="text-[0.8em]">(${group.templates.length})</span></p>
            </div>
            <svg class="group-data-[expanded=true]:rotate-270 rotate-0 w-3 h-3" xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 24 32">
                <path stroke="#6366F1" stroke-width="2" d="M14.44,0,16,1.56,3.12,14.4,16,27.24,14.44,28.8,0,14.4Z"/>
            </svg>
        </div>
        <div class="group-data-[expanded=true]:grid-rows-[1fr] grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
            <div class="templates-list overflow-hidden flex flex-col gap-3">
            </div>
        </div>
    `;
    
    // Cria lista de templates
    const templatesList = div.querySelector('.templates-list');
    group.templates.forEach(g => { createTemplateInList({ template: g, container: templatesList, group }) })

    // Adiciona evento para esconder/mostrar grupo
    const groupHeader = div.querySelector('.group-header');
    groupHeader.addEventListener('click', function() {
        // Altera estado
        div.dataset.expanded = div.dataset.expanded !== 'true';
    });

    // Adiciona ao DOM
    groupsList.appendChild(div);
}

export function createTemplateInList({ template, group, container, creating = false }) {
    // Caso esteja criando um novo no momento
    if(creating) {
        // Tira seleção de todos
        groupsList.querySelectorAll('[aria-selected="true"]').forEach(el => el.setAttribute('aria-selected', 'false'));

        // Limpa listas
        packetList.innerHTML = '';
        // ruleList.innerHTML = '';

        // Salva o template selecionado
        setSelectedTemplate(template.id);
        setSelectedGroup(group.id)
    }

    const div = document.createElement('div');
    div.className = 'template flex gap-3 items-center group-color';
    div.dataset.templateId = template.id;
    div.dataset.groupId = group.id;
    div.setAttribute('aria-selected', creating ? true : false);
    div.style.setProperty('--group-color', group.color);
    div.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="material-symbols-rounded template-item" style="color: var(--group-color); text-shadow: 0 0 8px var(--group-color);">${group.icon}</span>
            <div>
                <p class="text-[0.8em] font-bold">${template.name}</p>
                <p class="text-[0.7em] text-text-secondary">${template.description ?? ''}</p>
            </div>
        </div>
        <img src="/img/icons/more.svg" class="menu-btn cursor-pointer size-[2rem]">`;

    container.appendChild(div);

    div.addEventListener('click', e => { onTemplateClick({ event: e, el: div, group, template }) });
}

// Função responsável por criar o grupo na tab
function createGroupInTab({ group }) {
    const div = document.createElement('div');
    div.className = 'flex flex-col card p-4 justify-between gap-5 group-color';
    div.dataset.groupId = group.id;
    div.style.setProperty('--group-color', group.color);
    div.innerHTML = buildGroupTabInnerHtml(group);

    groupsTabList.appendChild(div);

    // Eventos
    groupTabEvents({ el: div });
}

// Função responsável por criar o html do grupo
function buildGroupTabInnerHtml(group) {
    return `
        <div class="flex gap-3">
            <div class="flex items-center justify-center size-[4rem] rounded-xl" style="background-color: var(--group-color); box-shadow: 0 0 20px var(--group-color);">
                <span class="material-symbols-rounded item">${group.icon}</span>
            </div>
            <div class="flex flex-col gap-2 flex-1 min-w-0">
                <p class="group-name text-[0.8em] font-bold">${group.name} <span class="text-[0.8em]">(${group.templates.length})</span></p>
                <p class="text-[0.7em] text-text-secondary">${group.description ?? ''}</p>
            </div>
            <div class="relative more-button size-[2.5rem] rounded-xl shrink-0 bg-surface-3 cursor-pointer hover:bg-surface-3/70">
                <img src="/img/icons/more.svg" class="size-full p-1 rotate-90">
                
                <div class="pop-over hidden absolute top-0 right-0 translate-y-1/2 text-[0.7em] rounded-xl border-2 border-border bg-background">
                    <div class="delete-button flex flex-col gap-3 py-2 px-6 rounded-t-xl hover:bg-surface-3">
                        <button class="w-full">Excluir</button>
                    </div>
                    <div class="edit-button flex flex-col gap-3 py-2 px-6 rounded-b-xl hover:bg-surface-3">
                        <button class="w-full">Editar</button>
                    </div>
                </div>
            </div>
        </div>
        <img src="/img/icons/star.svg" class="self-end size-[2rem] cursor-pointer hover:drop-shadow-[0_0_8px_rgba(71,93,235)]">
    `;
}

// Atualiza o card na tab e o cabeçalho na lista após uma edição
function updateGroupInDom({ group }) {
    // Obtêm os grupos
    const groupEls = document.querySelectorAll(`[data-group-id="${group.id}"]`);

    // Itera
    groupEls.forEach(g => {
        // Atualiza os nomes
        const name = g.querySelector('.group-name');
        if(name) name.innerHTML = `${group.name} <span>(${group.templates.length ?? 0})</span>`;

        // Atualiza os ícones
        const icon = g.querySelector('.material-symbols-rounded');
        icon.textContent = group.icon;

        // Atualiza cores
        g.style.setProperty('--group-color', group.color);
    });
}

// Função responsável por gerenciar os eventos da tab de grupos
function groupTabEvents({ el }) {
    // Obtêm botão
    const moreBtn = el.querySelector('.more-button');

    // Evento de clique
    moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();

        const popover = this.querySelector('.pop-over');
        const isHidden = popover.classList.contains('hidden');

        // Fecha todos
        document.querySelectorAll('.pop-over').forEach(pop => pop.classList.add('hidden'));

        // Abre somente o clicado
        if (isHidden) popover.classList.remove('hidden');
    });

    // Botão de excluir
    const deleteBtn = el.querySelector('.delete-button');
    deleteBtn.addEventListener('click', async() => {
        // Manda confirmação
        if(!confirm('Deseja apagar o grupo?')) return;

        // Faz requisição para pagar elemento
        const { message, success } = await api.request(`/api/groups/${groupsMap.get(el.dataset.groupId).id}`, { method: 'DELETE' });
        showToast({ type: success ? 'success': 'error', message });
        if(!success) return;

        // Limpa map
        const group = groupsMap.get(el.dataset.groupId);

        // Verifica se o template selecionado pertence ao grupo
        if (group.templates.some(t => t.id === selectedTemplate)) {
            setSelectedTemplate(null);
            setSelectedGroup(null);

            // Limpa interface
            packetList.innerHTML = '';
            editPacketWrapper.dataset.active = false;
        }

        groupsMap.delete(el.dataset.groupId);
        document.querySelectorAll(`[data-group-id="${el.dataset.groupId}"]`).forEach(e => e.remove());
    });

    // Botão de editar
    const editBtn = el.querySelector('.edit-button');
    editBtn.addEventListener('click', () => {
        const group = groupsMap.get(String(el.dataset.groupId));
        if (!group) return;
        openEditModal({ group });
    });
}

//* ======================{ Funções auxiliares }======================

// Função responsável por obter os grupos
async function getGroups() {
    const { message, success, data } = await api.request('/api/groups');
    if(!success) {
        showToast({ message });
        return;
    }

    // Cria grupos na lista
    data.groups.forEach(g => {
        // Adiciona ao map
        groupsMap.set(g.id, g);

        // DOM
        createGroupInList({ group: g });
        createGroupInTab({ group: g });
    })
}

// Função responsável por obter os itens selecionados
function getSelectedItens() {
    const selectedIcon = iconsList.querySelector('[aria-selected="true"]');
    const selectedColor = colorsList.querySelector('[aria-selected="true"]');

    return { selectedIcon, selectedColor }
}

// Função responsável por selecionar item
function selectItem({ container, element }) {
    container.querySelectorAll('[aria-selected]').forEach(item => item.setAttribute('aria-selected', false));

    element.setAttribute('aria-selected', true);
}

//* ======================{ Inicialização da página }======================

document.addEventListener('DOMContentLoaded', () => {
    // Renderiza icons
    renderIcons({ icons: ICONS_DEFINITIONS.templates.icons });

    getGroups();
    createCategoryButtons()
})
