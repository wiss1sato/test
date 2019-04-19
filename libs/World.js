// モジュール
const Player = require( './Player.js' );
// モジュール
const Card = require( './Card.js' );

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
         this.setCard = new Set();	// 弾丸リスト
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
        // カードごとの処理
        this.setCard.forEach(
            ( card ) =>
            {
                card.update( fDeltaTime, card );
            } );
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
    createPlayer(strSocketID, strNickName )
    {

    // プレイヤーの生成
    const player = new Player( strSocketID, strNickName);

        // プレイヤーリストへの登録
        this.setPlayer.add( player );
        this.io.to( player.strSocketID ).emit( 'enter-the-game' );
        return player;
    }

    // プレイヤーの破棄
    destroyPlayer( player )
    {
        // プレイヤーリストリストからの削除
        this.setPlayer.delete( player );

        // 削除プレイヤーのクライアントにイベント'dead'を送信
        this.io.to( player.strSocketID ).emit( 'dead' );
    }

    // カードの生成
    createCard(cardId)
    {
        // カードの生成
        const card = new Card( cardId );
        this.setCard.add( card );
        return card;
    }
}