const { lagAppnavnMedMiljø, miljøer, urlTilApp } = require('./utils');
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
        return {
            status: selftestresultat.status,
            data: selftestresultat.data,
            url: url,
        };
    } catch (error) {
        return {
            status: 'kall feilet',
            data: error.message,
            url: url,
        };
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
