// モジュール
const GameObject = require( './GameObject.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

// カードクラス
module.exports = class Card extends GameObject
{
    constructor( cardId )
    {
        // 親クラスのコンストラクタ呼び出し
        super( SharedSettings.CARD_WIDTH, SharedSettings.CARD_HEIGHT );
        this.cardId = cardId;
    }

    cardClicked()
    {
        if (this.selected) {
            this.selected = false;
            this.fY = this.fY + 15;
        } else {
            this.selected = true;
            this.fY = this.fY - 15;
        }
    }

    cardUnclicked()
    {
        if (this.selected) {
            this.selected = false;
            this.fY = this.fY + 15;
        }
    }

    // カードをプレイヤーに配置
    setPosition(fX, fY, player)
    {
        this.fX = fX;
        this.fY = fY;
        this.playerNum = player.playerNum;
        this.playerId = player.strSocketID;
        this.back = false;
    }

    // 残ったカードの処理
    setLeftCard(fX, fY)
    {
        this.fX = fX;
        this.fY = fY;
        this.back = true;
    }

    // 請求状態にする
    setRequest()
    {
        this.request = true;
    }    
    // 非請求状態にする
    setNotRequest()
    {
        this.request = false;
    }        

    // 交換時に捨てたカードの処理
    setChanges(fX, fY, change)
    {
        console.log(change);
        let num = change.cardId.replace(/[^0-9]/g, '');
        if (num < 10 && num != 1) this.back = true;
        this.selected = false;
        this.fX = fX;
        this.fY = fY;
    }   

    // 更新
    // ※rectField : フィールド矩形は、オブジェクト中心と判定する。（OverlapTester.pointInRect()）
    //               オブジェクトの大きさ分狭めた(上下左右で、大きさの半分づつ狭めた）矩形が必要。
    //               呼び出され側で領域を狭めのは、処理コストが無駄なので、呼び出す側で領域を狭めて渡す。
    update( fDeltaTime)
    {
        this.fLifeTime -= fDeltaTime;
        if( 0 > this.fLifeTime )
        {   // 寿命が尽きた
            return true;    // 消失かどうか。trueを返す。
        }
    }

    toJSON()
    {
        return Object.assign(
            super.toJSON(),
            {
                cardId: this.cardId,
                selected : this.selected,
                playerNum : this.playerNum,
                back : this.back,
                playerId : this.playerId,
                request : this.request
            } );
    }
};
