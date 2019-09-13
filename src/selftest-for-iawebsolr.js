const { urlTilApp } = require('./utils');
const { api } = require('./api');
const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const hentSelftestResultatForIawebSolr = async miljø => {
    const url = urlTilApp('iawebsolr', miljø);

    const redirectResponse = await api.get(url, {
        maxRedirects: 0,
    });

    const iawebCookie = (redirectResponse.headers['set-cookie'] + '')
        .split(',')
        .filter(cookie => cookie.includes('JSESSIONID-iaweb='))[0];

    console.log('Kaller url=' + redirectResponse.headers.location + ' med cookie=' + iawebCookie);

    console.log('sleep start...');
    await sleep(3000);
    console.log('sleep end');

    try {
        return await api.get(redirectResponse.headers.location, {
            withCredentials: true,
            headers: {
                maxRedirects: 0,
                Cookie: iawebCookie,
            },
        });
    } catch (error) {
        if (error.message.includes('Max redirects exceeded.')) {
            console.log('fikk max redirects, prøver igjen...');
            return await hentSelftestResultatForIawebSolr(miljø);
        } else {
            throw error;
        }
    }
};

const hentRedirectRespons = async () => {
    let redirectResponse;

    try {
        await api.get(url, {
            maxRedirects: 0,
        });
    } catch (error) {
        redirectResponse = error.response;
        if (!redirectResponse || redirectResponse.status !== 302) {
            throw error;
        }
    }
};

module.exports = { hentSelftestResultatForIawebSolr };
