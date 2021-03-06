const events = require("events");
const rpc = require ('../rpc');
const scratchpad = require('./scratchpad');
const crypto = require('crypto');
const cnUtil = require('cryptonote-util');
const instanceId = crypto.randomBytes(4);

const blockTemplateCount = 3;
var currentBlockTemplate;
var validBlockTemplates = [];
var newBlockTemplate = new events.EventEmitter();

class BlockTemplate {
    constructor(template) {
        this.blob = template.blocktemplate_blob;
        this.difficulty = template.difficulty;
        this.height = template.height;
        this.reserveOffset = template.reserved_offset;
        this.buffer = Buffer.from(this.blob, 'hex');
        instanceId.copy(this.buffer, this.reserveOffset + 4, 0, 3);
        this.previousBlockHash = Buffer.alloc(32);
        this.buffer.copy(this.previousBlockHash, 0, 7, 39);
        this.extraNonce = 0;
    }

    static notifier() {
        return newBlockTemplate;
    }

    static current () {
        return currentBlockTemplate;
    }

    static validBlocks () {
        return validBlockTemplates;
    }

    static async refresh() {
        let response = await rpc.getBlockTemplate('');
        if (response.error) {
            console.error('Unable to get block template');
            return;
        }

        if (!currentBlockTemplate) {
            PushBlockTemlate(response.result);
        } else if (!currentBlockTemplate.hashEquals(response.result)) {
            if (validBlockTemplates.push(currentBlockTemplate) > blockTemplateCount) {
                validBlockTemplates.shift();
            }
            PushBlockTemlate(response.result);
        }
    }

    nextBlob() {
        this.buffer.writeUInt32BE(++this.extraNonce, this.reserveOffset);
        return cnUtil.convert_blob_bb(this.buffer).toString('hex');
    }

    hashEquals(template) {
        let buffer = Buffer.from(template.blocktemplate_blob, 'hex');
        let previousBlockHash = Buffer.alloc(32);
        buffer.copy(previousBlockHash, 0, 7, 39);
        return (previousBlockHash.toString('hex') == this.previousBlockHash.toString('hex'));
    }
}

function PushBlockTemlate (template) {
    currentBlockTemplate = new BlockTemplate(template);
    console.log('New block template loaded with height:', currentBlockTemplate.height, ', difficulty:', currentBlockTemplate.difficulty);
    scratchpad.getFullScratchpad();
    newBlockTemplate.emit('NewTemplate');
}

module.exports = BlockTemplate;