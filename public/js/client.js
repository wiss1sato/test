'use strict';	// 厳格モードとする

// オブジェクト
const socket = io.connect();	// クライアントからサーバーへの接続要求

// キャンバス
const canvas = document.querySelector( '#canvas-2d' );

// キャンバスオブジェクト
const screen = new Screen( socket, canvas);
let clicked = false
let canvasClicked = false

// キャンバスの描画開始
screen.animate( 0 );

// ページがunloadされる時（閉じる時、再読み込み時、別ページへ移動時）は、通信を切断する
$( window ).on(
    'beforeunload',
    ( event ) =>
    {
        socket.disconnect();
    } );
// キーの入力（キーダウン、キーアップ）の処理
let objMovement = {};	// 動作
// スタートボタン
$(document).on('click', '#start-button',
    () => 
    {
        if(clicked) {
            return
        }
        clicked = true;
        // サーバーに'enter-the-game'を送信
        let icNm = '';
        if ($('#iconName').prop('files')[0] !== undefined) {
            icNm = $('#iconName').prop('files')[0].name;
        } else {
            icNm = 'default.png';
        }
        let extension = icNm.split('.').pop();
        if (extension !== 'png' && extension !== 'jpg') {
            alert('png形式かjpg形式のファイルを選択してください！');
            return;
        }

        let filePath = '../images/' + icNm;

        is_file(filePath,function(res){
			if(res==true){
                const objConfig = { strNickName: $( '#nickname' ).val(), iconName: icNm };
                socket.emit( 'enter-the-game', objConfig );
                $( '#start-screen' ).hide();        
			}else{
                alert('選択されたファイルはアップロードされていません！');
                return;
			}
		});
    } );

	function is_file(fp,callback){
		$.ajax({
			url: fp,
			cache: false
		}).done(function(data) {
			callback(true);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			callback(false);
		});
    }
