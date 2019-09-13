const axios = require('axios');
const { lagAppnavnMedMiljø, miljøer } = require('./utils');

const hentMiljøUrlStreng = miljø => {
    if (miljø === 'p') {
        return '';
    } else {
        return '-' + miljø;
    }
};

const urlTilApp = (app, miljø) => {
    if (app === 'iawebnav') {
        return `https://itjenester${hentMiljøUrlStreng(
            miljø
        )}.oera.no/iaweb/internal/selftest.json`;
    } else if (app === 'iawebinternal') {
        return `https://app${hentMiljøUrlStreng(miljø)}.adeo.no/iaweb/internal/selftest.json`;
    } else if (app === 'iawebsolr') {
        return `https://app${hentMiljøUrlStreng(miljø)}.adeo.no/iaweb/internal/selftest`;
    }
};

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


/*
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
        if (!redirectResponse.status !== 302) {
            throw error;
        }
    }

    console.log('redirectResponse', redirectResponse);

    await axios.get(url, {
        withCredentials: true,
        headers:
            {
                'Cookie': 'cookie1=test'
            }
    });

};

hentSelftestResultatForIawebSolr('q1');
*/

module.exports = { hentSelftester };