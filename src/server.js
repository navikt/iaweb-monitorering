const { oppdaterMetrikker, hentSelftester } = require('./metrikker');
const express = require('express');
const app = express();
const apiMetrics = require('prometheus-api-metrics');

const BASE_PATH = '/iaweb-monitorering';
const PORT = 8080;

const erIFSS = process.env.NAIS_CLUSTER_NAME.toLowerCase().includes('fss');

const apperSomSkalMonitoreres = erIFSS ? ['iawebinternal', 'iawebsolr'] : ['iawebnav'];

oppdaterMetrikker(apperSomSkalMonitoreres, 10000);

const startServer = () => {
    app.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    app.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    app.get(`${BASE_PATH}/internal/selftester`, (req, res) => {
        hentSelftester().then(metrikker => {
            res.send(metrikker);
        });
    });

    app.use(
        apiMetrics({
            metricsPath: BASE_PATH + '/internal/metrics',
        })
    );

    app.listen(PORT, () => {
        console.log('Server listening on port', PORT);
    });
};

startServer();
