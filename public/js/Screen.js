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
        // ・サーバー側の周期的処理の「io.sockets.emit( 'game-start', ・・・ );」に対する処理
        // ゲーム開始を知らせ、ゲーム画面を表示
        this.socket.on(
            'enter-the-game',
            () =>
            {
                // キャンバスの塗りつぶし
                this.drawField();
                // プレイヤーの描画
                if( null !== this.aPlayer )
                {
                    this.aPlayer.forEach(
                        ( player ) =>
                        {
                            this.drawPlayer( player );
                        } );
                }
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
        //console.log( 'render' );

        // // キャンバスのクリア
        // this.context.clearRect( 0, 0, canvas.width, canvas.height );


        // // キャンバスの枠の描画
        // this.context.save();
        // this.context.strokeStyle = RenderingSettings.FIELD_LINECOLOR;
        // this.context.lineWidth = RenderingSettings.FIELD_LINEWIDTH;
        // this.context.strokeRect( 0, 0, canvas.width, canvas.height );
        // this.context.restore();
    }

    drawField()
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

    drawPlayer( player )
    {
        this.context.save();
        // プレイヤーの座標値に移動
        this.context.translate( player.fX, player.fY );
        // 画像描画
        this.context.save();
        this.context.rotate( player.fAngle );
        this.context.drawImage( this.assets.imageItem,0,0,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
            SharedSettings.PLAYER_WIDTH,	// 描画先領域の大きさ
            SharedSettings.PLAYER_HEIGHT );	// 描画先領域の大きさ
        this.context.restore();
  
        // ニックネーム
        
        this.context.save();
        this.context.restore();
        this.context.fill();
        this.context.textAlign = 'center';
        this.context.font = RenderingSettings.NICKNAME_FONT;
        this.context.fillStyle = RenderingSettings.NICKNAME_COLOR;
        this.context.fillText( player.strNickName, 0, -50 );

        this.context.restore();
        this.context.restore();
    }

    renderCard( card )
    {
        this.context.save();

        // 弾丸の座標値に移動
//        this.context.translate( card.fX, card.fY );

        // 弾丸の座標値に移動
        this.context.translate( 200, 100 );

        // 画像描画
        this.context.rotate( card.fAngle );
        this.context.drawImage( this.assets.cardS1,0,0,
            SharedSettings.CARD_WIDTH,	// 描画先領域の大きさ
            SharedSettings.CARD_HEIGHT );	// 描画先領域の大きさ

        this.context.restore();
    }



    
}
