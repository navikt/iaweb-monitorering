const { oppdaterMetrikker, hentSelftester } = require('./metrikker');
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
        hentSelftester().then(metrikker => {
            res.send(metrikker);
        });
    });

    app.use(
        apiMetrics({
            metricsPath: BASE_PATH + '/internal/metrics',
        })
    );

    app.get(`${BASE_PATH}/selftest/iawebnav/q1`, (req, res) => {
        axios
            .get('https://itjenester-q1.oera.no/iaweb/internal/selftest.json')
            .then(selftestRes => {
                res.sendStatus(selftestRes.status);
            });
    });

    app.get(`${BASE_PATH}/selftest`, (req, res) => {
        axios
            .get('https://arbeidsgiver-q.nav.no/kontakt-oss/internal/isAlive')
            .then(selftestRes => {
                if (selftestRes.status === 200) {
                    iawebnavQ1.set(1);
                } else {
                    iawebnavQ1.set(0);
                }
                res.sendStatus(selftestRes.status);
            });
    });

    app.listen(PORT, () => {
        console.log('Server listening on port', PORT);
    });
};

startServer();
