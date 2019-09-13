process.env.DEBUG = 'axios';
const { oppdaterMetrikker } = require('./metrikker');
const { hentSelftestResultatForIawebSolr } = require('./selftest-for-iawebsolr');
const { hentSelftester } = require('./selftester');
const express = require('express');
const app = express();
const apiMetrics = require('prometheus-api-metrics');
const CircularJSON = require('circular-json');

const cluster = process.env.NAIS_CLUSTER_NAME;
const BASE_PATH = '/iaweb-monitorering';
const PORT = 8080;

const erIFSS = cluster ? cluster.toLowerCase().includes('fss') : true;
const apperSomSkalMonitoreres = erIFSS ? ['iawebinternal', 'iawebsolr'] : ['iawebnav'];

// oppdaterMetrikker(apperSomSkalMonitoreres, 10000);
const startServer = () => {
    app.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    app.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    app.get(`${BASE_PATH}/internal/selftester`, (req, res) => {
        hentSelftester(apperSomSkalMonitoreres).then(metrikker => {
            res.send(metrikker);
        });
    });

    app.get(`${BASE_PATH}/internal/test`, (req, res) => {
        hentSelftestResultatForIawebSolr('q1').then(resultat => {
            res.send(CircularJSON.stringify(resultat));
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
