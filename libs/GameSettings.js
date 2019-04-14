// ゲームの設定クラス
// ※サーバーとクライアントで共通の設定は、クライアントからも参照できるように、
//   public/js / SharedSettings.jsにて設定する。
module.exports = class GameSettings
{
    // ゲーム全体
    static get FRAMERATE() { return 30; }   // フレームレート（１秒当たりのフレーム数）
    // タンク
    static get TANK_SPEED() { return 150.0; }	// 速度[m/s]。1frameあたり5進む => 1/30[s] で5進む => 1[s]で150進む。
    static get TANK_ROTATION_SPEED() { return 3.0; }// 回転速度[rad/s]。1frameあたり0.1進む => 1/30[s] で0.1進む => 1[s]で3[rad]進む。
}
