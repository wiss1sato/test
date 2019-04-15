// サーバースクリプトとクライアントで共通の設定クラス
class SharedSettings
{
    // フィールドサイズ
    // ※背景タイル画像のトリム処理未実装のため、
    // 　「FIELD_WIDTHは、FIELDTILE_WIDTHの定数倍」「FIELD_HEIGHTは、FIELDTILE_HEIGHTの定数倍」にする必要あり。
    static get FIELD_WIDTH() { return 1024.0; }
    static get FIELD_HEIGHT() { return 1024.0; }
    // プレイヤー
    static get PLAYER_WIDTH() { return 130.0; }
    static get PLAYER_HEIGHT() { return 200.0; }
}

if( typeof module !== 'undefined' && typeof module.exports !== 'undefined' )
{   // サーバー処理（Node.js処理）用の記述
    module.exports = SharedSettings;
}
