// モジュール
const GameObject = require( './GameObject.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

let playerNum = 0;

// プレイヤークラス
module.exports = class Player extends GameObject
{
    // コンストラクタ
    constructor(strSocketID, strNickName)
    {
        // 親クラスのコンストラクタ呼び出し
        super( SharedSettings.PLAYER_WIDTH, SharedSettings.PLAYER_HEIGHT, 0.0, 0.0, 0.0 );

        this.strSocketID = strSocketID;
        this.strNickName = strNickName;

        // 初期位置

        if (playerNum === 0) {
            this.fX = 500;
            this.fY = 1000;
        }
        
        if (playerNum === 1) {
            this.fX = 0;
            this.fY = 300;
        }

        if (playerNum === 2) {
            this.fX = 0;
            this.fY = 600;
        }
                
        if (playerNum === 3) {
            this.fX = 1000;
            this.fY = 300;
        }

        if (playerNum === 4) {
            this.fX = 1000;
            this.fY = 600;
        }
        playerNum = playerNum + 1;
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
