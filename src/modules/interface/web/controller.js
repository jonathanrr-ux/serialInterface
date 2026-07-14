// Renderiza a página padrão
export async function getHome(req, res, next) {
    try {
        // Carrega página
        res.render('home', {
            js: ["interface/home"]
        });
    } catch (err) {
        console.error('Error rendering settings page: ', err);

        if (err instanceof Error) next(err);
        else next(new Error());
    }
}