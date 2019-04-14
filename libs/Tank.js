// モジュール
const GameObject = require( './GameObject.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

// タンククラス
module.exports = class Tank extends GameObject
{
    // コンストラクタ
    constructor()
    {
        // 親クラスのコンストラクタ呼び出し
        super( SharedSettings.TANK_WIDTH, SharedSettings.TANK_HEIGHT, 0.0, 0.0, Math.random() * 2 * Math.PI );

        this.objMovement = {};	// 動作
        this.fSpeed = GameSettings.TANK_SPEED;    // 速度[m/s]。1frameあたり5進む => 1/30[s] で5進む => 1[s]で150進む。
        this.fRotationSpeed = GameSettings.TANK_ROTATION_SPEED;    // 回転速度[rad/s]。1frameあたり0.1進む => 1/30[s] で0.1進む => 1[s]で3[rad]進む。

        // 初期位置
        this.fX = Math.random() * ( SharedSettings.FIELD_WIDTH - SharedSettings.TANK_WIDTH );
        this.fY = Math.random() * ( SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT );
    }

    // 更新
    update( fDeltaTime )
    {
        // 動作に従って、タンクの状態を更新
        if( this.objMovement['forward'] )
        {	// 前進
            const fDistance = this.fSpeed * fDeltaTime;
            //console.log( 'forward' );
            this.fX += fDistance * Math.cos( this.fAngle );
            this.fY += fDistance * Math.sin( this.fAngle );
        }
        if( this.objMovement['back'] )
        {	// 後進
            const fDistance = this.fSpeed * fDeltaTime;
            //console.log( 'back' );
            this.fX -= fDistance * Math.cos( this.fAngle );
            this.fY -= fDistance * Math.sin( this.fAngle );
        }

        if( this.objMovement['left'] )
        {	// 左転回
            //console.log( 'left' );
            // X軸が右向き、Y軸が「上」向きの世界では、左回転は、角度が増える方向
            // X軸が右向き、Y軸が「下」向きの世界では、左回転は、角度が減る方向
            //this.fAngle += this.fRotationSpeed * fDeltaTime;  // Y軸が「上」向き用（WebGLキャンバスへの描画用）
            this.fAngle -= this.fRotationSpeed * fDeltaTime;  // Y軸が「下」向き用（2Dキャンバスへの描画用）
        }
        if( this.objMovement['right'] )
        {	// 右転回
            //console.log( 'right' );
            // X軸が右向き、Y軸が「上」向きの世界では、右回転は、角度が減る方向
            // X軸が右向き、Y軸が「下」向きの世界では、右回転は、角度が増える方向
            //this.fAngle -= this.fRotationSpeed * fDeltaTime;  // Y軸が「上」向き用（WebGLキャンバスへの描画用）
            this.fAngle += this.fRotationSpeed * fDeltaTime;  // Y軸が「下」向き用（2Dキャンバスへの描画用）
        }
    }
}
