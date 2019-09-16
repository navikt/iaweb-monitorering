const { lagAppnavnMedMiljø, miljøer, urlTilApp, selftestResponse } = require('./utils');
const { api } = require('./api');
const { hentSelftestresultatForIawebSolr } = require('./selftest-for-iawebsolr');

const hentSelftestresultat = async (app, miljø) => {
    const url = urlTilApp(app, miljø);
    try {
        if (app === 'iawebsolr') {
            return hentSelftestresultatForIawebSolr(miljø);
        }
        const selftestresultat = await api.get(url, {
            withCredentials: true,
        });
        return selftestResponse(selftestresultat.status, selftestresultat.data, url);
    } catch (error) {
        return selftestResponse('kall feilet', error.message, url);
    }
};

const hentSelftester = async apperSomSkalMonitoreres => {
    const apperOgMiljøer = apperSomSkalMonitoreres.reduce((listeMedApperOgMiljøer, app) => {
        const gjeldendeAppMedAlleMiljøer = miljøer.map(miljø => {
            return {
                app: app,
                miljø: miljø,
            };
        });

        return [...listeMedApperOgMiljøer, ...gjeldendeAppMedAlleMiljøer];
    }, []);

    const selftester = {};

    await Promise.all(
        apperOgMiljøer.map(async ({ app, miljø }) => {
            const appnavnMedMiljø = lagAppnavnMedMiljø(app, miljø);
            selftester[appnavnMedMiljø] = await hentSelftestresultat(app, miljø);
        })
    );

    return selftester;
};

module.exports = { hentSelftester };
