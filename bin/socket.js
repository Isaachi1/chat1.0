"use strict";
String.prototype.toCapitalize = function () {
    return this.charAt(0).toUpperCase()+this.slice(1);
};

let User = require('./User').User
    , users = []
    , debug = require('debug')('chat:socket');
    function updateUsers(){
        return users.filter(function (user) {
           return user != null;
        });
    }

module.exports = function (server) {

    let io = require('socket.io')(server);

    // FAZ LOGIN NO SISTEMA
    io.on('connection', function (client) {
        client.on('login', function (data) {

            let user = new User(data.nick.toCapitalize(), data.gender);

            if(users.some(function (u) {
                return u.nick == user.nick;
                })){
                client.emit('erro', 'Já existe um usuário com esse nome.');
            }else {

                users.push(user);
                // DEFENE DADOS DO USUARIO
                user.setID(client.id);
                io.emit('userjoined', users);
                client.emit('loginok', {user: user, users: users});
                client.on('sendM', function (data) {
                    data.msg = data.msg
                        .replace(/\:image\:([^\s])/gm, "<img src='$1'>")
                        .replace(/</gm,'&lt;')
                        .replace(/>/gm,'&gt;')
                        .replace(/(\n|\r)/gm,'<br>')
                    ;
                    io.emit('newM', data);
                });

                // USUARIO DIGITANDO
                client.on('userDig', function (user) {
                    client.broadcast.emit('userDig', user.nick);
                });
                client.on('userStopDig', function (user) {
                    client.broadcast.emit('userStopDig', user.nick);
                });

                // DICONECTA O USUARIO
                debug('Usuário [%s] conectado', user.nick);
                client.on('disconnect', function () {
                    debug('Usuário [%s] desconectado', user.nick);
                    user = users[users.indexOf(user)] = null;
                    users = updateUsers();
                    io.emit('userexit', users);
                });
            }
        });
    });
    server.listen(function () {
        debug('Socket rodando na 3001');
    });
    return io;
};
