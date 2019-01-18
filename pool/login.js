const config = require('../config');
const rpc = require('../rpc');
const BlockTemplate = require('./blocktemplate');
const cnUtil = require('cryptonote-util');

const donateSeparator = '#';
const fixedDiffSeparator = '_';
const addressBase58Prefix = cnUtil.address_decode(Buffer.from(config.pool.address));

async function login(params, reply) {

    if (params.hi && (BlockTemplate.current().height - params.hi.height) > 9360) {
        reply('invalid miner height, redownload scratchpad');
        return false;
    }

    let login = params.login;
    if (!login) {
        reply('missing login');
        return false;
    }
    login = login.split(donateSeparator)[0];
    login = login.split(fixedDiffSeparator)[0];

    if (login.indexOf('@') === 0) {
        login = login.substr(1);
        let response = await rpc.getAliasDetails(login);
        if (response.error || response.result.status !== 'OK') {
            console.error('Invalid alias');
            reply('Invalid alias');
            return false;
        }

        login = response.result.alias_details.address;
    }
    if (addressBase58Prefix !== cnUtil.address_decode(Buffer.from(login))) {
        console.error('Invalid address');
        reply('Invalid address');
        return false;
    }

    return true;
}

module.exports = login;