// ゲームの設定クラス
// ※サーバーとクライアントで共通の設定は、クライアントからも参照できるように、
//   public/js / SharedSettings.jsにて設定する。
module.exports = class GameSettings
{
    // ゲーム全体
    static get FRAMERATE() { return 30; }   // フレームレート（１秒当たりのフレーム数）
    // プレイヤー
    static get PLAYER_NUM() { return 5; }   // フレームレート（１秒当たりのフレーム数）
}
