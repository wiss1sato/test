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
        this.aMark = null;
        this.aTeban = null;
        this.declaration = false;
        this.designation = false;
        this.change = false;
        this.mainGame = false;
        this.aPassCnt = null;
        this.kirihuda = null;
        this.maisuu = null;
        this.napoleon = null;
        this.fukukan = null;
        this.designationCard = null;
        this.frame = new Object();       

        // ソケットの初期化
        this.initSocket();

        // コンテキストの初期化
        // アンチエイリアスの抑止（画像がぼやけるのの防止）以下４行
        // →カードの画質が悪くなるのでコメントアウト
        // this.context.mozImageSmoothingEnabled = false;
        // this.context.webkitImageSmoothingEnabled = false;
        // this.context.msImageSmoothingEnabled = false;
        // this.context.imageSmoothingEnabled = false;

        canvas.addEventListener('click', this.onClick.bind(this), false);

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
            ( aPlayer, aCard, aNumber, aMark, aTeban, aPassCnt, iProcessingTimeNanoSec ) =>
            {
                this.aPlayer = aPlayer;
                this.aCard = aCard;
                this.aNumber = aNumber;
                this.aMark = aMark;
                this.aTeban = aTeban;
                this.aPassCnt = aPassCnt;
                this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
            } );

        // カードを配る
        this.socket.on(
            'start-the-game',
            () =>
            {
                this.socket.emit( 'deal-card' );
            } );

        // カード配ったあと,宣言フェーズに以降
        this.socket.on(
            'deal-end',
            () =>
            {
                this.aTeban = 1;
                this.declaration = true;
            } );

        // 宣言フェーズが終わったら、副官札指定フェーズ
        this.socket.on(
            'declaration-end',
            ( mark, number, napoleon ) =>
            {
                console.log('宣言マーク:' + mark.markId + ',宣言枚数:' + number.num, ',ナポレオン:' + napoleon);
                this.kirihuda = mark.markId;
                this.maisuu = number.num;
                this.napoleon = napoleon;
                this.declaration = false;
                this.designation = true;
            } );

        this.socket.on(
            'designation-end',
            ( designationCard ) =>
            {
                console.log('宣言札:' + designationCard);
                this.designationCard = designationCard;
                this.designation = false;
                this.change = true;
            } );

        // カードを配る
        this.socket.on(
            'change-end',
            () =>
            {
                this.change = false;
                this.mainGame = true;
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

        // マークの描画
        if( null !== this.aMark )
        {
            this.aMark.forEach(
                ( mark ) =>
                {
                    this.renderMark( mark );
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
        // 交換フェーズ、メインフェーズ時には副官指名札も表示する
        if (this.mainGame || this.change) {
            let img = this.assets.returnCard(this.designationCard)[0];
            this.context.drawImage( img,
                830, 150,
                75,105
                );
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
                580,85
                );
        }

        // 手番の場合は、手番マークを表示
        if (this.aTeban === player.playerNum) {
            ctx.drawImage( this.assets.teban,
                player.fX + 200, player.fY + 20,
                60,40
                );
        }

        // 宣言時に手番の場合、自分のエリアにボタン配置
        if (this.declaration && this.aTeban === player.playerNum && this.socket.id === player.strSocketID) {
            this.context.drawImage( this.assets.pass,
                700, 350,
                60,40
                );              
            this.context.drawImage( this.assets.kettei,
                770, 350,
                60,40
                );
        }

        // 副官指定フェーズ中は、ナポレオンプレイヤーだけ副官指定札を表示する
        if (this.napoleon === this.socket.id && this.designation) {
            let img = this.assets.returnCard('s1')[0];
            this.context.drawImage( img,
                650, 350,
                75,105
                );
            img = this.assets.returnCard('jo')[0];
            this.context.drawImage( img,
                725, 350,
                75,105
                );                
            // 切り札が黒の場合
            if (this.kirihuda === 'spade' || this.kirihuda === 'clover') {
                img = this.assets.returnCard('s11')[0];
                this.context.drawImage( img,
                    800, 350,
                    75,105
                    );	// 描画先領域の大きさ
                img = this.assets.returnCard('c11')[0];
                this.context.drawImage( img,
                    875, 350,
                    75,105
                    );	// 描画先領域の大きさ                                 
            } else {
                img = this.assets.returnCard('h11')[0];
                this.context.drawImage( img,
                    800, 350,
                    75,105
                    );	// 描画先領域の大きさ
                img = this.assets.returnCard('d11')[0];
                this.context.drawImage( img,
                    875, 350,
                    75,105
                    );	// 描画先領域の大きさ  
            }

            // 決定ボタン
            this.context.drawImage( this.assets.kettei,
                770, 470,
                60,40
                );	// 描画先領域の大きさ

            // 指定切り札の枠
            if (!this.frame) return;
            let frameImg = this.assets.frame;
            this.context.drawImage( frameImg,
                this.frame.fX, this.frame.fY,
                75,105
            );
        }


        // 宣言用のOK/パス

        // カード用のOK
        if (this.change && this.socket.id === player.strSocketID && this.aTeban === player.playerNum) {
            ctx.drawImage( this.assets.ok,
                player.fX + 200, player.fY + 270,
                60,40
                );	// 描画先領域の大きさ
        }        

        // カード用のOK
         if (this.mainGame && this.socket.id === player.strSocketID && this.aTeban === player.playerNum) {
            ctx.drawImage( this.assets.ok,
                player.fX + 200, player.fY + 270,
                60,40
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

    //　クリックされた時の処理
    
    onClick(e) {
        console.log("click");
        var x = e.clientX - canvas.offsetLeft;
        var y = e.clientY - canvas.offsetTop - 21;
        let c = null;
        let n = null;
        let m = null;
        let isNumberClicked = false;
        let isCardClicked = false;
        let isMarkClicked = false;

        // 宣言フェーズ時
        if (this.declaration) {
        // 宣言時の数字が押されたとき
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
                            isNumberClicked = true;
                    }
                } );
            // 他のナンバーを全てクリックを外す
            if (isNumberClicked) {
                this.aNumber.forEach(
                    ( number ) =>
                    {
                        if (number !== n) {
                            this.socket.emit( 'number-unclicked' , number );
                        }
                    } );  
            }
            
            // マークをクリックした動き
            this.aMark.forEach(
                ( mark ) =>
                {
                    if ((mark.fX <= x && x <= mark.fX + SharedSettings.MARK_WIDTH) 
                        &&
                        (mark.fY <= y && y <= mark.fY + SharedSettings.MARK_HEIGHT) 
                        ){
                            m = mark;
                            // サーバにクリックされたことを伝える。ついでに、どのプレイヤーがクリックしたかが分かるようにソケットIDを入れる
                            this.socket.emit( 'mark-clicked' , mark );
                            isMarkClicked = true;
                    }
                } );
            if (isMarkClicked) {
            // 　他のマークを全てクリックを外す
            this.aMark.forEach(
                ( mark ) =>
                {
                    if (mark !== m) {
                        // サーバにクリックされたことを伝える
                        this.socket.emit( 'mark-unclicked' , mark );
                    }
                } );   
            }

            // パスを押されたとき
            if ((700 <= x && x <= 760) 
            &&
            (350 <= y && y <= 390) 
            ){
                // 現在宣言されているナンバーとマークを取得する
                this.aNumber.forEach(
                    ( number ) =>
                    {
                        if (number.selected)  n = number;
                    } );
                this.aMark.forEach(
                    ( mark ) =>
                    {
                        if (mark.selected)  m = mark;
                    } );
                // サーバにクリックされたことを伝える
                this.socket.emit( 'pass-clicked' , m , n );                
            }
            // 決定を押されたとき
            if ((770 <= x && x <= 830) 
            &&
            (350 <= y && y <= 390) 
            ){
                // マークとナンバーが選択中じゃなかったら押せないようにする
                this.aNumber.forEach(
                    ( number ) =>
                    {
                        if (number.selected)  n = number;
                    } );
                this.aMark.forEach(
                    ( mark ) =>
                    {
                        if (mark.selected)  m = mark;
                    } );
                if (n && m) {
                    this.socket.emit( 'kettei-clicked', this.socket.id);
                }
            }
        }

        // 指名フェーズ時(大したことがないのでベタで書いちゃう)
        if (this.designation) {
            this.frame.fY = 350;
            // マイティ
            if ((650 <= x && x <= 725) 
            &&
            (350 <= y && y <= 455) 
            ){
                this.designationCard = 's1';
                this.frame.fX = 650;
            }
            // jo
            if ((725 <= x && x <= 800) 
            &&
            (350 <= y && y <= 455) 
            ){
                this.designationCard = 'jo';
                this.frame.fX = 725;
            }
            // s11かh11
            if ((800 <= x && x <= 875) 
            &&
            (350 <= y && y <= 455) 
            ){
                if (this.kirihuda === 'spade' || this.kirihuda === 'clover' ){
                    this.designationCard = 's11';
                } else {
                    this.designationCard = 'h11';
                }
                this.frame.fX = 800;
            }
            // s11かh11
            if ((875 <= x && x <= 950) 
            &&
            (350 <= y && y <= 455) 
            ){
                if (this.kirihuda === 'spade' || this.kirihuda === 'clover' ){
                    this.designationCard = 'c11';
                } else {
                    this.designationCard = 'd11';
                }
            this.frame.fX = 875;
            }

            // 決定を押したとき
            if ((770 <= x && x <= 830) 
            &&
            (470 <= y && y <= 510) 
            ){
                // 副官指定札が決まってるとき、'kettei-clicked-designation'をサーバに通知
                if (this.designationCard) this.socket.emit( 'kettei-clicked-designation', this.designationCard);  
            }
        }

       // 交換フェーズ時
       if (this.change) {
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
                        isCardClicked = true;
                }
            } );    
            
        // OKを押したとき
        // 操作中のプレイヤーを取得する
        let player = null;
        this.aPlayer.forEach(
            ( p ) =>
            {
                if(p.strSocketID === this.socket.id) player = p;
            } );
        if ((player.fX + 200 <= x && x <= player.fX + 260) 
        &&
        (player.fY + 270 <= y && y <= player.fY + 310) 
        ){
            let selectedCnt = 0;
            let discards = [];
            this.aCard.forEach(
                ( card ) =>
                {
                    if(card.selected) {
                        selectedCnt += 1;
                        discards.push (card)
                    }
                } ); 
            if(selectedCnt === 3){
                this.socket.emit( 'change-discards', discards);
            }
        }
     }

        // メインフェーズ時
        if (this.mainGame) {
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
                            isCardClicked = true;
                    }
                } );
            if (isCardClicked){
                // 他のカードを全てクリックを外す
                this.aCard.forEach(
                    ( card ) =>
                    {
                        if (card !== c) {
                            // サーバにクリックされたことを伝える
                            this.socket.emit( 'card-unclicked' , card );
                        }
                    } );  
            }
        // OKを押したとき
        // 操作中のプレイヤーを取得する
        let player = null;
        this.aPlayer.forEach(
            ( p ) =>
            {
                if(p.strSocketID === this.socket.id) player = p;
            } );
            if ((player.fX + 200 <= x && x <= player.fX + 260) 
            &&
            (player.fY + 270 <= y && y <= player.fY + 310) 
            ){
                let card = null;
                this.aCard.forEach(
                    ( c ) =>
                    {
                        if(c.selected) {
                            card = c;
                        }
                    } ); 
                if(card){
                    this.socket.emit( 'discard' , card);
                }
            }            
         }

        console.log("x:", x, "y:", y);
    }
    
    renderCard( card )
    {
        let img = this.assets.returnCard(card.cardId)[0];
        if (card.left || card.efuda) {
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
        let img = null;
        // 宣言フェーズ中のみナンバーを全て表示
        if (this.declaration) {
            img = this.assets.returnNumber(number)[0];
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
        // それ以外は大きく表示    
        } else {
            img = this.assets.returnNumber(number)[0];
            this.context.save();
            this.context.drawImage( img,
                number.fX, number.fY,
                SharedSettings.MARK_WIDTH,	// 描画先領域の大きさ
                SharedSettings.MARK_WIDTH                  
                );	// 描画先領域の大きさ
            this.context.restore();
        }

    }

    renderMark( mark )
    {
        let img = this.assets.returnMark(mark)[0];
        if (mark.selected) {
            img = this.assets.returnColorMark(mark)[0];
        }
        this.context.save();
        this.context.drawImage( img,
            mark.fX, mark.fY,
            SharedSettings.MARK_WIDTH,	// 描画先領域の大きさ
            SharedSettings.MARK_HEIGHT                  
            );	// 描画先領域の大きさ
        this.context.restore();
    }
}
