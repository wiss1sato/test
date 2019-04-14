// モジュール
const Tank = require( './Tank.js' );

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
         this.setTank = new Set();	// タンクリスト
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
        
         // タンクごとの処理
        this.setTank.forEach(
            ( tank ) =>
            {
                tank.update( fDeltaTime );
            } );
    }

    // オブジェクトの座標値の更新
    updateObjects( fDeltaTime )
    {
    }

    // 衝突のチェック
    checkCollisions()
    {
    }

    // 新たな行動
    doNewActions( fDeltaTime )
    {
    }

        // タンクの生成
        createTank(strSocketID, strNickName )
        {

        // タンクの生成
        const tank = new Tank( strSocketID, strNickName);
    
            // タンクリストへの登録
            this.setTank.add( tank );
    
            return tank;
        }
    
        // タンクの破棄
        destroyTank( tank )
        {
            // タンクリストリストからの削除
            this.setTank.delete( tank );

            // 削除タンクのクライアントにイベント'dead'を送信
            this.io.to( tank.strSocketID ).emit( 'dead' );
        }
}