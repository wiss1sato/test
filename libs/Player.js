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
        this.viewerMode = false;
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
                playerNum : this.playerNum,
                viewerMode : this.viewerMode
            } );
    }

    // 配置
    setPlayer(playerNum)
    {
        // 初期位置
        if (playerNum === 1) {
            this.fX = 650;
            this.fY = 435;
        }
        
        if (playerNum === 2) {
            this.fX = 200;
            this.fY = 350;
        }

        if (playerNum === 3) {
            this.fX = 200;
            this.fY = 50;
        }
                
        if (playerNum === 4) {
            this.fX = 1150;
            this.fY = 50;
        }

        if (playerNum === 5) {
            this.fX = 1150;
            this.fY = 350;
        }

        // 順番の情報も付与する
        this.playerNum = playerNum;
    }

    // ショット
    playCard()
    {
    }

    // 観戦者モードにする
    giveViewerMode()
    {
        this.viewerMode = true;
    }    

    
    // カード配布
    dealCards( cards )
    {
        this.hasCards = cards;
    }

    // カード配布
    returnCards()
    {
        return this.hasCards;
    }


    // カード捨てる
    discardChanges(changes)
    {
        for (let i = 0; i < this.hasCards.length; i++) {
            for (let j = 0; j < changes.length; j++) {
                if (this.hasCards[i] === changes[j].cardId) {
                    this.hasCards.splice(i, 1);
                }
            }
          }
    }    

    // カード捨てる
    discard(card)
    {
        // 持っているカードから,捨てた分を減らす
        for (let i = 0; i < this.hasCards.length; i++) {
            if (this.hasCards[i] === card.cardId) {
                this.hasCards.splice(i, 1);
            }
        }
    }

    // 更新
    update( fDeltaTime )
    {
        // 動作に従って、プレイヤーの状態を更新
        
    }
}
