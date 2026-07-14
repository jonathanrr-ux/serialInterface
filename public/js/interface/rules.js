import CustomSelect from '../utils/custom-select.js';

//* ======================{ Variáveis Auxiliares }======================

// Tipos de condições
const CONDITION_TYPES = [
    { value: 'last', name: 'Último byte' },
    { value: 'first', name: 'Primeiro byte' },
    { value: 'byte', name: 'Byte' },
    { value: 'sequence', name: 'Sequencia' }
];

// Tipos de operadores
const OPERATOR_TYPES = [
    { value: 'equal', name: 'for igual a' },
    { value: 'different', name: 'for diferente de' }
];

//* ======================{ Variáveis Globais }======================

// Instâncias
const addConditionType = new CustomSelect('add-condition-type', { options: CONDITION_TYPES });
const addOperatorType = new CustomSelect('add-operator-type', { options: OPERATOR_TYPES });