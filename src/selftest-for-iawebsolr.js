const { urlTilApp } = require('./utils');
const { api } = require('./api');
const MAKS_ANTALL_FORSØK = 10;

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
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

    for (let i = 0; i < MAKS_ANTALL_FORSØK; i++) {
        sleep(500);
        try {
            const res = await utførKallMedCookie(
                redirectResponse.headers.location,
                hentIawebCookie(redirectResponse)
            );
            if (res.status === 200) {
                console.log('Antall forsøk mot iaweb før success: ' + i + 1);
                return res;
            }
        } catch (ignored) {}
    }

    throw { message: 'Selftest for iawebsolr feilet. Antall forsøk: ' + MAKS_ANTALL_FORSØK };
};

const utførKallMedCookie = async (url, cookie) => {
    return await api.get(url, {
        withCredentials: true,
        headers: {
            maxRedirects: 0,
            Cookie: cookie,
        },
    });
};

const hentIawebCookie = response => {
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader instanceof Array) {
        return setCookieHeader.filter(cookie => cookie.includes('JSESSIONID-iaweb='))[0];
    } else {
        if (setCookieHeader.includes('JSESSIONID-iaweb=')) {
            return setCookieHeader;
        }
    }
    throw { message: 'Fant ikke riktig cookie' };
};

module.exports = { hentSelftestResultatForIawebSolr };
