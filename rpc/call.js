const request = require('./request');
const config = require('../config');

function DataBinary(method, params) {
    this.id = '0';
    this.jsonrpc = '2.0';
    this.method = method;
    this.params = params;
}

async function storeScratchpad(path) {
    let dataBinary = new DataBinary('store_scratchpad', { local_file_path: path });
    let response = await request.jsonRequest(config.pool.daemon.host, config.pool.daemon.port, JSON.stringify(dataBinary))
        .catch((error) => {
            return ({ error: error });
        });
    return response;
}

async function getBlockTemplate(aliasInfo) {
    const params = { reserve_size: 8, wallet_address: config.pool.address, alias_details: aliasInfo };
    let dataBinary = new DataBinary('getblocktemplate', params);
    let response = await request.jsonRequest(config.pool.daemon.host, config.pool.daemon.port, JSON.stringify(dataBinary))
        .catch((error) => {
            return ({ error: error });
        });
    return response;
}

async function submitBlock(block) {
    let dataBinary = new DataBinary('submitblock', block);
    let response = await request.jsonRequest(config.pool.daemon.host, config.pool.daemon.port, JSON.stringify(dataBinary))
        .catch((error) => {
            return ({ error: error });
        });
    return response;
}

async function getAliasDetails(alias) {
    let dataBinary = new DataBinary('get_alias_details', { alias: alias });
    let response = await request.jsonRequest(config.pool.daemon.host, config.pool.daemon.port, JSON.stringify(dataBinary))
        .catch((error) => {
            return ({ error: error });
        });
    return response;
}

async function getAddendum(hi) {
    let dataBinary = new DataBinary('getjob', { id: '', hi: hi });
    let response = await request.jsonRequest(config.pool.daemon.host, config.pool.daemon.port, JSON.stringify(dataBinary))
        .catch((error) => {
            return ({ error: error });
        });
    return response;
}

async function getFullScratchpad() {
    let response = await request.binRequest(config.pool.daemon.host, config.pool.daemon.port, '/getfullscratchpad2')
        .catch((error) => {
            return ({ error: error });
        });
    return response;
}
module.exports = {
    storeScratchpad: storeScratchpad,
    getBlockTemplate: getBlockTemplate,
    submitBlock: submitBlock,
    getAliasDetails: getAliasDetails,
    getAddendum: getAddendum,
    getFullScratchpad: getFullScratchpad
};