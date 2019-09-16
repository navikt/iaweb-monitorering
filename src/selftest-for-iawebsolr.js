const { urlTilApp, selftestResponse } = require('./utils');
const { api } = require('./api');
const MAKS_ANTALL_FORSØK = 5;

const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const tolkResultatForIawebSolr = selftestresultat => {
    // iawebsolr eksponerer ikke egen selftest, men man kan lese dens status ut i fra html-selftesten til iawebinternal.

    const iawebSolrOK = 'UNI_SOLR_OK';
    const iawebSolrIkkeOK = 'UNI_SOLR_CRITICAL';

    if (selftestresultat.data.includes(iawebSolrOK)) {
        return selftestResponse(selftestresultat.status, iawebSolrOK, selftestresultat.url);
    } else if (selftestresultat.data.includes(iawebSolrIkkeOK)) {
        selftestResponse(iawebSolrIkkeOK, iawebSolrIkkeOK, selftestresultat.url);
    } else {
        selftestResponse('ikke OK', '', selftestresultat.url);
    }
};

const hentSelftestresultatForIawebSolr = async miljø => {
    const url = urlTilApp('iawebsolr', miljø);

    let redirectResponse;
    try {
        redirectResponse = await api.get(url, {
            maxRedirects: 0,
        });
    } catch (error) {
        return selftestResponse('kall feilet', error.message, url);
    }

    if (redirectResponse.status === 200) {
        // I miljø T1 blir man ikke redirected.
        return tolkResultatForIawebSolr(redirectResponse);
    }

    const iawebSessionIdCookie = hentIawebCookie(redirectResponse);
    const urlManRedirectesTil = redirectResponse.headers.location;

    if (!iawebSessionIdCookie || !urlManRedirectesTil) {
        return selftestResponse(
            'kall feilet',
            'Respons fra selftest til iawebinternal mangler headers',
            url
        );
    }

    for (let i = 0; i < MAKS_ANTALL_FORSØK; i++) {
        sleep(1000); // IA-web trenger litt tid for å lagre sesjonen
        try {
            const res = await utførKallMedCookie(urlManRedirectesTil, iawebSessionIdCookie);
            if (res.status === 200) {
                if (i > 0) {
                    console.log(
                        `Antall forsøk før suksess på selftest for iawebsolr i ${miljø}: ${i + 1}`
                    );
                }
                return tolkResultatForIawebSolr(res);
            }
        } catch (ignored) {}
    }

    const feilmelding = 'Selftest for iawebsolr feilet. Antall forsøk: ' + MAKS_ANTALL_FORSØK;
    console.warn(feilmelding);
    return selftestResponse('kall feilet', feilmelding, url);
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

module.exports = { hentSelftestresultatForIawebSolr };
