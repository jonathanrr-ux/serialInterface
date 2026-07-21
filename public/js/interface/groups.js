import { ICONS_DEFINITIONS } from "../utils/icons.js";
import showToast from "../utils/toast-notifications.js";
import FetchService from "../utils/fetchService.js";
import { changeInputErrorStatus } from "../utils/input-error.js";
import { onTemplateClick, setSelectedTemplate, editPacketWrapper, setSelectedGroup, selectedTemplate, selectedGroup } from './template.js';
import { changeTab, packetList } from './home.js';
import { ruleList } from "./rules.js";
import { fetchAuxiliar, templatesMap } from "./template.js"; 

//* ======================{ Variáveis globais }======================

// Títulos
let titles = {
    edit: "Editar grupo",
    add: "Adicionar grupo"
}

let editingGroup = null;

const api = new FetchService();
export const groupsMap = new Map();

// Modal
const groupModal = document.getElementById('group-modal');
const addNewGroupBtn = document.getElementById('add-new-group-button');
const modalTitle = groupModal.querySelector('.title');

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
    openModal();
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
    // Valida os campos
    const hasError = validateFields();
    if(hasError) return;

    // Obtêm a informação do grupo
    const { icon, color, name, description } = getGroupInfo();

    // Verifica se está editando
    const isEditing = groupModal.dataset.modal === 'edit';

    // Faz requisição
    const { success, data } = await fetchAuxiliar({ 
        url: isEditing ? `/api/groups/${editingGroup}` : '/api/groups', 
        method: isEditing ? 'PUT' : 'POST',
        body: { icon, color, name, description }
    });
    if(!success) return;
    
    // Seta Map
    groupsMap.set(data.group.id, data.group);

    // Atualiza no DOM
    if(isEditing) updateGroupInDom({ group: data.group });
    else {
        // Cria elementos
        createGroupInList({ group: data.group });
        createGroupInTab({ group: data.group });
    }
    
    // Fecha modal e limpa formulário
    groupModal.close();
}

// Função responsável por obter as informações do grupo
function getGroupInfo() {
    // Obtêm itens selecionados
    const { selectedIcon, selectedColor } = getSelectedItens();

    // Obtêm informações
    const icon = selectedIcon.querySelector("span").textContent.trim();
    const color = selectedColor?.dataset.color ?? "#6366F1";
    const name = groupNameInput.value;
    const description = groupDescriptionInput.value || null;

    // Retorna
    return { icon, color, name, description }
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
        button.dataset.icon = icon
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
    // Obtêm cor e ícone selecionados
    const { selectedIcon, selectedColor } = getSelectedItens();
    if (!selectedIcon) return;

    // Obtêm ícone e cor
    const icon = selectedIcon.querySelector("span").textContent.trim();
    const color = selectedColor?.dataset.color ?? "#6366F1";

    // Atualiza
    iconPreview.textContent = icon;
    colorPreview.style.background = color;
};

// Função responsável por abrir modal
function openModal({ type = 'add', group = null } = {}) {
    // Muda dataset do modal
    groupModal.dataset.modal = type;
    modalTitle.textContent = titles[type];

    // Limpa inputs
    clearInputError({ inputs: [groupDescriptionInput, groupNameInput] });

    // Atualiza informações 
    groupNameInput.value = group ? group.name : '' ;
    groupDescriptionInput.value = group ? group.description ?? '' : '';
    visualizationName.textContent = group ? group.name : '';

    // Caso for modal de adicionar
    if(type === 'add') initializeDefaultSelections();
    else {
        selectGroupColor(group.color);
        selectGroupIcon(group.icon);
    }

    // Atualiza modal e preview
    updatePreview();
    groupModal.showModal();
}

// Função responsável por inicializar as seleções padrão
function initializeDefaultSelections() {
    // Seleciona o ícone padrão
    const firstIconBtn = iconsList.querySelector('.icon-button');
    if (firstIconBtn) selectItem({ container: iconsList, element: firstIconBtn });

    // Tira seleção de cores
    colorsList.querySelectorAll('[data-selected]').forEach(el => el.dataset.selected = false);
    customColorBtn.style.background = '';
}

// Função responsável por selecionar a cor
function selectGroupColor(color) {
    // Obtêm a cor
    const button = colorsList.querySelector(`[data-color="${color}"]`);

    // Seleciona caso ache
    if (button) {
        selectItem({ container: colorsList, element: button });
        return;
    }

    // Caso seja uma cor personalizada
    customColorInput.value = color;
    customColorBtn.style.background = color;
    customColorBtn.dataset.color = color;

    selectItem({ container: colorsList, element: customColorBtn });
}

// Função responsável por selecionar o ícone
function selectGroupIcon(icon) {
    // Obtêm a categoria do ícone
    const category = Object.entries(ICONS_DEFINITIONS).find(([, value]) => value.icons.includes(icon));
    if (!category) return;

    const [categoryName, definition] = category;

    // Renderiza os ícones da categoria
    renderIcons({ icons: definition.icons });

    // Seleciona a categoria
    selectItem({ container: categoryList, element: categoryList.querySelector(`[data-category="${categoryName}"]`) });

    // Seleciona o ícone
    const iconButton = iconsList.querySelector(`[data-icon="${icon}"]`);
    if (iconButton) selectItem({ container: iconsList, element: iconButton });
}

//* ======================{ Controle da tab de grupos }======================

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
                <p class="group-name text-[0.8em] font-bold break-all">${group.name} <span class="text-[0.8em] templates-length">(0)</span></p>
            </div>
            <svg class="group-data-[expanded=true]:rotate-270 rotate-0 w-3 h-3 shrink-0" xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 24 32">
                <path stroke="#FFF" stroke-width="2" d="M14.44,0,16,1.56,3.12,14.4,16,27.24,14.44,28.8,0,14.4Z"/>
            </svg>
        </div>
        <div class="group-data-[expanded=true]:grid-rows-[1fr] grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
            <div class="templates-list overflow-hidden flex flex-col gap-3">
            </div>
        </div>
    `;

    // Adiciona evento para esconder/mostrar grupo
    const groupHeader = div.querySelector('.group-header');
    groupHeader.addEventListener('click', function() {
        const willClose = div.dataset.expanded === 'true';
        div.dataset.expanded = !willClose;

        // Se está fechando o grupo
        if (willClose) {
            if (selectedGroup === div.dataset.groupId) {
                setSelectedTemplate(null);
                setSelectedGroup(null);

                packetList.innerHTML = '';
                ruleList.innerHTML = '';

                editPacketWrapper.dataset.active = false;
                changeTab({ tab: 'groups' });

                div.querySelectorAll('[aria-selected="true"]').forEach(el => el.setAttribute('aria-selected', 'false'));
            }
        }
    });

    // Adiciona ao DOM
    groupsList.appendChild(div);
}

// Função responsável por criar o grupo na tab
function createGroupInTab({ group }) {
    const div = document.createElement('div');
    div.className = 'flex flex-col card p-4 justify-between gap-5 group-color';
    div.dataset.groupId = group.id;
    div.style.setProperty('--group-color', group.color);
    div.innerHTML = `
        <div class="flex gap-3">
            <div class="flex items-center justify-center size-[4rem] rounded-xl" style="background-color: var(--group-color); box-shadow: 0 0 20px var(--group-color);">
                <span class="material-symbols-rounded item">${group.icon}</span>
            </div>
            <div class="flex flex-col gap-2 flex-1 min-w-0">
                <p class="group-name text-[0.8em] font-bold break-all">${group.name} <span class="text-[0.8em] templates-length">(0)</span></p>
                <p class="group-description text-[0.7em] text-text-secondary break-all">${group.description ?? ''}</p>
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

    groupsTabList.appendChild(div);

    // Eventos
    groupTabEvents({ el: div });
}

// Atualiza o card na tab e o cabeçalho na lista após uma edição
function updateGroupInDom({ group }) {
    // Obtêm os grupos
    const groupEls = document.querySelectorAll(`[data-group-id="${group.id}"]`);

    // Itera
    groupEls.forEach(g => {
        // Atualiza os nomes
        const name = g.querySelector('.group-name');
        if(name) name.innerHTML = `${group.name}`;

        // Atualiza os ícones
        const icon = g.querySelector('.material-symbols-rounded');
        if(icon) icon.textContent = group.icon;
        
        const description = g.querySelector('.group-description');
        if(description) description.textContent = group.description;

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

        // Faz requisição para apagar elemento
        const { success } = await fetchAuxiliar({ url: `/api/groups/${el.dataset.groupId}`, method: 'DELETE' });
        if(!success) return;

        // Limpa map
        const template = templatesMap.get(selectedTemplate);
        
        // Verifica se o template selecionado pertence ao grupo
        if (template && template.group_id === el.dataset.groupId) {
            // Limpa variáveis
            setSelectedTemplate(null);
            setSelectedGroup(null);

            // Esconde páginas
            editPacketWrapper.dataset.active = false;
        }

        // Exclui grupo
        groupsMap.delete(el.dataset.groupId);
        document.querySelectorAll(`[data-group-id="${el.dataset.groupId}"]`).forEach(e => e.remove());
    });

    // Botão de editar
    const editBtn = el.querySelector('.edit-button');
    editBtn.addEventListener('click', () => {
        // Obtêm o grupo
        const group = groupsMap.get(el.dataset.groupId);
        if (!group) return;
        
        // Abre modal de editar
        openModal({ type: 'edit', group });

        // Seleciona grupo
        editingGroup = group.id;
    });
}

//* ======================{ Funções auxiliares }======================

// Função responsável por obter os grupos
async function getGroups() {
    const { success, data } = await fetchAuxiliar({ url: '/api/groups', toast: false });
    if(!success) return;

    // Cria grupos na lista
    data.groupList.forEach(g => {
        // Adiciona ao map
        groupsMap.set(g.id, g);

        // DOM
        createGroupInList({ group: g });
        createGroupInTab({ group: g });
    })
}

// Função responsável por validar os campos
function validateFields() {
    // Limpa erro dos inputs
    clearInputError({ inputs: [groupDescriptionInput, groupNameInput] });

    // Função para setar erro
    const setError = (input, msg) => {
        changeInputErrorStatus({ id: input.id, msg });
        return true;
    }

    // Verifica se foi passado nome para o grupo
    if(!groupNameInput.value.trim()) return setError(groupNameInput, 'Nome obrigatório');
    if(groupNameInput.value.length > 40) return setError(groupNameInput, 'Nome deve conter no máximo 40 caracteres');

    if(groupDescriptionInput && groupDescriptionInput.value.length > 100) return setError(groupDescriptionInput, 'Descrição deve conter no máximo 100 caracteres');

    return false;
}

// Função responsável por limpar o erro dos inputs
export function clearInputError({ inputs = [] }) {
    inputs.forEach(i => changeInputErrorStatus({ id: i.id, error: false }));
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

export function expandGroup(groupId) {
    const group = groupsList.querySelector(`[data-group-id="${groupId}"]`);
    if (!group) return;

    group.dataset.expanded = true;
}

// Função responsável por iniciar a página
export async function initGroups() {
    // Renderiza icons
    renderIcons({ icons: ICONS_DEFINITIONS.templates.icons });

    await getGroups();
    createCategoryButtons();
}

