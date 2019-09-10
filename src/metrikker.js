const axios = require('axios');
const apiMetrics = require('prometheus-api-metrics');
const Prometheus = require('prom-client');

const miljøer = ['t1', 'q1', 'q0', 'p'];

const iawebnavQ1 = new Prometheus.Gauge({
    name: 'iawebnavQ1',
    help: 'iaweb nav q1',
});

const oppdaterMetrikker = antallMillisekunderMellomHverOppdatering =>
    setInterval(() => {
        returnererEndepunkt200OK(urlTilIawebnav('q1')).then(
            erOppe => {
                iawebnavQ1.set(erOppe);
            },
            () => {
                iawebnavQ1.set(0);
            }
        );
    }, antallMillisekunderMellomHverOppdatering);

const hentMetrikker = async () => {
    const metrikker = {};
    await Promise.all(
        miljøer.map(async miljø => {
            const metrikknavn = 'iawebnav_' + miljø;
            try {
                const resultatSelftest = await axios.get(urlTilIawebnav(miljø));
                metrikker[metrikknavn] = {
                    status: resultatSelftest.status,
                    data: resultatSelftest.data,
                };
            } catch (error) {
                metrikker[metrikknavn] = {
                    status: 'kall feilet',
                    data: error.message,
                };
            }
        })
    );
    return metrikker;
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

const returnererEndepunkt200OK = async url => {
    return await axios.get(url).then(res => {
        if (res.status === 200) {
            return 1;
        } else {
            return 0;
        }
    });
};

module.exports = { oppdaterMetrikker, hentMetrikker };
