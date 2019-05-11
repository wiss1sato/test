// モジュール
const Player = require( './Player.js' );
// モジュール
const Card = require( './Card.js' );
// モジュール
const Number = require( './Number.js' );
// モジュール
const Mark = require( './Mark.js' );


// ワールドクラス
// ・ゲーム内の各種要素を保持する
// ・ゲームに保持される
// ・ゲームワールドの更新処理を有する（ゲームから要請を受け、保持する各種要素を更新する）
// ・ゲーム内の各種要素の生成、破棄を有する
module.exports = class World
{
    // コンストラクタ
    constructor( io )
    {
        this.io = io;   // socketIO
         this.setPlayer = new Set();	// プレイヤーリスト
         this.setCard = new Set();	// カードリスト
         this.setNumber = new Set();	// カードリスト
         this.setMark = new Set();	// カードリスト
        }

    // 更新処理
    update( fDeltaTime )
    {
        // オブジェクトの座標値の更新
        this.updateObjects( fDeltaTime );

        // 衝突チェック
        this.checkCollisions();

        // 新たな行動（特に、ボットに関する生成や動作
        this.doNewActions( fDeltaTime );
        
         // プレイヤーごとの処理
        this.setPlayer.forEach(
            ( player ) =>
            {
                player.update( fDeltaTime );
            } );
    }

    // オブジェクトの座標値の更新
    updateObjects( fDeltaTime )
    {
        // // プレイヤーごとの処理
        // this.setPlayer.forEach(
        //     ( player ) =>
        //     {
        //         player.update( player);
        //     } );            
    }

    // 衝突のチェック
    checkCollisions()
    {
    }

    // 新たな行動
    doNewActions( fDeltaTime )
    {
    }

    // プレイヤーの生成
    createPlayer(strSocketID, strNickName, iconName )
    {

    // プレイヤーの生成
    const player = new Player( strSocketID, strNickName, iconName);

        // プレイヤーリストへの登録
        this.setPlayer.add( player );
        this.setPlayer.forEach(
            ( p ) =>
            {
                this.io.to( p.strSocketID ).emit( 'enter-the-game' );
            } );
        return player;
    }

    // カードの生成
    createCard(cardId)
    {
        // カードの生成
        const card = new Card( cardId );
        this.setCard.add( card );
        return card;
    }

    // 数字の生成
    createNumber(num)
    {
        // カードの生成
        const number = new Number( num );
        this.setNumber.add( number );
        return number;
    }    

    // マークの生成
    createMark(markId)
    {
        // カードの生成
        const mark = new Mark( markId );
        this.setMark.add( mark );
        return mark;
    }   
    

    // プレイヤーの破棄
    destroyPlayer( player )
    {
        // プレイヤーリストリストからの削除
        this.setPlayer.delete( player );

        // 削除プレイヤーのクライアントにイベント'dead'を送信
        this.io.to( player.strSocketID ).emit( 'dead' );
    }
    

    // カードの削除
    destroyCard()
    {
        if (undefined !== this.setCard) {
            this.setCard.forEach(
                ( card ) =>
                {
                    this.setCard.delete(card);
                } );	
        }
    }


    // カードの削除
    destroyCard2(card)
    {
        if (undefined !== this.setCard) {
            this.setCard.forEach(
                ( c ) =>
                {
                    if (c.cardId === card.cardId) {
                        this.setCard.delete(c);
                    }
                } );	
        }
    }    

    // ナンバーの削除
    destroyNumber()
    {
        if (undefined !== this.setNumber) {
            this.setNumber.forEach(
                ( number ) =>
                {
                    this.setNumber.delete(number);
                } );	
        }
    }

    // ナンバーの削除(必要なのだけ残す)
    destroyNumber2(number)
    {
        if (undefined !== this.setNumber) {
            this.setNumber.forEach(
                ( n ) =>
                {
                    if (number !== n.num) this.setNumber.delete(n);
                } );	
        }
    }    

    // マークの削除
    destroyMark()
    {
        if (undefined !== this.setMark) {
            this.setMark.forEach(
                ( mark ) =>
                {
                    this.setMark.delete(mark);
                } );	
        }
    }

    // マークの削除(必要なのだけ残す)
    destroyMark2(mark)
    {
        if (undefined !== this.setMark) {
            this.setMark.forEach(
                ( m ) =>
                {
                    if (mark !== m.markId) this.setMark.delete(m);
                } );	
        }
    }    
    
}