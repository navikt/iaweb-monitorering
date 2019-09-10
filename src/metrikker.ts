const axios = require('axios');
const Prometheus = require('prom-client');

type Miljø = 't1' | 'q1' | 'q0' | 'p';
const miljøer = ['t1', 'q1', 'q0', 'p'];

const iawebnavQ1 = new Prometheus.Gauge({
    name: 'iawebnavQ1',
    help: 'iaweb nav q1',
});

const oppdaterMetrikker = antallMillisekunderMellomHverOppdatering =>
    setInterval(() => {
        returnererEndepunkt200OK(urlTilIawebnav('q1')).then(
            erOppe => {
                iawebnavQ1.set(erOppe);
            },
            () => {
                iawebnavQ1.set(0);
            }
        );
    }, antallMillisekunderMellomHverOppdatering);

type SelftestResultat = {status: number | string, data: any};
const hentSelftester = async (): Promise<{[app: string]: SelftestResultat}> => {
    const selftester = {};
    await Promise.all(
        miljøer.map(async (miljø: Miljø) => {
            const app = 'iawebnav_' + miljø;
            try {
                const resultatSelftest = await axios.get(urlTilIawebnav(miljø));
                selftester[app] = {
                    status: resultatSelftest.status,
                    data: resultatSelftest.data,
                };
            } catch (error) {
                selftester[app] = {
                    status: 'kall feilet',
                    data: error.message,
                };
            }
        })
    );
    return selftester;
};

const urlTilIawebnav = (miljø: Miljø) => {
    return `https://itjenester${hentMiljøUrlStreng(miljø)}.oera.no/iaweb/internal/selftest.json`;
};

const hentMiljøUrlStreng = (miljø: Miljø): string => {
    if (miljø === 'p') {
        return '';
    } else {
        return '-' + miljø;
    }
};

const returnererEndepunkt200OK = async (url: string): Promise<number> => {
    return await axios.get(url).then(res => {
        if (res.status === 200) {
            return 1;
        } else {
            return 0;
        }
    });
};

module.exports = { oppdaterMetrikker, hentMetrikker: hentSelftester };
