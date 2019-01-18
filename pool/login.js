const config = require('../config');
const rpc = require('../rpc');
const BlockTemplate = require('./blocktemplate');
const cnUtil = require('cryptonote-util');

const fixedDiffSeparator = '_';
const addressBase58Prefix = cnUtil.address_decode(Buffer.from(config.pool.address));

async function login(params, reply) {

    if (params.hi && (BlockTemplate.current().height - params.hi.height) > 9360) {
        reply('invalid miner height, redownload scratchpad');
        return -1;
    }

    let login = params.login;
    if (!login) {
        reply('missing login');
        return -1;
    }
    
    let fixedDiff = 0;
    let loginSplit = login.split(fixedDiffSeparator);
    login = loginSplit[0];
    if(login.length > 1) {
        fixedDiff = loginSplit[1];
    }


    if (login.indexOf('@') === 0) {
        login = login.substr(1);
        let response = await rpc.getAliasDetails(login);
        if (response.error || response.result.status !== 'OK') {
            console.error('Invalid alias');
            reply('Invalid alias');
            return -1;
        }

        login = response.result.alias_details.address;
    }
    if (addressBase58Prefix !== cnUtil.address_decode(Buffer.from(login))) {
        console.error('Invalid address');
        reply('Invalid address');
        return -1;
    }

    return fixedDiff;
}

module.exports = login;