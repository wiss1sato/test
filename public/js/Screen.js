// スクリーンクラス
class Screen
{
    // コンストラクタaa
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
        this.aPassCnt = null;
        this.kirifuda = null;
        this.maisuu = null;
        this.napoleon = null;
        this.fukukan = null;
        this.reverse = false;
        this.designationCard = null;
        this.frame = new Object();
        this.viewerSocketIdList = [];
        this.phase = null;
        this.fieldCardLength = null;
        this.daifudaJoker = false;
        this.daifudaJokerMark = null;
        this.declarationNumber = null;
        this.declarationMark = null;
        this.winnerString = null;
        this.isClicked = false;

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
            
        // ゲーム入室時
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
                        if (player.viewerMode && this.viewerSocketIdList.indexOf(player.strSocketID) == -1){
                            this.viewerSocketIdList.push(player.strSocketID)                            
                        }
                        this.assets.setPlayerIcon(player);
                    } );
            } );

        // サーバーからの状態通知に対する処理
        // ・サーバー側の周期的処理の「io.sockets.emit( 'update', ・・・ );」に対する処理


        this.socket.on(
            'update',
            ( aPlayer, aCard, aNumber, aMark, aTeban, aPassCnt, designationCard, reverse, phase,
                napoleon, fukukan, fieldCardLength, iProcessingTimeNanoSec, winnerString ) =>
            {
                this.aPlayer = aPlayer;
                this.aCard = aCard;
                this.aNumber = aNumber;
                this.aMark = aMark;
                this.aTeban = aTeban;
                this.aPassCnt = aPassCnt;
                this.designationCard = designationCard;
                this.reverse = reverse;
                this.phase = phase;
                this.napoleon = napoleon;
                this.fukukan = fukukan;
                this.fieldCardLength = fieldCardLength;
                this.winnerString = winnerString;
                this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
                this.isClicked = false
            } );

        // カードを配る。
        // もろもろを初期化する
        this.socket.on(
            'start-the-game',
            () =>
            {
                this.kirifuda = null;
                this.maisuu = null;
                this.napoleon = null;
                this.fukukan = null;
                this.reverse = false;
                this.designationCard = null;
                this.frame = new Object();
                this.phase = null;
                this.fieldCardLength = null;
                this.daifudaJoker = false;
                this.daifudaJokerMark = null;
                this.declarationNumber = null;
                this.declarationMark = null;
                this.socket.emit( 'deal-card' );
            } );

        // カード配ったあと,宣言フェーズに以降
        this.socket.on(
            'deal-end',
            () =>
            {
                this.aTeban = 1;
            } );

        // 宣言フェーズ中、他プレイヤーが選択したマークを受け取る
        this.socket.on(
            'send-mark-num',
            (decNum, decMark) =>
            {
                this.declarationNumber = decNum;
                this.declarationMark = decMark;
            } );            

        // 宣言フェーズが終わったら、副官札指定フェーズ
        this.socket.on(
            'declaration-end',
            ( mark, number, napoleon ) =>
            {
                console.log('宣言マーク:' + mark + ',宣言枚数:' + number, ',ナポレオン:' + napoleon);
                this.kirifuda = mark;
                this.maisuu = number;
                this.napoleon = napoleon;
            } );

        this.socket.on(
            'designation-end',
            ( designationCard ) =>
            {
                console.log('副官札:' + designationCard);
                this.designationCard = designationCard;
            } );

        // カードを配る
        this.socket.on(
            'change-end',
            () =>
            {
                // this.mainGame = true;
            } );     

        // ジョーカーが台札だったときの特別な処理
        this.socket.on(
            'daifuda-joker-true',
            () =>
            {
                this.daifudaJoker = true;
            } );
        // ジョーカーが台札だったときの特別な処理
        this.socket.on(
            'daifuda-joker-mark',
            (mark) =>
            {
                this.daifudaJokerMark = mark;
            } );            
        // ジョーカーが台札だったときの特別な処理(終了)
        this.socket.on(
            'daifuda-joker-end',
            () =>
            {
                this.daifudaJoker = false;
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

        // 勝ち札の描画
        if( null !== this.winnerString )
        {
            this.renderWinnerString( this.winnerString );
        }        

    }

    renderWinnerString(winnerString) {
        this.context.fillText(winnerString, 730, 140);
    }

    renderField()
    {
        this.context.save();
        this.context.drawImage( this.assets.imageField,
        this.assets.rectFieldInFieldImage.sx, this.assets.rectFieldInFieldImage.sy,	// 描画元画像の右上座標
        this.assets.rectFieldInFieldImage.sw, this.assets.rectFieldInFieldImage.sh,	// 描画元画像の大きさ
        );	// 描画先領域の大きさ
        // 交換フェーズ、メインフェーズ時には副官指名札も表示する
        if (this.phase === 'mainGame' || this.phase === 'change') {
            let img = this.assets.returnCard(this.designationCard)[0];
            this.context.drawImage( img,
                830, 0,
                75,105
                );
        }

        // メインフェーズ時には周り順を表示する
        if (this.phase === 'mainGame') {
            let img = this.assets.clockwise;
            if (this.reverse) {
                img = this.assets.reverse;
            }
            this.context.drawImage( img,
                700, 170,
                120,120
                );
        }  
        
     if (this.daifudaJoker) {
            let img = this.assets.spade;
            this.context.drawImage( img,
                670, 240,
                50,70
                );
            img = this.assets.heart;
            this.context.drawImage( img,
                730, 240,
                50,70
                );
            img = this.assets.diamond;
            this.context.drawImage( img,
                790, 240,
                50,70
                );
            img = this.assets.clover;
            this.context.drawImage( img,
                850, 240,
                50,70
                );
        }

        // カードがある場合は、ついでに,他プレイヤーのカードも隠す。
        // 観戦者は隠さない
        if (this.viewerSocketIdList.indexOf(this.socket.id) >= 0) {
            this.context.fillText( '観戦者モード', 1150, 750);
        }

        // 副官指定フェーズ中は、ナポレオンプレイヤーだけ副官指定札を表示する
        if (this.napoleon === this.socket.id && this.phase === 'designation' && this.viewerSocketIdList.indexOf(this.socket.id) == - 1) {
            let img = this.assets.returnCard('s1')[0];
            this.context.drawImage( img,
                600, 240,
                75,105
                );
            img = this.assets.returnCard('jo')[0];
            this.context.drawImage( img,
                676, 240,
                75,105
                );                
            // 切り札が黒の場合
            if (this.kirifuda === 'spade' || this.kirifuda === 'clover') {
                img = this.assets.returnCard('s11')[0];
                this.context.drawImage( img,
                    751, 240,
                    75,105
                    );	// 描画先領域の大きさ
                img = this.assets.returnCard('c11')[0];
                this.context.drawImage( img,
                    826, 240,
                    75,105
                    );	// 描画先領域の大きさ                                 
            } else {
                img = this.assets.returnCard('h11')[0];
                this.context.drawImage( img,
                    751, 240,
                    75,105
                    );	// 描画先領域の大きさ
                img = this.assets.returnCard('d11')[0];
                this.context.drawImage( img,
                    826, 240,
                    75,105
                    );	// 描画先領域の大きさ  
            }
            img = this.assets.returnCard('h12')[0];
            this.context.drawImage( img,
                901, 240,
                75,105
                );                

            // 決定ボタン
            this.context.drawImage( this.assets.kettei,
                770, 375,
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

        this.context.restore();
    }

    //　プレイヤー描写
    renderPlayer( player )
    {
        var img = this.assets.returnIcon(player.strSocketID);
        if (!img) return;
        var ctx = this.context;
        if (!player.viewerMode){
            ctx.save();
            ctx.drawImage( img,
                player.fX, player.fY,
                SharedSettings.PLAYER_WIDTH,
                SharedSettings.PLAYER_HEIGHT                  
                );	
            }

        // 手番の場合は、手番マークを表示
        if (this.aTeban === player.playerNum) {
            ctx.drawImage( this.assets.teban,
                player.fX + 180, player.fY + 10,
                60,40
                );
        }

        // 宣言時に手番の場合、自分のエリアにボタン配置
        if (this.phase === 'declaration' && this.aTeban === player.playerNum && this.socket.id === player.strSocketID) {
            this.context.drawImage( this.assets.pass,
                700, 350,
                60,40
                );              
            this.context.drawImage( this.assets.kettei,
                770, 350,
                60,40
                );
        }
        // 宣言用のOK/パス

        // カード用のOK
        if (this.phase === 'change' && this.socket.id === player.strSocketID && this.aTeban === player.playerNum) {
            ctx.drawImage( this.assets.ok,
                player.fX + 280, player.fY + 200,
                60,40
                );	// 描画先領域の大きさ
        }        

        // カード用のOK
         if (this.phase === 'mainGame' && this.socket.id === player.strSocketID && this.aTeban === player.playerNum) {
            ctx.drawImage( this.assets.ok,
                player.fX + 280, player.fY + 200,
                60,40
                );	// 描画先領域の大きさ
        }
        ctx.restore();

        // ナポの表示
        if (player.strSocketID === this.napoleon && this.phase !== 'declaration') {
            ctx.drawImage( this.assets.napoleon,
                player.fX - 100, player.fY,
                90, 55
                );	// 描画先領域の大きさ
        }
        if(this.phase === 'declaration' && player.strSocketID === this.napoleon) {
            let mark = this.assets.returnMark(this.declarationMark)[0];
            let num = this.assets.returnNumber(this.declarationNumber)[0];
            ctx.drawImage( mark,
                player.fX - 100, player.fY,
                45, 55
                );	// 描画先領域の大きさ
            ctx.drawImage( num,
                player.fX - 55, player.fY,
                45, 55
                );	// 描画先領域の大きさ                            
        }
        

        // 副官の表示
        if (player.strSocketID === this.fukukan) {
            ctx.drawImage( this.assets.fukukan,
                player.fX - 100, player.fY + 60,
                90, 55
                );	// 描画先領域の大きさ
        }
        ctx.restore();

        // ニックネーム
        ctx.save();
        ctx.restore();
        ctx.textAlign = 'center';
        ctx.font = RenderingSettings.NICKNAME_FONT;
        ctx.fillStyle = RenderingSettings.NICKNAME_COLOR;
        ctx.fillText( player.strNickName, player.fX + 80, player.fY - 5);
        // 絵札の枚数
        ctx.fillText( player.efuda + '枚', player.fX -60, player.fY + 145);
        ctx.restore();
        ctx.restore();  
    }
    //　クリックされた時の処理
    async onClick(e) {
        var x = e.clientX - canvas.offsetLeft;
        var y = e.clientY - canvas.offsetTop - 21;
        let c = null;
        let n = null;
        let m = null;
        let isNumberClicked = false;
        let isCardClicked = false;
        let isMarkClicked = false;
        // 手番プレイヤーの確認
        let tebanPlayerFlg = false;
        this.aPlayer.forEach(
            ( p ) =>
            {
                if (p.strSocketID === this.socket.id) {
                    console.log(this.aTeban);
                   if (p.playerNum == this.aTeban && !this.isClicked) {
                        tebanPlayerFlg = true;
                        this.isClicked = true;
                   } 
                }
            } );
        // 手番ではないプレイヤーのクリックは受け付けない
        if (!tebanPlayerFlg) return;
        // 宣言フェーズ時
        if (this.phase === 'declaration') {
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
                            // サーバにクリックされたことを伝える
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
                // サーバにクリックされたことを伝える
                this.socket.emit( 'pass-clicked');
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
                    if( n.num > this.declarationNumber) {
                        this.socket.emit( 'kettei-clicked', this.socket.id , n , m);
                    }
                    // 数値が一緒の場合,現在宣言中のマークと照合する
                    if( n.num == this.declarationNumber) {
                        // 選択されているのがクローバーの場合、ダイヤ、ハート、スペードのみ上書き可能・・・というようにする
                        if (this.declarationMark === 'clover') {
                            if (m.markId === 'diamond' || m.markId === 'heart' || m.markId === 'spade') {
                                this.socket.emit( 'kettei-clicked', this.socket.id , n , m);
                            } 
                        } else if (this.declarationMark === 'diamond') {
                            if (m.markId === 'heart' || m.markId === 'spade') {
                                this.socket.emit( 'kettei-clicked', this.socket.id , n , m);
                            } 
                        } else if (this.declarationMark === 'heart') {
                            if (m.markId === 'spade') {
                                this.socket.emit( 'kettei-clicked', this.socket.id , n , m);
                            } 
                        }
                    }
                        // スペードは上書き不可だからこのままでいいや
                }
            }
        }

        // 指名フェーズ時(大したことがないのでベタで書いちゃう)
        if (this.phase === 'designation') {
            this.frame.fY = 240;
            // マイティ
            if ((600 <= x && x <= 675) 
            &&
            (240 <= y && y <= 355) 
            ){
                this.designationCard = 's1';
                this.frame.fX = 600;
                this.socket.emit( 'designation-card-clicked', this.designationCard);
            }
            // jo
            if ((676 <= x && x <= 750) 
            &&
            (240 <= y && y <= 355) 
            ){
                this.designationCard = 'jo';
                this.frame.fX = 676;
                this.socket.emit( 'designation-card-clicked', this.designationCard);                  
            }
            // s11かh11
            if ((751 <= x && x <= 825) 
            &&
            (240 <= y && y <= 355) 
            ){
                if (this.kirifuda === 'spade' || this.kirifuda === 'clover' ){
                    this.designationCard = 's11';
                } else {
                    this.designationCard = 'h11';
                }
                this.frame.fX = 751;
                this.socket.emit( 'designation-card-clicked', this.designationCard);  
            }
            // c11かd11
            if ((826 <= x && x <= 900) 
            &&
            (240 <= y && y <= 355) 
            ){
                if (this.kirifuda === 'spade' || this.kirifuda === 'clover' ){
                    this.designationCard = 'c11';
                } else {
                    this.designationCard = 'd11';
                }
            this.socket.emit( 'designation-card-clicked', this.designationCard);                  
            this.frame.fX = 826;
            }
            // よろめき
            if ((901 <= x && x <= 976) 
            &&
            (240 <= y && y <= 355) 
            ){
                this.designationCard = 'h12';
                this.frame.fX = 901;
                this.socket.emit( 'designation-card-clicked', this.designationCard);  
            }

            // 決定を押したとき
            if ((770 <= x && x <= 830) 
            &&
            (380 <= y && y <= 420) 
            ){
                // 副官指定札が決まってるとき、'kettei-clicked-designation'をサーバに通知
                if (this.designationCard) this.socket.emit( 'kettei-clicked-designation', this.designationCard);  
            }
        }

       // 交換フェーズ時(ナポレオンのみ)
       if (this.phase === 'change' && this.napoleon === this.socket.id) {
        this.aCard.forEach(
            ( card ) =>
            {
                if (card.fX <= x && x <= card.fX + 21
                    &&
                    card.fY <= y && y <= card.fY + SharedSettings.CARD_HEIGHT 
                    &&
                    card.playerId === this.socket.id
                    ){
                        c = card;
                        // サーバにクリックされたことを伝える
                        this.socket.emit( 'card-clicked' , card );
                } else if (card.fX <= x && x <= card.fX + SharedSettings.CARD_WIDTH
                    &&
                    card.fY <= y && y <= card.fY + SharedSettings.CARD_HEIGHT
                    &&
                    card.playerId === this.socket.id
                    )
                    {
                        let lastCard = null;
                        for(let i = this.aCard.length - 1; i >= 0; i--) {
                            if (this.aCard[i].playerId === this.socket.id){
                                lastCard = this.aCard[i];
                                break;
                            } 
                        }
                    // 全部見えてるカードのときは、条件によっては全部の領域クリックを許す
                    if (card === lastCard) {
                        c = card;
                        // サーバにクリックされたことを伝える
                        this.socket.emit( 'card-clicked' , card );
                    }
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
            if ((player.fX + 280 <= x && x <= player.fX + 340) 
            &&
            (player.fY + 200 <= y && y <= player.fY + 240) 
        ){
            let selectedCnt = 0;
            let discards = [];
            this.aCard.forEach(
                ( card ) =>
                {
                    if(card.selected) {
                        selectedCnt += 1;
                        discards.push (card);
                    }
                } ); 
            if(selectedCnt === 3){
                this.socket.emit( 'change-discards', discards);
            }
        }
     }

        // メインフェーズ時
        if (this.phase === 'mainGame') {

            // 台札ジョーカーのときだけ特別処理
            if(this.daifudaJoker) {
                let mark2 = null;
                // スペード
                if ((670 <= x && x <= 720) 
                &&
                (240 <= y && y <= 310) 
                ){
                    mark2 = 'spade'              
                } else if ((730 <= x && x <= 780) 
                &&
                (240 <= y && y <= 310) 
                ){
                    mark2 = 'heart'              
                }
                else if ((790 <= x && x <= 840) 
                &&
                (240 <= y && y <= 310) 
                ){
                    mark2 = 'diamond'              
                }
                else if ((850 <= x && x <= 900) 
                &&
                (240 <= y && y <= 310) 
                ){
                    mark2 = 'clover'              
                }
                // ここで他の場所クリックされると壊れるので、returnする。 
                else {
                    return;
                }
                // jo探す
                let joker = null;
                this.aCard.forEach(
                    ( card ) =>
                    {
                        if(card.cardId === ('jo')) joker = card;
                    } );
                    this.socket.emit( 'discard' , joker,  mark2);
            }
            // カードの選択時
            this.aCard.forEach(
                ( card ) =>
                {
                    if (card.fX <= x && x <= card.fX + 21
                        &&
                        card.fY <= y && y <= card.fY + SharedSettings.CARD_HEIGHT
                        &&
                        card.playerId === this.socket.id
                        &&
                        card.request
                        &&
                        !card.change
                        )
                        {
                            c = card;
                            // サーバにクリックされたことを伝える
                            this.socket.emit( 'card-clicked' , card );
                            isCardClicked = true;
                    // カードの全領域をクリックされたとき（＝最後のカード）の判定
                    } else if (card.fX <= x && x <= card.fX + SharedSettings.CARD_WIDTH
                        &&
                        card.fY <= y && y <= card.fY + SharedSettings.CARD_HEIGHT
                        &&
                        card.playerId === this.socket.id
                        &&
                        card.request
                        &&
                        !card.change
                        )
                        {
                            let lastCard = null;
                            for(let i = this.aCard.length - 1; i >= 0; i--) {
                                if (this.aCard[i].playerId === this.socket.id){
                                    lastCard = this.aCard[i];
                                    break;
                                } 
                            }
                        // 全部見えてるカードのときは、条件によっては全部の領域クリックを許す
                        if (card === lastCard) {
                            c = card;
                            // サーバにクリックされたことを伝える
                            this.socket.emit( 'card-clicked' , card );
                            isCardClicked = true;
                        }
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
            if ((player.fX + 280 <= x && x <= player.fX + 340) 
            &&
            (player.fY + 200 <= y && y <= player.fY + 240) 
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
                    // joが台札のときだけ超特殊処理
                    if(card.cardId === 'jo' && this.fieldCardLength == 0) {
                        this.socket.emit( 'daifuda-joker' );
                    } else {
                        this.socket.emit( 'discard' , card);
                    }
                }
            }            
         }
    }
    
    renderCard( card )
    {

        if((card.playerId) && card.playerId !== this.socket.id && this.viewerSocketIdList.indexOf(this.socket.id) == - 1) return;

        let img = this.assets.returnCard(card.cardId)[0];
        if (card.back) {
            img = this.assets.back;
        }
        this.context.save();

        if(card.playerId) {
            this.context.drawImage( img,
                card.fX, card.fY,
                SharedSettings.CARD_WIDTH,
                SharedSettings.CARD_HEIGHT                  
                );
        } else {
            this.context.drawImage( img,
                card.fX, card.fY,
                SharedSettings.CARD_WIDTH + 15,
                SharedSettings.CARD_HEIGHT + 23              
                );
        }        // 台札ジョーカーのときだけ、カードの上にマークを描画
        if(card.cardId === 'jo' && this.daifudaJokerMark) {
            img = this.assets.returnMark(this.daifudaJokerMark)[0];
            this.context.drawImage( img,
                card.fX + 42, card.fY + 5,
                20,20                  
            );
        }

        // 台札が決まってるときは、出せるカードの周りに枠をつける
        if (card.request && card.playerNum == this.aTeban){
            img = this.assets.frame;
            this.context.drawImage( img,
                card.fX, card.fY,
                SharedSettings.CARD_WIDTH,
                SharedSettings.CARD_HEIGHT                  
                );
        }
        this.context.restore();
    }

    renderNumber( number )
    {
        let img = null;
        // 宣言フェーズ中のみナンバーを全て表示
        if (this.phase === 'declaration') {
            img = this.assets.returnNumber(number.num)[0];
            if (number.selected) {
                img = this.assets.returnColorNumber(number.num)[0];
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
            img = this.assets.returnNumber(number.num)[0];
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
        let img = this.assets.returnMark(mark.markId)[0];
        if (mark.selected) {
            img = this.assets.returnColorMark(mark.markId)[0];
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
