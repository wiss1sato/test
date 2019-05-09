'use strict';	// 厳格モードとする

// モジュール
const express = require( 'express' );
const http = require( 'http' );
const socketIO = require( 'socket.io' );
const Game = require( './libs/Game.js' );

var fs = require("fs");
var bodyParser = require('body-parser');
var multer = require("multer");

// オブジェクト
const app = express();
const server = http.Server( app );
const io = socketIO( server );


// アイコン取得用
app.use(bodyParser.urlencoded( { extended: false }));
app.use(multer({dest: './tmp/'}).single('file'));

app.get('/public/index.html', function (req, res) {
    res.sendFile(__dirname + "/public/" + "index.html");
});

app.post('/file_upload', function (req, res) {
    var file = __dirname + '/public/images/' + req.file.originalname;
    var response;
    fs.readFile(req.file.path, function (err, data) {
        fs.writeFile(file, data, function (err) {
            if (err) {
                console.log(err);
            } else {
                response = {
                    message: 'Success!',
                    filename: req.file.originalname
                };
            }
            console.log(response);
            res.json({'result': 'ファイルアップロードに成功しました！ブラウザバックして、ゲーム開始してください。'});
        });
    });
});

// 定数
const PORT_NO = process.env.PORT || 1337;	// ポート番号（環境変数PORTがあればそれを、無ければ1337を使う）

// ゲームの作成と開始
const game = new Game();
game.start( io );

// 公開フォルダの指定
app.use( express.static( __dirname + '/public' ) );

// サーバーの起動
server.listen(
    PORT_NO,	// ポート番号
    () =>
    {
        console.log(__dirname );
        console.log( 'Starting server on port %d', PORT_NO );
    } );