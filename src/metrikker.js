const axios = require('axios');
const Prometheus = require('prom-client');

const miljøer = ['t2', 't1', 'q1', 'q0', 'p'];

const initierGauges = () => {
    const gauges = {};
    miljøer.forEach(miljø => {
        const appnavnMedMiljø = 'iawebnav_' + miljø;
        gauges[appnavnMedMiljø] = new Prometheus.Gauge({
            name: appnavnMedMiljø,
            help: 'Selftest for ' + appnavnMedMiljø + '. 1 betyr oppe, 0 betyr nede.',
        });
    });
    return gauges;
};
const gauges = initierGauges();

const oppdaterMetrikker = antallMillisekunderMellomHverOppdatering =>
    setInterval(() => {
        hentSelftester().then(selftestResultater => {
            Object.keys(selftestResultater).forEach(app => {
                gauges[app].set(selftestResultater[app].status === 200 ? 1 : 0);
            });
        });
    }, antallMillisekunderMellomHverOppdatering);

const hentSelftester = async () => {
    const selftester = {};
    await Promise.all(
        miljøer.map(async miljø => {
            const app = 'iawebnav_' + miljø;
            try {
                const selftestResultat = await axios.get(urlTilIawebnav(miljø));
                selftester[app] = {
                    status: selftestResultat.status,
                    data: selftestResultat.data,
                };
            } catch (error) {
                selftester[app] = {
                    status: 'kall feilet',
                    data: error.message,
                };
            }
        })
    );
    return selftester;
};

const urlTilIawebnav = miljø => {
    return `https://itjenester${hentMiljøUrlStreng(miljø)}.oera.no/iaweb/internal/selftest.json`;
};

const hentMiljøUrlStreng = miljø => {
    if (miljø === 'p') {
        return '';
    } else {
        return '-' + miljø;
    }
};

module.exports = { oppdaterMetrikker, hentSelftester };
