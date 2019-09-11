const axios = require('axios');
const Prometheus = require('prom-client');

const miljøer = ['t2', 't1', 'q1', 'q0', 'p'];
const lagAppnavnMedMiljø = (app, miljø) => `${app}_${miljø}`;

const initierGauges = () => {
    const gauges = {};
    ['iawebinternal', 'iawebsolr', 'iawebnav'].forEach(app => {
        miljøer.forEach(miljø => {
            const appnavnMedMiljø = lagAppnavnMedMiljø(app, miljø);
            gauges[appnavnMedMiljø] = new Prometheus.Gauge({
                name: appnavnMedMiljø,
                help: 'Selftest for ' + appnavnMedMiljø + '. 1 betyr oppe, 0 betyr nede.',
            });
        });
    });
    return gauges;
};
const gauges = initierGauges();

const oppdaterMetrikker = (apperSomSkalMonitoreres, antallMillisekunderMellomHverOppdatering) =>
    setInterval(() => {
        hentSelftester(apperSomSkalMonitoreres).then(selftestResultater => {
            Object.keys(selftestResultater).forEach(app => {
                gauges[app].set(selftestResultater[app].status === 200 ? 1 : 0);
            });
        });
    }, antallMillisekunderMellomHverOppdatering);

const hentSelftestResultatForIawebSolr = async (miljø) => {
    // iawebsolr eksponerer ikke egen selftest, men man kan lese dens status ut i fra html-selftesten til iawebinternal.

    const iawebSolrOK = 'Solr status: UNI_SOLR_OK';
    const iawebSolrIkkeOK = 'Solr status: UNI_SOLR_CRITICAL';

    const selftestResultatForIawebInternal = await axios.get(urlTilApp('iawebinternal', miljø));
    if (selftestResultatForIawebInternal.data.includes(iawebSolrOK)) {
        return {
            status: 200,
            data: 'Solr status: UNI_SOLR_OK',
        }
    } else if (selftestResultatForIawebInternal.data.includes(iawebSolrIkkeOK)) {
        return {
            status: iawebSolrIkkeOK,
            data: iawebSolrIkkeOK,
        }
    } else {
        return {
            status: 'ikke OK',
            data: '',
        }
    }
};

const hentSelftestResultat = async (app, miljø) => {
    if (app === 'iawebsolr') {
        return await hentSelftestResultatForIawebSolr(miljø);
    }
    try {
        const selftestResultat = await axios.get(urlTilApp(app, miljø));
        return {
            status: selftestResultat.status,
            data: selftestResultat.data,
        };
    } catch (error) {
        return {
            status: 'kall feilet',
            data: error.message,
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

const urlTilApp = (app, miljø) => {
    if (app === 'iawebnav') {
        return `https://itjenester${hentMiljøUrlStreng(
            miljø
        )}.oera.no/iaweb/internal/selftest.json`;
    } else if (app === 'iawebinternal') {
        return `https://app${hentMiljøUrlStreng(miljø)}.adeo.no/iaweb/internal/selftest.json`;
    } else if (app === 'iawebsolr') {
        return `https://app${hentMiljøUrlStreng(miljø)}.adeo.no/iaweb-solr/internal/selftest.json`;
    }
};

const hentMiljøUrlStreng = miljø => {
    if (miljø === 'p') {
        return '';
    } else {
        return '-' + miljø;
    }
};

module.exports = { oppdaterMetrikker, hentSelftester };
