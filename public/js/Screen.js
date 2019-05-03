// スクリーンクラス
class Screen
{
    // コンストラクタ
    constructor( socket, canvas )
    {
        this.socket = socket;
        this.canvas = canvas;
        this.context = canvas.getContext( '2d' );
        this.iProcessingTimeNanoSec = 0;
        this.aPlayer = null;
        this.assets = new Assets();
        // キャンバスの初期化
        this.canvas.width = SharedSettings.FIELD_WIDTH;
        this.canvas.height = SharedSettings.FIELD_HEIGHT;
        this.aCard = null;
        this.aNumber = null;
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

        // デッドしたらスタート画面に戻る
        this.socket.on(
            'enter-the-game',
            ( aPlayer ) =>
            {
                if ( !aPlayer ){
                    return;
                }
                aPlayer.forEach(
                    ( player ) =>
                    {
                        this.assets.setPlayerIcon(player);
                    } );
            } );

        // サーバーからの状態通知に対する処理
        // ・サーバー側の周期的処理の「io.sockets.emit( 'update', ・・・ );」に対する処理
        this.socket.on(
            'update',
            ( aPlayer, aCard, aNumber, iProcessingTimeNanoSec ) =>
            {
                this.aPlayer = aPlayer;
                this.aCard = aCard;
                this.aNumber = aNumber;
                this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
            } );

        // カードを配る
        this.socket.on(
            'start-the-game',
            () =>
            {
                this.socket.emit( 'deal-card' );
            } );

        // カード配ったあとの宣言フェーズ
        this.socket.on(
            'deal-end',
            () =>
            {
                this.socket.emit( 'declaration' );
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
        // キャンバスの塗りつぶし
        this.renderField();

        // カードの描画
        if( null !== this.aCard )
        {
            this.aCard.forEach(
                ( card ) =>
                {
                    this.renderCard( card );
                } );
        }

        // プレイヤーの描画
        if( null !== this.aPlayer )
        {
            this.aPlayer.forEach(
                ( player ) =>
                {
                    this.renderPlayer( player );
                } );
        }

        // ナンバーの描画
        if( null !== this.aNumber )
        {
            this.aNumber.forEach(
                ( number ) =>
                {
                    this.renderNumber( number );
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
        var img = this.assets.returnIcon(player.strSocketID);
        if (!img) return;
        var ctx = this.context;
        ctx.save();
        ctx.drawImage( img,
            player.fX, player.fY,
            SharedSettings.PLAYER_WIDTH,
            SharedSettings.PLAYER_HEIGHT                  
            );	

         // カードがある場合は、ついでに,他プレイヤーのカードも隠す。
         // 最終的に、ソケットがプレイヤーじゃない場合は隠さないようにする
        if (this.socket.id !== player.strSocketID && this.aCard.length > 0) {
            ctx.drawImage( this.assets.imageField,
                player.fX - 150, player.fY + 165,
                500,85
                );	// 描画先領域の大きさ
        }

        ctx.restore();

        // ニックネーム
        ctx.save();
        ctx.restore();
        ctx.textAlign = 'center';
        ctx.font = RenderingSettings.NICKNAME_FONT;
        ctx.fillStyle = RenderingSettings.NICKNAME_COLOR;
        ctx.fillText( player.strNickName, player.fX + 80, player.fY - 20);
        ctx.restore();
        ctx.restore();  
    }
    
    onClick(e) {
        console.log("click");
        var x = e.clientX - canvas.offsetLeft;
        var y = e.clientY - canvas.offsetTop - 21;
        let c = null;
        let n = null;
        let isClicked = false;
        // クリックした座標にカードが位置している場合、ちょっと上に上げる

        this.aNumber.forEach(
            ( number ) =>
            {
                if ((number.fX <= x && x <= number.fX + SharedSettings.NUMBER_WIDTH) 
                    &&
                    (number.fY <= y && y <= number.fY + SharedSettings.NUMBER_HEIGHT) 
                    ){
                        n = number;
                        // サーバにクリックされたことを伝える
                        this.socket.emit( 'number-clicked' , number );
                        isClicked = true;
                }
            } );
            // カードしてない他のナンバーを全てクリックを外す
            this.aNumber.forEach(
                ( number ) =>
                {
                    if (number !== n) {
                        // サーバにクリックされたことを伝える
                        this.socket.emit( 'number-unclicked' , number );
                    }
                } );              
        
        if (!isClicked){
            this.aCard.forEach(
                ( card ) =>
                {
                    if ((card.fX <= x && x <= card.fX + SharedSettings.CARD_WIDTH) 
                        &&
                        (card.fY <= y && y <= card.fY + SharedSettings.CARD_HEIGHT) 
                        ){
                            c = card;
                            // サーバにクリックされたことを伝える
                            this.socket.emit( 'card-clicked' , card );
                    }
                } );
    
            // クリックしてない他のカードを全てクリックを外す
            this.aCard.forEach(
                ( card ) =>
                {
                    if (card !== c) {
                        // サーバにクリックされたことを伝える
                        this.socket.emit( 'card-unclicked' , card );
                    }
                } );  
        }

        console.log("x:", x, "y:", y);
    }
    
    renderCard( card )
    {
        let img = this.assets.returnCard(card)[0];
        if (card.left) {
            img = this.assets.back;
        }
        this.context.save();
        this.context.drawImage( img,
            card.fX, card.fY,
            SharedSettings.CARD_WIDTH,	// 描画先領域の大きさ
            SharedSettings.CARD_HEIGHT                  
            );	// 描画先領域の大きさ
        this.context.restore();
    }

    renderNumber( number )
    {
        let img = this.assets.returnNumber(number)[0];
        if (number.selected) {
            img = this.assets.returnColorNumber(number)[0];
        }
        this.context.save();
        this.context.drawImage( img,
            number.fX, number.fY,
            SharedSettings.NUMBER_WIDTH,	// 描画先領域の大きさ
            SharedSettings.NUMBER_HEIGHT                  
            );	// 描画先領域の大きさ
        this.context.restore();
    }
}
