const express = require('express');
const app = express();
const axios = require('axios');

const BASE_PATH = '/iaweb-monitorering';
const PORT = 8080;

const startServer = () => {
    app.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    app.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    app.get(`${BASE_PATH}/selftest/iawebnav/q1`, (req, res) => {
        axios.get('https://itjenester-q1.oera.no/iaweb/internal/selftest.json').then(selftestRes => {
            res.sendStatus(selftestRes.status);
        });
    });

    /*
    app.get(`${BASE_PATH}/selftest`, (req, res) => {
        axios.get('https://arbeidsgiver-q.nav.no/kontakt-oss/internal/isAlive').then(selftestRes => {
            //console.log(res2.status);
            res.sendStatus(selftestRes.status);
        });
    });
    */

    app.listen(PORT, () => {
        console.log('Server listening on port', PORT);
    });


};

startServer();