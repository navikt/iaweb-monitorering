const { oppdaterMetrikker } = require('./metrikker');
const { hentSelftester } = require('./selftester');
const express = require('express');
const app = express();
const apiMetrics = require('prometheus-api-metrics');

const cluster = process.env.NAIS_CLUSTER_NAME;
const BASE_PATH = '/iaweb-monitorering';
const PORT = 8080;

const erIFSS = cluster ? cluster.toLowerCase().includes('fss') : true;
const apperSomSkalMonitoreres = erIFSS
    ? ['iawebinternal', 'iawebsolr']
    : [
          /*
          'iawebnav'
          iawebnav er skrudd av inntil videre. Spør i #arbeidsgiver-teamia for mer info.
          Hvis den skurs på igjen må det legges til deploy-jobb for sbs i build-deploy.yml.
          */
      ];

oppdaterMetrikker(apperSomSkalMonitoreres, 60 * 1000);

const startServer = () => {
    app.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    app.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    app.get(`${BASE_PATH}/internal/selftester`, (req, res) => {
        hentSelftester(apperSomSkalMonitoreres).then((metrikker) => {
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
