import db from './models/index.js';

/**
 * Função para configurar o banco de dados
 */
export default async function setupDatabase() {
    await db.sequelize.sync(); // Aguarda sincronização completa, força atualização do banco { force: true }
};