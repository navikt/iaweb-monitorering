const Prometheus = require('prom-client');
const { hentSelftester } = require('./selftester');
const { lagAppnavnMedMiljø, miljøer } = require('./utils');

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
        hentSelftester(apperSomSkalMonitoreres).then(selftestresultater => {
            Object.keys(selftestresultater).forEach(app => {
                gauges[app].set(selftestresultater[app].status === 200 ? 1 : 0);
            });
        });
    }, antallMillisekunderMellomHverOppdatering);

module.exports = { oppdaterMetrikker };
