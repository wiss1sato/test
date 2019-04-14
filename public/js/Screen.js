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
        this.aTank = null;

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
                // サーバーに'enter-the-game'を送信
                // this.socket.emit( 'enter-the-game' );
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
            ( aTank, iProcessingTimeNanoSec ) =>
            {
                this.aTank = aTank;
                this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
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

        // タンクの描画
        if( null !== this.aTank )
        {
            const fTimeCurrentSec = iTimeCurrent * 0.001; // iTimeCurrentは、ミリ秒。秒に変換。
            const iIndexFrame = parseInt( fTimeCurrentSec / 0.2 ) % 2;  // フレーム番号
            this.aTank.forEach(
                ( tank ) =>
                {
                    this.renderTank( tank, iIndexFrame );
                } );
        }

        // キャンバスの枠の描画
        this.context.save();
        this.context.strokeStyle = RenderingSettings.FIELD_LINECOLOR;
        this.context.lineWidth = RenderingSettings.FIELD_LINEWIDTH;
        this.context.strokeRect( 0, 0, canvas.width, canvas.height );
        this.context.restore();

        // 画面右上にサーバー処理時間表示
        this.context.save();
        this.context.font = RenderingSettings.PROCESSINGTIME_FONT;
        this.context.fillStyle = RenderingSettings.PROCESSINGTIME_COLOR;
        this.context.fillText( ( this.iProcessingTimeNanoSec * 1e-9 ).toFixed( 9 ) + ' [s]',
            this.canvas.width - 30 * 10,
            40 );
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

    renderTank( tank, iIndexFrame )
    {
        this.context.save();

        // タンクの座標値に移動
        this.context.translate( tank.fX, tank.fY );

        // 画像描画
        this.context.save();
        this.context.rotate( tank.fAngle );
        this.context.drawImage( this.assets.imageItems,
            this.assets.arectTankInItemsImage[iIndexFrame].sx, this.assets.arectTankInItemsImage[iIndexFrame].sy,	// 描画元画像の右上座標
            this.assets.arectTankInItemsImage[iIndexFrame].sw, this.assets.arectTankInItemsImage[iIndexFrame].sh,	// 描画元画像の大きさ
            -SharedSettings.TANK_WIDTH * 0.5,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
            -SharedSettings.TANK_HEIGHT * 0.5,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
            SharedSettings.TANK_WIDTH,	// 描画先領域の大きさ
            SharedSettings.TANK_HEIGHT );	// 描画先領域の大きさ
        this.context.restore();

        // ニックネーム
        this.context.save();
        this.context.textAlign = 'center';
        this.context.font = RenderingSettings.NICKNAME_FONT;
        this.context.fillStyle = RenderingSettings.NICKNAME_COLOR;
        this.context.fillText( tank.strNickName, 0, -50 );
        this.context.restore();

        this.context.restore();

    }
}
