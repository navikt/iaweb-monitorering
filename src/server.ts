const { oppdaterMetrikker, hentMetrikker } = require('./metrikker');
const express = require('express');
const app = express();
const apiMetrics = require('prometheus-api-metrics');

const BASE_PATH = '/iaweb-monitorering';
const PORT = 8080;

oppdaterMetrikker(10000);

const startServer = () => {
    app.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    app.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    app.get(`${BASE_PATH}/internal/metrikker`, (req, res) => {
        hentMetrikker().then(metrikker => {
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
