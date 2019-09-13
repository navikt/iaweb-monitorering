require('axios-debug-log');
const axios = require('axios');

const initializeApi = () => {
    const api = axios.create();

    api.interceptors.response.use(
        response => response,
        error => {
            if (!!error.response && error.response.status === 302) {
                return error.response;
            } else {
                return Promise.reject(error);
            }
        }
    );

    return api;
};

const api = initializeApi();

module.exports = { api };
