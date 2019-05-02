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
        this.img = null;
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
                img: this.img,
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
            this.fY = 50;
        }

        if (playerNum === 3) {
            this.fX = 250;
            this.fY = 350;
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

        // // 最終ショット時刻を更新
        // this.iTimeLastShoot = Date.now();

        // // 新しい弾丸の生成（先端から出ているようにするために、幅の半分オフセットした位置に生成する）
        // const fX = this.fX + this.fWidth * 0.5 * Math.cos( this.fAngle );
        // const fY = this.fY + this.fWidth * 0.5 * Math.sin( this.fAngle );
        // return new Card( fX, fY, this.fAngle, this );
    }

    
    // カード配布
    dealCards( cards )
    {
        this.hasCards = cards;
    }

    // カード配布
    setImg( img )
    {
        this.img = img;
    }

    // 更新
    update( fDeltaTime )
    {
        // 動作に従って、プレイヤーの状態を更新
        
    }
}
