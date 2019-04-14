'use strict';	// 厳格モードとする

// オブジェクト
const socket = io.connect();	// クライアントからサーバーへの接続要求

// キャンバス
const canvas = document.querySelector( '#canvas-2d' );

// キャンバスオブジェクト
const screen = new Screen( socket, canvas );

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
$( document ).on(
    'keydown keyup',
    ( event ) =>
    {
        const KeyToCommand = {
            'ArrowUp': 'forward',
            'ArrowDown': 'back',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
        };
        const command = KeyToCommand[event.key];
        if( command )
        {
            if( event.type === 'keydown' )
            {
                objMovement[command] = true;
            }
            else // if( event.type === 'keyup' )
            {
                objMovement[command] = false;
            }
            // サーバーに イベント名'change-my-movement'と、objMovementオブジェクトを送信
            socket.emit( 'change-my-movement', objMovement );
        }
    } );

// スタートボタン
$( '#start-button' ).on(
    'click',
    () => 
    {
        // サーバーに'enter-the-game'を送信
        const objConfig = { strNickName: $( '#nickname' ).val() };
        socket.emit( 'enter-the-game',
            objConfig );
        $( '#start-screen' ).hide();
    } );
