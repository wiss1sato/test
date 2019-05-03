// モジュール
const GameObject = require( './GameObject.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

// カードクラス
module.exports = class Number extends GameObject
{
    constructor( num )
    {
        // 親クラスのコンストラクタ呼び出し
        super( SharedSettings.NUMBER_WIDTH, SharedSettings.NUMBER_HEIGHT );
        this.num = num;
    }

    numberClicked()
    {
        if (this.selected) {
            this.selected = false;
        } else {
            this.selected = true;
        }
    }

    numberUnclicked()
    {
        if (this.selected) {
            this.selected = false;
        }
    }

    // ナンバーを配置
    setPosition(fX, fY)
    {
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
                num: this.num,
                selected : this.selected,
                playerNum : this.playerNum,
            } );
    }
};
