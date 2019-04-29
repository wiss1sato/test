// スクリーンクラス
class Screen
{
    // コンストラクタ
    constructor( socket, canvas, iconName )
    {
        this.socket = socket;
        this.canvas = canvas;
        this.context = canvas.getContext( '2d' );
        this.iProcessingTimeNanoSec = 0;
        this.aPlayer = null;
        this.assets = new Assets(iconName);
        // キャンバスの初期化
        this.canvas.width = SharedSettings.FIELD_WIDTH;
        this.canvas.height = SharedSettings.FIELD_HEIGHT;
        this.aCard = null;

        // ソケットの初期化
        this.initSocket();

        // コンテキストの初期化
        // アンチエイリアスの抑止（画像がぼやけるのの防止）以下４行
        this.context.mozImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;
        this.drawCnt = 0;
        this.playerList = [];
    }

    // ソケットの初期化
    initSocket()
    {
        // 接続確立時の処理
        // ・サーバーとクライアントの接続が確立すると、
        // 　サーバーで、'connection'イベント
        // 　クライアントで、'connect'イベントが発生する
        this.socket.on(
            'connect',
            () => 
            {
                console.log( 'connect : socket.id = %s', socket.id );
            } );

        // デッドしたらスタート画面に戻る
        this.socket.on(
            'dead',
            () =>
            {
                $( '#start-screen' ).show();
            } );

        // サーバーからの状態通知に対する処理
        // ・サーバー側の周期的処理の「io.sockets.emit( 'update', ・・・ );」に対する処理
        this.socket.on(
            'update',
            ( aPlayer, aCard, iProcessingTimeNanoSec ) =>
            {
                this.aPlayer = aPlayer;
                this.aCard = aCard;
                this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
            } );

        // サーバーからの状態通知に対する処理
        // ・サーバー側の周期的処理の「io.sockets.emit( 'enter-the-game', ・・・ );」に対する処理
        // プレイヤーを画面に表示する
        // this.socket.on(
        //     'enter-the-game',
        //     (aPlayer) =>
        //     {
        //         this.aPlayer = aPlayer;
        //         // キャンバスの塗りつぶし
        //         if (this.drawCnt === 0) {
        //             this.drawField();
        //             this.drawCnt = this.drawCnt + 1;
        //         }
        //         // プレイヤーの描画（全員)
        //         if( null !== this.aPlayer && undefined !== this.aPlayer )
        //         {
        //             this.drawPlayers(this.aPlayer);
        //         }
        //     } );

                    // デッドしたらスタート画面に戻る
        this.socket.on(
            'start-the-game',
            () =>
            {
                $( '#game-start' ).show();
            } );

    }

    // アニメーション（無限ループ処理）
    animate( iTimeCurrent )
    {
        requestAnimationFrame(
            ( iTimeCurrent ) =>
            {
                this.animate( iTimeCurrent );
            } );
        this.render( iTimeCurrent );

        // カードの描画
        if( null !== this.aCard )
        {
            this.aCard.forEach(
                ( card ) =>
                {
                    this.renderCard( card );
                } );
        }

    }

    // 描画。animateから無限に呼び出される
    render( iTimeCurrent )
    {
        // キャンバスの塗りつぶし
        this.renderField();

        // タンクの描画
        if( null !== this.aPlayer )
        {
            const fTimeCurrentSec = iTimeCurrent * 0.001; // iTimeCurrentは、ミリ秒。秒に変換。
            const iIndexFrame = parseInt( fTimeCurrentSec / 0.2 ) % 2;  // フレーム番号
            this.aPlayer.forEach(
                ( player ) =>
                {
                    this.renderPlayer( player );
                } );
        }
    }

    renderField()
    {
        this.context.save();
        let iCountX = parseInt( SharedSettings.FIELD_WIDTH / RenderingSettings.FIELDTILE_WIDTH );
        let iCountY = parseInt( SharedSettings.FIELD_HEIGHT / RenderingSettings.FIELDTILE_HEIGHT );
        for( let iIndexY = 0; iIndexY < iCountY; iIndexY++ )
        {
            for( let iIndexX = 0; iIndexX < iCountX; iIndexX++ )
            {
                this.context.drawImage( this.assets.imageField,
                    this.assets.rectFieldInFieldImage.sx, this.assets.rectFieldInFieldImage.sy,	// 描画元画像の右上座標
                    this.assets.rectFieldInFieldImage.sw, this.assets.rectFieldInFieldImage.sh,	// 描画元画像の大きさ
                    iIndexX * RenderingSettings.FIELDTILE_WIDTH,// 画像先領域の右上座標（領域中心が、原点になるように指定する）
                    iIndexY * RenderingSettings.FIELDTILE_HEIGHT,// 画像先領域の右上座標（領域中心が、原点になるように指定する）
                    RenderingSettings.FIELDTILE_WIDTH,	// 描画先領域の大きさ
                    RenderingSettings.FIELDTILE_HEIGHT );	// 描画先領域の大きさ
            }
        }

        this.context.restore();
    }

    renderPlayer( player )
    {
        var src = '../images/' + player.iconName;
        var ctx = this.context;
        this.preloadImages(src).done(function () {
            var img = new Image();
            img.src = src;
            // 画像描画
            ctx.save();
            ctx.drawImage( img,
                player.fX, player.fY,
                SharedSettings.PLAYER_WIDTH,	// 描画先領域の大きさ
                SharedSettings.PLAYER_HEIGHT                  
                );	// 描画先領域の大きさ
            ctx.restore();

            // ニックネーム
            ctx.save();
            ctx.restore();
            ctx.textAlign = 'center';
            ctx.font = RenderingSettings.NICKNAME_FONT;
            ctx.fillStyle = RenderingSettings.NICKNAME_COLOR;
            ctx.fillText( player.strNickName, player.fX + 80, player.fY - 30);
            ctx.restore();
            ctx.restore();  
        });

        // img.onload = function() {
        //     // プレイヤーの座標値に移動
        // }


        // ctx.drawImage( this.assets.imageItem,0,0,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
        //     SharedSettings.PLAYER_WIDTH,	// 描画先領域の大きさ
        //     SharedSettings.PLAYER_HEIGHT );	// 描画先領域の大きさ   
    }

    renderCard( card )
    {
//         this.context.save();

//         // 弾丸の座標値に移動
// //        this.context.translate( card.fX, card.fY );

//         // 弾丸の座標値に移動
//         this.context.translate( 200, 100 );

//         // 画像描画
//         this.context.drawImage( this.assets.cardS1,0,0,
//             SharedSettings.CARD_WIDTH,	// 描画先領域の大きさ
//             SharedSettings.CARD_HEIGHT );	// 描画先領域の大きさ

//         this.context.restore();
    }

    preloadImages = function (src) {
        if (!src.length) {
          return;
        }
        var dfd = $.Deferred();
        var img = new Image();
        img.src = src;
        var check = function () {
        if (img.complete !== true) {
            setTimeout(check, 250);
            return false;
        }
          dfd.resolve(img);
        };
        check();
        return dfd.promise();
      }    
}
