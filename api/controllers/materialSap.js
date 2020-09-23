const { json } = require("body-parser");
const fs = require('fs')
const jwt = require('jsonwebtoken')

//const server = jsonServer.create()
//server.use(bodyParser.urlencoded({ extended: true }))
//server.use(bodyParser.json())
//server.use(jsonServer.defaults());
const userdb = JSON.parse(fs.readFileSync('./users.json', 'UTF-8'))

const SECRET_KEY = '123456789'
const expiresIn = '1h'

module.exports = app => {

    const materialSapDB = app.data.materialSap;
    const controller = {};

    const { materialSap: materialSapMock, } = materialSapDB;

    // Create a token from a payload 
    function createToken(payload) {
        return jwt.sign(payload, SECRET_KEY, { expiresIn })
    }

    // Check if the user exists in database
    function isAuthenticated({ usuario, senha }) {
        return userdb.users.findIndex(user => user.usuario === usuario && user.senha === senha) !== -1
    }

    controller.returnToken = (req, res) => {
        if (req.headers.authorization === undefined) {
            const message = 'Não autorizado';
            res.status(401).json(message)
            return
        }

        //jwt e criação de token
        console.log(req.header("Authorization"));
        var DadosAuth = req.header("Authorization").replace('Basic ', '');

        'use strict';
        let data = DadosAuth;
        let buff = new Buffer.from(data, 'base64');
        let text = buff.toString('ascii');
        var credenciais = text.split(":");
        console.log("json fake");
        var string = '{ "usuario":"' + credenciais[0] + '", ' + '"senha": "' + credenciais[1] + '"} ';
        console.log(string);

        //console.log('"' + data + '" converted from Base64 to ASCII is "' + text + '"');
        //var my_json = '{"usuario":"x-usr","senha":"x-psw"}'.replace('x-usr',credenciais[0]).replace('x-psw',credenciais[1]).js;
        var obj = JSON.parse(string);
        //console.log(my_json);

        //const {usuario, senha} = req.body;
        const { usuario, senha } = obj;
        if (isAuthenticated({ usuario, senha }) === false || req.param("sap-client") != 'COSMOS') {
            const status = 401
            const message = 'Incorrect usuario or senha'
            res.status(status).json({ status, message })
            return
        }
        const access_token = createToken({ usuario, senha })
        console.log(">>> Access Token:" + access_token);
        res.status(200).json({ access_token })
    }


    //GET ALL
    controller.listMaterial = (req, res) => {
        //se tudo tiver dado certo
        res.status(200).json(materialSapDB);
    }





    //POST
    controller.saveMaterial = (req, res) => {

        //checa token
        if (req.headers.authorization === undefined) {
            const message = 'Não autorizado';
            res.status(401).json(message)
            return
        }

        //checar se o registro já existe
        //coleto do body a chave
        const Bismt = req.body.BISMT;

        //pesquiso ela no banco e armazeno o retorno (-1 caso não retorne nada a consulta)
        const foundMaterialIndex = materialSapMock
            .findIndex(material => material.BISMT === Bismt);

        //se registro não existir, sigo fazendo inserção
        if (foundMaterialIndex === -1) {
            //Leio o arquivo 
            fs.readFile('./api/data/materialSap.json', (err, data) => {
                if (err) {
                    const status = 401
                    const message = err
                    res.status(status).json({ status, message })
                    return
                };

                // pega os dados atuais
                var data = JSON.parse(data.toString());

                //adiciona novo registro
                data.materialSap.push(req.body)

                //escrevo no arquivo a leitura acrescida do novo registro
                var writeData = fs.writeFile('./api/data/materialSap.json', JSON.stringify(data), (err, result) => {
                    if (err) {
                        const status = 401
                        const message = err
                        res.status(status).json({ status, message })
                        return
                    }
                });

            })

            //retorno da consulta
            res.status(201).json({
                MSGS: [{ "msg1": "msg1", "msg2": "msg2" }],
                BISMT: req.body.BISMT,
                MATNR: req.body.MATNR,
                MSGTYP: "S",
                MSGID: 1219645961984,
                MSGNO: 200,
                MSGV1: "Variável 1",
                MSGV2: "Variável 2",
                MSGV3: "Variável 3",
                MSGV4: "Variável 4",
                MSGTXT: "MENSAGEM ALFA DE 220 CARACTERES"
            })
        }
        //caso o regitro já exista, cai no else
        else {
            res.status(404).json({
                message: "Material já existe na base",
                sucess: false,
                //materialSap: materialSapMock,
            });
        }
    }

    return controller;

}




