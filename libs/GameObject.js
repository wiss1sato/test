// ゲームオブジェクトクラス
// ・プレイヤー、カードの親クラス
module.exports = class GameObject
{
    // コンストラクタ
    constructor( fWidth, fHeight, fX, fY, fAngle )
    {
        this.fWidth = fWidth;	// 幅
        this.fHeight = fHeight;	// 高さ
        this.fX = fX;	// 位置(X)
        this.fY = fY;	// 位置(Y)
        this.fAngle = fAngle;	// 向き（+x軸の方向が0。+y軸の方向がPI/2）

        this.fX = fX;
        this.fY = fY;
    }

    toJSON()
    {
        return {
            fX: this.fX,
            fY: this.fY,
            fAngle: this.fAngle
        };
    }
};
