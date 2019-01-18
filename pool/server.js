const net = require('net');
const config = require('../config');
const Miner = require('./miner');

function startPoolServer() {
        var handleMessage = function (socket, jsonData, pushMessage) {
            if (!jsonData.id) {
                console.error('Miner RPC request missing RPC id');
                return;
            }
            else if (!jsonData.method) {
                console.error('Miner RPC request missing RPC method');
                return;
            }
            else if (!jsonData.params) {
                console.error('Miner RPC request missing RPC params');
                return;
            }

            var sendReply = function (error, result) {
                if (!socket.writable) return;
                var sendData = JSON.stringify({
                    id: jsonData.id,
                    jsonrpc: "2.0",
                    error: error ? { code: -1, message: error } : null,
                    result: result
                }) + "\n";
                socket.write(sendData);
            };

            Miner.executeMethod(jsonData.method, jsonData.params, socket.remoteAddress, sendReply, pushMessage);
        };

        net.createServer(function (socket) {

            socket.setKeepAlive(true);
            socket.setEncoding('utf8');

            var dataBuffer = '';

            var pushMessage = function (method, params) {
                if (!socket.writable) return;
                var sendData = JSON.stringify({
                    jsonrpc: "2.0",
                    method: method,
                    params: params
                }) + "\n";
                socket.write(sendData);
            };

            socket.on('data', function (d) {
                dataBuffer += d;
                if (Buffer.byteLength(dataBuffer, 'utf8') > 10240) { //10KB
                    dataBuffer = null;
                    console.log('Socket flooding detected and prevented from', socket.remoteAddress);
                    socket.destroy();
                    return;
                }
                if (dataBuffer.includes('\n')) {
                    var messages = dataBuffer.split('\n');
                    var incomplete = dataBuffer.slice(-1) === '\n' ? '' : messages.pop();
                    for (var i = 0; i < messages.length; i++) {
                        var message = messages[i];
                        if (message.trim() === '') continue;
                        var jsonData;
                        try {
                            jsonData = JSON.parse(message);
                        }
                        catch (e) {
                            if (message.indexOf('GET /') === 0) {
                                if (message.includes('HTTP/1.1')) {
                                    socket.end('HTTP/1.1' + httpResponse);
                                    break;
                                }
                                else if (message.includes('HTTP/1.0')) {
                                    socket.end('HTTP/1.0' + httpResponse);
                                    break;
                                }
                            }
                            console.log('Malformed message from', socket.remoteAddress, ':', error);
                            socket.destroy();
                            break;
                        }
                        console.log('Server received message from', socket.remoteAddress, ':', jsonData.method);
                        handleMessage(socket, jsonData, pushMessage);
                    }
                    dataBuffer = incomplete;
                }
            }).on('error', (error) => {
                if (error.code !== 'ECONNRESET')
                    console.error('Socket error from', socket.remoteAddress, ':', error);
            }).on('close', () => {
                pushMessage = function () { };
            });

        }).listen(config.pool.server.port, (error, result) => {
            if (error) {
                console.error('Could not start server: ' +  error);
                return;
            }
            console.log('Pool server started at port ' + config.pool.server.port);
        });
}

exports.start = startPoolServer;
