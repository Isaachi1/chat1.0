$(function () {
    var user,
        socket      = io(),
        users       = [],
        form        = $('#formLogin'),
        abaEmFocus  = null,
        title       = document.title,
        msgSom      = new Audio('/sounds/WebMessage.mp3')
        ;

    /**
     * Alterna o título da página entre o original e um outro.
     * @param newTitle
     * @param interval
     */
    document.altTitle = function (newTitle, interval) {

        interval            = interval || 1000;
        document.title      = newTitle;
        document.last_title = title;

        clearInterval(document.altInt);

        if (newTitle) {
            document.altInt = setInterval(function () {
                document.title = document.title == newTitle ? document.last_title : newTitle;
            }, interval);
        } else {
            document.title = document.last_title;
        }

    };
    window.onfocus = function () {
        abaEmFocus = true;
        document.altTitle(false);
    };

    window.onblur = function () {
        abaEmFocus = false;
    };

    /**
     * Pega informações do usuário e emite para o servidor
     * @returns {boolean}
     * @constructor
     */
    function Logar() {

        var form     = $(this)
            , nick   = form.find('[name="nick"]').val().trim()
            , gender = form.find('[name="gender"]:checked').val()
            ;

        socket.emit('login', { nick: nick, gender: gender });

        return false;
    }

    /**
     * Insere uma mensagem no chat
     * @param msg
     */
    function insertMSG(msg) {
        var $msg = $("<li><strong class=\"" + msg.user.gender + "\">" + msg.user.nick + "</strong><p>" + msg.msg + "</p></li>"), idMsg = $('#msgs'), scrollHeight = idMsg.prop('scrollHeight');

        idMsg.append($msg);

        $msg.hide();

        if (scrollHeight > idMsg.height()) {
            idMsg
                .stop()
                .animate({ scrollTop: scrollHeight }, 250);
        }

        $msg.fadeIn(250);

    }

    /**
     * Insere os usuários online na barra lateral do chat
     * @param newUsers
     */
    function people(newUsers) {

        var log = $('#log');

        // Remove o próprio usuário do array
        users = newUsers.filter(function (me) {
            return me.id != user.id;
        });

        // Ordena por data de entrada
        users.sort(function (a, b) {
            return a.cameIn - b.cameIn;
        });

        // Insere o usuário no array na posição 0
        users.unshift(user);

        // Limpa o Log
        log.empty();

        // Adiciona os usuários
        for (var i in users) {
            var user_1 = users[i];
            log.append("<p class=\"" + user_1.gender + "\"><span class=\"img\"></span><strong>" + user_1.nick + "</strong></p>");
        }
    }

    // Ao conectar ao servidor...
    socket.on('connect', function () {

        // Ao enviar o formulário de login...
        form.on('submit', Logar);

        // Exibe o formulário de login
        form.fadeIn(250, function () {
            form.find('input, button').prop('disabled', false);
        });

        // Ao receber um erro do servidor, exibi-lo
        socket.on('erro', function (error) {
            $('#erro').text(error).show(250);
        });

        // Quando o login for feito...
        socket.on('loginok', function (data) {

            user = data.user; // define o usuário

            // Oculta as mensagens de erros
            $('#erro').hide(250, function () {
                form.fadeOut(250, function () {
                    $(this).remove();
                });
            });

            // Carrega os usuários logados.
            people(data.users);

            // Quando alguém entrar ou sair,
            // atualizar os usuários online.
            socket.on('userjoined', people);
            socket.on('userexit', people);

            // Ao receber uma nova mensagem...
            socket.on('newM', function (data) {

                // Inserir no chat
                insertMSG(data);

                // Se o autor da mensagem não for o usuário...
                if (data.user.id != user.id) {

                    // Toca o som de mensagem
                    msgSom.play();

                    // Se a aba não estiver em foco
                    if (!abaEmFocus)
                        // Alterna o título da página
                        document.altTitle(data.user.nick + " enviou uma menssagem.");
                }
            });

            // Quando uma pessoa estiver digitando...
            socket.on('userDig', function (user) {
                // Exiba no chat
                var $d = $("<p data-user=\"" + user + "\">" + user + " est\u00E1 digitando...</p>");
                $('#dig').append($d);
                $d.fadeIn(250);
            });

            // Quando a pessoa parar de escrever...
            socket.on('userStopDig', function (user) {
                // Remove a mensagem de digitando do chat.
                $('#dig').find("[data-user='" + user + "']").fadeOut(250, function () {
                    $(this).remove();
                });
            });

            var interval
                , digitando = false
                , txt = $('#txtMsgs')
                ;

            // Ao escrever no text-area...
            txt.on('keydown', function () {

                // Se não estiver digitando...
                if (!digitando) {
                    digitando = true;
                    socket.emit('userDig', user); // Emite para o servidor que o usuário está digitando.
                }

                // Limpa o intervalo
                clearInterval(interval);

                // Seta o intervalo de 1s
                interval = setTimeout(function () {
                    digitando = false;
                    socket.emit('userStopDig', user); // Emite para o servidor que o usuário parou de digitar.
                }, 1000);
            });

            // Quando uma tecla for levantada...
            txt.on('keyup', function (e) {
                // Pega o texto, remove o excesso de espaços e quebras de linha.
                var text = $(this).val().trim();

                // Se houver texto, for pressionado enter, mas a tecla shift não for pressionada...
                if (text && e.keyCode == 13 && !e.shiftKey) {

                    // Emite a mensagem para o servidor
                    socket.emit('sendM', {
                        msg: text,
                        user: user
                    });

                    // Limpa o text-area
                    $(this).val('');
                }
            });
        });
    });
});
