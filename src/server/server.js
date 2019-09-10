const express = require('express');
const app = express();

const BASE_PATH = '/iaweb-monitorering';
const PORT = 8080;

const startServer = () => {
    app.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    app.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    app.listen(PORT, () => {
        console.log('Server listening on port', PORT);
    });
};

startServer();