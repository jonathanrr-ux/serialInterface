import { engine } from 'express-handlebars';
import path from 'path';
import fs from 'fs';

/**
 * Configura o motor de views Handlebars
 *
 * @param {import('express').Express} app
 */
export default (app) => {

    const root = process.cwd();

    const modulesPath = path.join(root, 'src', 'modules');

    // Pega somente módulos (ignora arquivos como modules/index.js)
    const modules = fs.readdirSync(modulesPath)
        .map(name => path.join(modulesPath, name))
        .filter(dir => fs.statSync(dir).isDirectory());

    // Views dos módulos
    const views = modules
        .filter(dir => path.basename(dir) !== 'shared')
        .map(dir => path.join(dir, 'web', 'views'))
        .filter(dir => fs.existsSync(dir));


    app.engine('hbs', engine({
        extname: '.hbs',
        layoutsDir: path.join(root, 'src', 'modules', 'shared', 'views', 'layouts'),
        partialsDir: [ path.join(root, 'src', 'modules', 'shared', 'views', 'partials') ],
        defaultLayout: 'main',
        helpers: {
            not: (value) => !value,
            eq: (a, b) => a === b
        }
    }));

    app.set('view engine', 'hbs');
    app.set('views', [...views]);

};