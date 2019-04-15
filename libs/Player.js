// モジュール
const GameObject = require( './GameObject.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

// プレイヤークラス
module.exports = class Player extends GameObject
{
    // コンストラクタ
    constructor(strSocketID, strNickName)
    {
        // 親クラスのコンストラクタ呼び出し
        super( SharedSettings.TANK_WIDTH, SharedSettings.TANK_HEIGHT, 0.0, 0.0, Math.random() * 2 * Math.PI );

        this.strSocketID = strSocketID;
        this.strNickName = strNickName;

        // 初期位置
        this.fX = Math.random() * ( SharedSettings.FIELD_WIDTH - SharedSettings.TANK_WIDTH );
        this.fY = Math.random() * ( SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT );
    }

    toJSON()
    {
        return Object.assign(
            super.toJSON(),
            {
                strSocketID: this.strSocketID,
                strNickName: this.strNickName
            } );
    }

    // 更新
    update( fDeltaTime )
    {
        // 動作に従って、プレイヤーの状態を更新
        
    }
}
