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
        // 親クラスのコンストラクタ呼び出しwaaa
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
    setPosition(fX, fY, playerNum)
    {
        this.fX = fX;
        this.fY = fY;
        this.playerNum = playerNum;
        this.left = false;
    }

    // 残ったカードの処理
    setLeftCard(fX, fY)
    {
        console.log('setLeftCard')
        this.fX = fX;
        this.fY = fY;
        this.left = true;
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

        // // 前進
        // const fDistance = this.fSpeed * fDeltaTime;

        // // 不可侵領域との衝突のチェック
        // let bCollision = false;
        // if( !OverlapTester.pointInRect( rectField, { fX: this.fX, fY: this.fY } ) )
        // {	// フィールドの外に出た。
        //     bCollision = true;
        // }
        // else if( this.overlapWalls( setWall ) )
        // {	// 壁に当たった。
        //     bCollision = true;
        // }

        // return bCollision;    // 消失かどうか。不可侵領域に当たったかを返す。
    }

    toJSON()
    {
        return Object.assign(
            super.toJSON(),
            {
                cardId: this.cardId,
                selected : this.selected,
                playerNum : this.playerNum,
                left : this.left
            } );
    }
};
