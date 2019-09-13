const axios = require('axios');
const { lagAppnavnMedMiljø, miljøer, urlTilApp } = require('./utils');
const CircularJSON = require('circular-json');

const tolkResultatForIawebSolr = selftestResultat => {
    // iawebsolr eksponerer ikke egen selftest, men man kan lese dens status ut i fra html-selftesten til iawebinternal.

    const iawebSolrOK = 'UNI_SOLR_OK';
    const iawebSolrIkkeOK = 'UNI_SOLR_CRITICAL';

    if (selftestResultat.data.includes(iawebSolrOK)) {
        return {
            status: selftestResultat.status,
            data: iawebSolrOK,
            url: selftestResultat.url,
        };
    } else if (selftestResultat.data.includes(iawebSolrIkkeOK)) {
        return {
            status: iawebSolrIkkeOK,
            data: iawebSolrIkkeOK,
            url: selftestResultat.url,
        };
    } else {
        return {
            status: 'ikke OK',
            data: '',
            url: selftestResultat.url,
        };
    }
};
const hentSelftestResultat = async (app, miljø) => {
    const url = urlTilApp(app, miljø);
    try {
        const selftestResultat = await axios.get(url, {
            withCredentials: true
        });
        if (app === 'iawebsolr') {
            return tolkResultatForIawebSolr(selftestResultat);
        }
        return {
            status: selftestResultat.status,
            data: selftestResultat.data,
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
            selftester[appnavnMedMiljø] = await hentSelftestResultat(app, miljø);
        })
    );

    return selftester;
};

const hentSelftestResultatForIawebSolr = async (miljø) => {
    const url = urlTilApp('iawebsolr', miljø);

    let redirectResponse;

    try {
        await axios.get(url, {
            maxRedirects: 0
        });
    } catch (error) {
        console.log('error', error);
        redirectResponse = error.response;
        if (!redirectResponse || !redirectResponse.status !== 302) {
            console.log('kaster error videre. redirectResponse=' + CircularJSON.stringify(redirectResponse));
            console.log('redirectResponse-setcookie1', CircularJSON.stringify(redirectResponse.headers['set-cookie']));
            throw error;
        }
    }
    console.log('redirectResponse', redirectResponse);
    console.log('redirectResponse-setcookie2', redirectResponse.headers['set-cookie']);

    return await axios.get(url, {
        withCredentials: true,
        headers:
            {
                'Cookie': 'cookie1=test'
            }
    });

};

module.exports = { hentSelftester, hentSelftestResultatForIawebSolr };