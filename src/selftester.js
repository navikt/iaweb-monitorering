require('axios-debug-log');
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
            withCredentials: true,
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

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};

const hentSelftestResultatForIawebSolr = async miljø => {
    const url = urlTilApp('iawebsolr', miljø);

    console.log("sleep start...");
    await sleep(3000);
    console.log("sleep end");
    let redirectResponse;

    try {
        await axios.get(url, {
            maxRedirects: 0,
        });
    } catch (error) {
        redirectResponse = error.response;
        if (!redirectResponse || redirectResponse.status !== 302) {
            throw error;
        }
    }
    const iawebCookie = (redirectResponse.headers['set-cookie'] + '')
        .split(',')
        .filter(cookie => cookie.includes('JSESSIONID-iaweb='))[0];

    console.log('Kaller url=' + redirectResponse.headers.location + ' med cookie=' + iawebCookie);

    console.log("sleep start...");
    await sleep(3000);
    console.log("sleep end");

    try {
        return await axios.get(redirectResponse.headers.location, {
            withCredentials: true,
            headers: {
                maxRedirects: 0,
                Cookie: iawebCookie,
            },
        });
    } catch (error) {
        if (error.message.includes('Max redirects exceeded.')) {
            console.log('fikk max redirects, prøver igjen...');
            return await hentSelftestResultatForIawebSolr(miljø)
        } else {
            throw error;
        }
    }
};

module.exports = { hentSelftester, hentSelftestResultatForIawebSolr };
