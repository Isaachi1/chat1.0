"use strict";

const express = require('express')
    , morgan = require('morgan')
    , bodyParser = require('body-parser')
    , path = require('path')
    , base = path.dirname(require.main.filename)
    , http = require('./http');

module.exports = function(){
    let app = express();
    app.set('views', path.join(base, 'views'));
    app.set('view engine', 'ejs');
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(express.static(path.join(base, 'public')));
    require('../api/routs')(app);
    app.use((req, res, next) => {
        let error = new Error("Não Encontrado!");
        error.status = 404;
        next(error);
    });
    // Error Handler: Outos erros
    app.use((error, req, res, next) => {
        error.status  = error.status  || 500;
        if(error.status == 500){
            error.message = "Erro Interno do servidor";
        }
        res.status(error.status);
        res.render('error', {
            error: error,
            env: process.env.NODE_ENV
        });
    });
    http(8080, app);
};