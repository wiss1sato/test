'use strict';	// 厳格モードとする

// オブジェクト
const socket = io.connect();	// クライアントからサーバーへの接続要求

// キャンバス
const canvas = document.querySelector( '#canvas-2d' );

// キャンバスオブジェクト
const screen = new Screen( socket, canvas);

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
$(document).on('click', '#start-button',
    () => 
    {
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
	
	// タッチ情報（キー：identifier, 値：（pageX, pageY）のリスト
const touches = {};

// タッチ開始
$( '#canvas-2d' ).on(
    'touchstart',
    ( event ) =>
    {
        event.preventDefault();	// ブラウザ規定の動作の抑止
        //console.log( 'touchstart', event, event.originalEvent.changedTouches );
        socket.emit( 'shoot' );	// ショット
        objMovement['forward'] = true;	// 前進
        Array.from( event.originalEvent.changedTouches ).forEach(
            ( touch ) =>
            {	// タッチ情報のリストへの追加
                touches[touch.identifier] = { pageX: touch.pageX, pageY: touch.pageY };
            } );
    } );

// タッチしながら移動
$( '#canvas-2d' ).on(
    'touchmove',
    ( event ) =>
    {
        event.preventDefault();	// ブラウザ規定の動作の抑止
        //console.log( 'touchmove', event, event.originalEvent.changedTouches );
        objMovement['right'] = false;	// 右旋回の設定の解除
        objMovement['left'] = false;	// 左旋回の設定の解除
        Array.from( event.originalEvent.changedTouches ).forEach(
            ( touch ) =>
            {	// 開始点に対するスライド方向い従い、右旋回、左旋回を設定する
                const startTouch = touches[touch.identifier];
                objMovement['right'] |= ( 30 < ( touch.pageX - startTouch.pageX ) );
                objMovement['left'] |= ( -30 > ( touch.pageX - startTouch.pageX ) );
            } );
        socket.emit( 'change-my-movement', objMovement );
    } );

// タッチ終了
$( '#canvas-2d' ).on(
    'touchend',
    ( event ) =>
    {
        event.preventDefault();	// ブラウザ規定の動作の抑止
        //console.log( 'touchend', event, event.originalEvent.changedTouches );
        Array.from( event.originalEvent.changedTouches ).forEach(
            ( touch ) =>
            {	// タッチ情報の削除
                delete touches[touch.identifier];
            } );
        if( 0 === Object.keys( touches ).length )
        {	// 移動終了
            objMovement = {};
            socket.emit( 'change-my-movement', objMovement );
        }
    } );