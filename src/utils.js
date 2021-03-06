const lagAppnavnMedMiljø = (app, miljø) => `${app}_${miljø}`;
const miljøer = ['t1', 'q1', 'p'];

const selftestResponse = (status, data, url) => {
    return {
        status,
        data,
        url,
    };
};

const hentMiljøUrlStreng = miljø => {
    if (miljø === 'p') {
        return '';
    } else {
        return '-' + miljø;
    }
};

const urlTilApp = (app, miljø) => {
    if (app === 'iawebnav') {
        return `https://itjenester${hentMiljøUrlStreng(
            miljø
        )}.oera.no/iaweb/internal/selftest.json`;
    } else if (app === 'iawebinternal') {
        return `https://app${hentMiljøUrlStreng(miljø)}.adeo.no/iaweb/internal/selftest.json`;
    } else if (app === 'iawebsolr') {
        return `https://app${hentMiljøUrlStreng(miljø)}.adeo.no/iaweb/internal/selftest`;
    }
};

module.exports = { lagAppnavnMedMiljø, miljøer, urlTilApp, selftestResponse };
