const config = require('../config');
const BlockTemplate = require('./blocktemplate');
const scratchpad = require('./scratchpad');
const server = require('./server');

(async function init() {
    scratchpad.storeScratchpadRoutine();
    await refreshBlockRoutine();
    server.start();
})();

async function refreshBlockRoutine() {
    await BlockTemplate.refresh();
    setTimeout(refreshBlockRoutine, config.pool.refreshBlockInterval);
}

