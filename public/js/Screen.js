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
        // →カードの画質が悪くなるのでコメントアウト
        // this.context.mozImageSmoothingEnabled = false;
        // this.context.webkitImageSmoothingEnabled = false;
        // this.context.msImageSmoothingEnabled = false;
        // this.context.imageSmoothingEnabled = false;

        canvas.addEventListener('mousedown', this.onDown, false);
        canvas.addEventListener('mouseup', this.onUp, false);
        canvas.addEventListener('click', this.onClick.bind(this), false);
        canvas.addEventListener('mouseover', this.onOver, false);
        canvas.addEventListener('mouseout', this.onOut, false);
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

            // ゲーム開始
        this.socket.on(
            'start-the-game',
            (aPlayer) =>
            {
                this.aPlayer = aPlayer;
                let card = null;
                let cardList = [];
            // カードデータを全て生成する
            for (let i = 1; i <= 4; i++) {
                for (let j = 1; j <= 13; j++) {
                    if (i === 1) {
                        card ='s' + j;
                    }
                    if (i === 2) {
                        card = 'c' + j;
                    }
                    if (i === 3) {
                        card = 'd' + j;
                    }
                    if (i === 4) {
                        card = 'h' + j;
                    }
                    cardList.push(card);
                }
            }
            cardList.push('jo');
            // 並び替え
            // for (let i = cardList.length - 1; i >= 0; i--){
            //     // 0~iのランダムな数値を取得
            //     let rand = Math.floor( Math.random() * ( i + 1 ) );
            //     // 配列の数値を入れ替える
            //     [cardList[i], cardList[rand]] = [cardList[rand], cardList[i]]
            //   }
            // 各プレイヤーに配る
            this.aPlayer.forEach(
                ( player ) =>
                {
                    console.log('aaa');
                    let cards = cardList.splice(0,10);
                    this.socket.emit( 'deal-card' , player,  cards );
                } );
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

    //　プレイヤー描写
    renderPlayer( player )
    {
        var src = '../images/' + player.iconName;
        var ctx = this.context;
        this.preloadImages(src).done(function () {
            var img = new Image();
            img.src = src;
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
    }

    // アイコンを読み込むためのメソッド
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
    
    onClick(e) {
        console.log("click");
        var x = e.clientX - canvas.offsetLeft;
        var y = e.clientY - canvas.offsetTop;

        // クリックした座標にカードが位置している場合、ちょっと上に上げる
        this.aCard.forEach(
            ( card ) =>
            {
                if ((card.fX <= x && x <= card.fX + SharedSettings.CARD_WIDTH) 
                    &&
                    (card.fY <= y && y <= card.fY + SharedSettings.CARD_HEIGHT) 
                    ){
                        // サーバにクリックされたことを伝える
                        this.socket.emit( 'card-clicked' , card );
                }
            } );

        console.log("x:", x, "y:", y);
    }
    
    renderCard( card )
    {
        var img = this.assets.returnCard(card);
        this.context.save();
        this.context.drawImage( img[0],
            card.fX, card.fY,
            SharedSettings.CARD_WIDTH,	// 描画先領域の大きさ
            SharedSettings.CARD_HEIGHT                  
            );	// 描画先領域の大きさ
        this.context.restore();
    }

}
