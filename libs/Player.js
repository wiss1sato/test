// モジュール
const GameObject = require( './GameObject.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

// プレイヤークラス
module.exports = class Player extends GameObject
{
    // コンストラクタ
    constructor(strSocketID, strNickName, iconName, playerNum)
    {
        // 親クラスのコンストラクタ呼び出し
        super( SharedSettings.PLAYER_WIDTH, SharedSettings.PLAYER_HEIGHT, 0.0, 0.0, 0.0 );

        this.iconName = iconName;
        this.strSocketID = strSocketID;
        this.strNickName = strNickName;
        this.hasCards = null;
    }

    toJSON()
    {
        return Object.assign(
            super.toJSON(),
            {
                iconName: this.iconName,
                strSocketID: this.strSocketID,
                strNickName: this.strNickName,
                hasCards: this.hasCards,
                playerNum : this.playerNum
            } );
    }

    // 配置
    setPlayer(playerNum)
    {
        // 初期位置
        if (playerNum === 1) {
            this.fX = 650;
            this.fY = 600;
        }
        
        if (playerNum === 2) {
            this.fX = 250;
            this.fY = 350;
        }

        if (playerNum === 3) {
            this.fX = 250;
            this.fY = 50;
        }
                
        if (playerNum === 4) {
            this.fX = 1050;
            this.fY = 50;
        }

        if (playerNum === 5) {
            this.fX = 1050;
            this.fY = 350;
        }

        // 順番の情報も付与する
        this.playerNum = playerNum;
    }

    // ショット
    playCard()
    {
    }

    
    // カード配布
    dealCards( cards )
    {
        this.hasCards = cards;
    }
    
    // 更新
    update( fDeltaTime )
    {
        // 動作に従って、プレイヤーの状態を更新
        
    }
}
