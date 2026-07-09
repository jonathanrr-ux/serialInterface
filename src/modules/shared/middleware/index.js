import express from 'express';
import setupHandlebars from '../../../config/view/handlebars.js';
import setLocals from './set-locals.js';

export default function setupMiddleware(app) {
    // Insere valores no res.locals
    app.use(setLocals);
    
    // Handlebars
    setupHandlebars(app);
}