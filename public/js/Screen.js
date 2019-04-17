// スクリーンクラス
class Screen
{
    // コンストラクタ
    constructor( socket, canvas )
    {
        this.socket = socket;
        this.canvas = canvas;
        this.context = canvas.getContext( '2d' );
        this.assets = new Assets();
        this.iProcessingTimeNanoSec = 0;
        this.aPlayer = null;

        // キャンバスの初期化
        this.canvas.width = SharedSettings.FIELD_WIDTH;
        this.canvas.height = SharedSettings.FIELD_HEIGHT;

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
            ( aPlayer, iProcessingTimeNanoSec ) =>
            {
                this.aPlayer = aPlayer;
                this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
            } );

        // サーバーからの状態通知に対する処理
        // ・サーバー側の周期的処理の「io.sockets.emit( 'game-start', ・・・ );」に対する処理
        // ゲーム開始を知らせ、ゲーム画面を表示
        this.socket.on(
            'game-start',
            () =>
            {
                $( '#game-screen' ).show();
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
    }

    // 描画。animateから無限に呼び出される
    render( iTimeCurrent )
    {
        //console.log( 'render' );

        // キャンバスのクリア
        this.context.clearRect( 0, 0, canvas.width, canvas.height );

        // キャンバスの塗りつぶし
        this.renderField();

        // プレイヤーの描画
        if( null !== this.aPlayer )
        {
            const fTimeCurrentSec = iTimeCurrent * 0.001; // iTimeCurrentは、ミリ秒。秒に変換。
            const iIndexFrame = parseInt( fTimeCurrentSec / 0.2 ) % 2;  // フレーム番号
            this.aPlayer.forEach(
                ( player ) =>
                {
                    this.renderPlayer( player, iIndexFrame );
                } );
        }

        // キャンバスの枠の描画
        this.context.save();
        this.context.strokeStyle = RenderingSettings.FIELD_LINECOLOR;
        this.context.lineWidth = RenderingSettings.FIELD_LINEWIDTH;
        this.context.strokeRect( 0, 0, canvas.width, canvas.height );
        this.context.restore();
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

    renderPlayer( player, iIndexFrame)
    {
        this.context.save();
        // プレイヤーの座標値に移動
        this.context.translate( player.fX, player.fY );

        // 画像描画
        this.context.save();
        this.context.rotate( player.fAngle );
        this.context.drawImage( this.assets.imageItems,
            this.assets.arectPlayerInItemsImage[iIndexFrame].sx, this.assets.arectPlayerInItemsImage[iIndexFrame].sy,	// 描画元画像の右上座標
            this.assets.arectPlayerInItemsImage[iIndexFrame].sw, this.assets.arectPlayerInItemsImage[iIndexFrame].sh,	// 描画元画像の大きさ
            -SharedSettings.PLAYER_WIDTH * 0.5,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
            -SharedSettings.PLAYER_HEIGHT * 0.5,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
            SharedSettings.PLAYER_WIDTH,	// 描画先領域の大きさ
            SharedSettings.PLAYER_HEIGHT );	// 描画先領域の大きさ
        this.context.restore();
        // ニックネーム
        this.context.save();
        this.context.textAlign = 'center';
        this.context.font = RenderingSettings.NICKNAME_FONT;
        this.context.fillStyle = RenderingSettings.NICKNAME_COLOR;
        this.context.fillText( player.strNickName, 0, -50 );
        this.context.restore();

        this.context.restore();

    }
}
