// サーバースクリプトとクライアントで共通の設定クラス
class SharedSettings
{
    // フィールドサイズ
    // ※背景タイル画像のトリム処理未実装のため、
    // 　「FIELD_WIDTHは、FIELDTILE_WIDTHの定数倍」「FIELD_HEIGHTは、FIELDTsILE_HEIGHTの定数倍」にする必要あり。
    static get FIELD_WIDTH() { return 1500.0; }
    static get FIELD_HEIGHT() { return 1024.0; }
    // プレイヤー
    static get PLAYER_WIDTH() { return 150.0; }
    static get PLAYER_HEIGHT() { return 150.0; }
    // カード
    static get CARD_WIDTH() { return 50.0; }
    static get CARD_HEIGHT() { return 70.0; }
    // 宣言フェーズのマーク
    static get MARK_WIDTH() { return 75.0; }
    static get MARK_HEIGHT() { return 105.0; }
    // 宣言フェーズの数字
    static get NUMBER_WIDTH() { return 60.0; }
    static get NUMBER_HEIGHT() { return 30.0; }
}

if( typeof module !== 'undefined' && typeof module.exports !== 'undefined' )
{   // サーバー処理（Node.js処理）用の記述
    module.exports = SharedSettings;
}
