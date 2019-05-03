// モジュール
const World = require( './World.js' );

// 設定
const GameSettings = require( './GameSettings.js' );

var fs = require("fs");

// ゲームクラス
// ・ワールドを保持する
// ・通信処理を有する
// ・周期的処理を有する
module.exports = class Game
{
    // 始動
    start( io )
    {
        // 変数
        const world = new World( io ); // setInterval()内での参照があるので、スコープを抜けても、生存し続ける（ガーベッジコレクションされない）。
        let iTimeLast = Date.now(); // setInterval()内での参照があるので、スコープを抜けても、生存し続ける（ガーベッジコレクションされない）。
        let playerNum = 0;
        let cardId = null;
        let cardList =  this.createCardList();
        let passCnt = 0;
        let teban = 1; 
        let cards = null;
        let leftCards = null;
        

        // 接続時の処理
        // ・サーバーとクライアントの接続が確立すると、
        // 　サーバーで、'connection'イベント
        // 　クライアントで、'connect'イベントが発生する
        io.on(
            'connection',
            ( socket ) =>
            {
                console.log( 'connection : socket.id = %s', socket.id );
                let player = null;	// コネクションごとのプレイヤーオブジェクト。イベントをまたいで使用される。
                let number = null;
                let mark = null;
                let napoleon = null;                
                // ゲーム開始時の処理の指定
                // ・クライアント側の接続確立時の「socket.emit( 'enter-the-game' );」に対する処理
                socket.on( 'enter-the-game', ( objConfig ) =>
                    {	// 自プレイヤーの作成
                        console.log( 'enter-the-game : socket.id = %s', socket.id );
                        // 何故かheroku上だとenter-the-gameしていないのにここが動いてしまいobjConfigがundefinedって怒られるので条件文を入れる
                        if (objConfig !== undefined) {
                            player = world.createPlayer( socket.id, objConfig.strNickName, objConfig.iconName);
                            io.emit( 'enter-the-game' , Array.from( world.setPlayer ));
                            playerNum = 0;
                            world.setPlayer.forEach(
                                // プレイヤー採番(一旦適当)
                                ( player ) =>
                                {  
                                    playerNum = playerNum  + 1;
                                    // 採番ごとに配置する
                                    player.setPlayer(playerNum);
                                } );

                                if (playerNum === 2) {
                                    // ゲーム開始を各プレイヤーに送信
                                    // カード生成
                                    for (let i = 1; i <= 4; i++) {
                                        for (let j = 2; j <= 13; j++) {
                                            if (i === 1) {
                                                world.createCard('s' + j);
                                            }
                                            if (i === 2) {
                                                world.createCard('h' + j);
                                            }
                                            if (i === 3) {
                                                world.createCard('d' + j);
                                            }
                                            if (i === 4) {
                                                world.createCard('c' + j);
                                            }
                                        }
                                        if (i === 1) {
                                            world.createCard('s' + 1);
                                        }
                                        if (i === 2) {
                                            world.createCard('h' + 1);
                                        }
                                        if (i === 3) {
                                            world.createCard('d' + 1);
                                        }
                                        if (i === 4) {
                                            world.createCard('c' + 1);
                                        }                                        
                                    }                                 
                                    // ジョーカー
                                    world.createCard('jo');
                                    // 数字を作成する
                                    let fX = 650;
                                    let fY = 270;
                                    for (let i = 11; i <= 20; i++) {
                                        if (i === 16) {
                                            fX = 650;
                                            fY = fY + 30;
                                        }
                                        number = world.createNumber(i);
                                        number.setPosition(fX,fY);
                                        fX = fX + 60;
                                    }
                                    // マークを作成する
                                    mark = world.createMark('spade');
                                    mark.setPosition(650,150);
                                    mark = world.createMark('heart');
                                    mark.setPosition(725,150);
                                    mark = world.createMark('diamond');
                                    mark.setPosition(800,150);
                                    mark = world.createMark('clover');
                                    mark.setPosition(875,150);

                                    // ボタンを作成する

                                    io.emit( 'start-the-game');

                                }                            
                            // 最新状況をクライアントに送信
                            // io.emit( 'enter-the-game', Array.from( world.setPlayer ));
                                // // ゲーム開始を各プレイヤーに送信
                                // io.emit( 'start-the-game', Array.from( world.setPlayer ));
                        }
                    } );

                // 切断時の処理の指定
                // ・クライアントが切断したら、サーバー側では'disconnect'イベントが発生する
                socket.on( 'disconnect',
                    () =>
                    {
                        console.log( 'disconnect : socket.id = %s', socket.id );
                        if( !player )
                        {
                            return;
                        }
                        playerNum = playerNum - 1;                        
                        world.destroyPlayer( player );
                        player = null;	// 自プレイヤーの解放
                        if (playerNum !== 5) {
                            // カードを全部消す
                            world.destroyCard();
                            // カードを全部消す
                            world.destroyNumber();
                            // マークを全部消す
                            world.destroyMark();
                            passCnt = 0;
                            teban = 1; 
                            // データはもう一回作る
                            cardList = this.createCardList()
                        }
                    } );

                    // カードがクリックされた時の処理（ちょっと上にあげる）
                    socket.on( 'card-clicked',
                    ( card ) =>
                    {
                        world.setCard.forEach(
                            ( c ) =>
                            {  
                                if (c.cardId === card.cardId) {
                                    c.cardClicked();
                                }
                            } );
                    } );

                    // カードがクリックされた時の処理（ちょっと上にあげる）
                    socket.on( 'card-unclicked',
                    ( card ) =>
                    {
                        world.setCard.forEach(
                            ( c ) =>
                            {  
                                if (c.cardId === card.cardId) {
                                    c.cardUnclicked();
                                }
                            } );
                    } );                    

                    socket.on( 'number-clicked',
                    ( number ) =>
                    {
                        world.setNumber.forEach(
                            ( n ) =>
                            {  
                                if (n.num === number.num) {
                                    n.numberClicked();
                                }
                            } );
                    } );                    

                    socket.on( 'number-unclicked',
                    ( number ) =>
                    {
                        world.setNumber.forEach(
                            ( n ) =>
                            {  
                                if (n.num === number.num) {
                                    n.numberUnclicked();
                                }
                            } );
                    } );

                    // マークがクリックされた時の処理(セレクト済みにする)
                    socket.on( 'mark-clicked',
                    ( mark ) =>
                    {
                        world.setMark.forEach(
                            ( m ) =>
                            {  
                                if (m.markId === mark.markId) {
                                    m.markClicked();
                                }
                            } );
                    } );

                    socket.on( 'mark-unclicked',
                    ( mark ) =>
                    {
                        world.setMark.forEach(
                            ( m ) =>
                            {  
                                if (m.markId === mark.markId) {
                                    m.markUnclicked();
                                }
                            } );
                    } );

                    // ボタン押下時の処理
                    socket.on( 'button-clicked',
                    ( ) =>
                    {
                        
                    } );                    

                    // カードを配る処理
                    socket.on( 'deal-card',
                    () =>
                    {
                        if( !player )
                        {
                            return;
                        }
                        // プレイヤーにカードを配る
                        cards = cardList.splice(0,10);
                        player.dealCards(cards);
                        // 左端のカード（初期座標）
                        let fX = player.fX - 100;
                        let fY = player.fY + 180;
                        world.setCard.forEach(
                            ( c ) =>
                            {
                                cards.forEach(
                                    ( card ) =>
                                    {
                                        if(c.cardId === card) {
                                            c.setPosition(fX, fY, player.playerNum);
                                            fX = fX + 40;
                                        }
                                    } );
                            } );
                        // 残ったカードを真ん中に配置する
                        if (cardList.length === 33) {
                            console.log(player);
                            leftCards = cardList.splice(0,3);
                            // 左端のカード（初期座標）
                            let fX = 680;
                            let fY = 70;
                            world.setCard.forEach(
                                ( c ) =>
                                {
                                    leftCards.forEach(
                                        ( leftCard ) =>
                                        {
                                            if(c.cardId === leftCard) {
                                                c.setLeftCard(fX, fY);
                                                fX = fX + 50;
                                            }
                                        } );
                                } );
                        }
                        io.emit( 'deal-end');
                    } );

                    // 宣言中にパスが押されたとき
                    socket.on( 'pass-clicked',
                    (mark, number) =>
                    {
                        passCnt += 1;
                        teban += 1;
                        if (teban === 3) teban = 1;
                        if (passCnt === 1) io.emit( 'declaration-end' , mark , number, napoleon);
                    } );

                    // 宣言中に決定が押されたとき
                    socket.on( 'kettei-clicked',
                    (player) =>
                    {
                        passCnt = 0;
                        teban += 1;
                        if (teban === 6) teban = 1;
                        napoleon = player;
                    } );

                    // 副官札指定後に決定が押されたとき
                    socket.on( 'kettei-clicked-designation',
                    (designationCard) =>
                    {
                        // 元のプレイヤーの手札に3枚追加する
                        cards = player.returnCards();
                        cards.push(leftCards[0]);
                        cards.push(leftCards[1]);
                        cards.push(leftCards[2]);
                        let fX = player.fX - 100;
                        let fY = player.fY + 180;
                        // 改めて、カードを配置し直す
                        world.setCard.forEach(
                            ( c ) =>
                            {
                                cards.forEach(
                                    ( card ) =>
                                    {
                                        if(c.cardId === card) {
                                            c.setPosition(fX, fY, player.playerNum);
                                            fX = fX + 40;
                                        }
                                    } );
                            } );
                        io.emit( 'designation-end' , designationCard);
                    } );

                    // 交換時
                    socket.on( 'change-discards',
                    (cards) =>
                    {
                        let fX = 0;
                        let fY = 0;                        
                        // プレイヤーの位置で置く場所を変える
                        if (player.playerNum === 1) {
                            fX = 700;
                            fY = 470;
                        }
                        world.setCard.forEach(
                            ( c ) =>
                            {
                                cards.forEach(
                                    ( card ) =>
                                    {
                                        if(c.cardId === card.cardId) {
                                            c.setDiscard(fX, fY, card);
                                            fX = fX + 40;
                                        }
                                    } );
                            } );
                    } );                    


                    // プレイヤーがカードを捨てる
                    socket.on( 'discard',
                    () =>
                    {
                        
                    } );                    
            } );

        // 周期的処理（1秒間にFRAMERATE回の場合、delayは、1000[ms]/FRAMERATE[回]）
        setInterval(
            () =>
            {
                // 経過時間の算出
                const iTimeCurrent = Date.now();    // ミリ秒単位で取得
                const fDeltaTime = ( iTimeCurrent - iTimeLast ) * 0.001;	// 秒に変換
                iTimeLast = iTimeCurrent;
                //console.log( 'DeltaTime = %f[s]', fDeltaTime );

                // 処理時間計測用
                const hrtime = process.hrtime();  // ナノ秒単位で取得

                // ゲームワールドの更新
                world.update( fDeltaTime );

                const hrtimeDiff = process.hrtime( hrtime );
                const iNanosecDiff = hrtimeDiff[0] * 1e9 + hrtimeDiff[1];

                // 最新状況をクライアントに送信
                io.emit( 'update',
                    Array.from( world.setPlayer ),  // Setオブジェクトは送受信不可（SetにJSON変換が未定義だから？）。配列にして送信する。
                    Array.from( world.setCard ),
                    Array.from( world.setNumber ),
                    Array.from( world.setMark ),
                    teban,
                    passCnt,
                    iNanosecDiff );	// 送信
            },
            1000 / GameSettings.FRAMERATE );	// 単位は[ms]。1000[ms] / FRAMERATE[回]
    }

    createCardList() {
        let cardId = '';
        let cardList = [];
        // カードデータを全て生成する
        for (let i = 1; i <= 4; i++) {
            for (let j = 1; j <= 13; j++) {
                if (i === 1) {
                    cardId ='s' + j;
                }
                if (i === 2) {
                    cardId = 'c' + j;
                }
                if (i === 3) {
                    cardId = 'd' + j;
                }
                if (i === 4) {
                    cardId = 'h' + j;
                }
                cardList.push(cardId);
            }
        }
        cardList.push('jo');
        for (let i = cardList.length - 1; i >= 0; i--){
            // 0~iのランダムな数値を取得
            let rand = Math.floor( Math.random() * ( i + 1 ) );
            // 配列の数値を入れ替える
            [cardList[i], cardList[rand]] = [cardList[rand], cardList[i]]
        }
        return cardList;
    }

    createNumbers() {

        return cardList;
    }
}
