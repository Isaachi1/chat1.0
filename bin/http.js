"use strict";

let load = false
    , debug = require('debug')('chat:http')
    , socket = require('./socket');
const http = require('http');

module.exports = function(porta, app){
    let server;
    porta = process.env.PORT || porta;
    if(!load){
        server = http.createServer(app);
        server.listen(porta);
        socket(server);
        server.on('error', function (e) {
            throw e;
        });
        server.on('listening', function(){
            debug('Ouvindo na porta %s', porta);
        });
    }
    load = true;
    return server;
};