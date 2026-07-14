// Renderiza a página padrão
export async function getSettings(req, res, next) {
    try {
        // Carrega página
        res.render('settings', {
            js: ["settings/settings"],
            hide: true
        });
    } catch (err) {
        console.error('Error rendering settings page: ', err);

        if (err instanceof Error) next(err);
        else next(new Error());
    }
}