const axios = require('axios');
const apiMetrics = require('prometheus-api-metrics');
const Prometheus = require('prom-client');

const miljøer = ['t1', 'q1', 'q0', 'p'];

const iawebnavQ1 = new Prometheus.Gauge({
    name: 'iawebnavQ1',
    help: 'iaweb nav q1'
});

const oppdaterMetrikker = (antallMillisekunderMellomHverOppdatering) => setInterval(() => {
    console.log('Oppdaterer status til iawebnav i q1...');
    returnererEndepunkt200OK(urlTilIawebnav('q1')).then(erOppe => {
        console.log('Status til iawebnav i q1: ' + erOppe);
        iawebnavQ1.set(erOppe);
    });
}, antallMillisekunderMellomHverOppdatering);

const hentMetrikker = async () => {
    const metrikker = {};
    await Promise.all(miljøer.map(async (miljø) => {
        metrikker['iawebnav' + hentMiljøUrlStreng(miljø)] = await returnererEndepunkt200OK(urlTilIawebnav(miljø));
    }));
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

const returnererEndepunkt200OK = async (url) => {
    return await axios.get(url).then(res => {
        if (res.status === 200) {
            return 1;
        } else {
            return 0;
        }
    });
};

module.exports = {oppdaterMetrikker, hentMetrikker};