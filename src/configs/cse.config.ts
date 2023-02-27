export const cseConfig = {
    cseId: 'in-cse-id',
    cseName: 'in-cse',
    spId: '//cse.synctechno.com'
};

export const defaulAeConfig = {
    ri: 'admin-ae-id',
    rn: 'admin-AE',
    api: 'NAE-id',
    aei: 'CAdmin'
}

export const defaultAcpConfig = {
    ri: 'admin-acp-id',
    rn: 'admin-ACP',
    pv: {
        acr: [{
            acor: ['CAdmin'],
            acop: 63
        }]
    }
}

export const mqttConfig = {
    url: 'mqtt://localhost:1883',
    options: {
        username: undefined,
        password: undefined,
    }
}
