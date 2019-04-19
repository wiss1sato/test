// アセット群クラス
class Assets
{
    // コンストラクタ
    constructor(iconName)
    {
        // 背景画像
        this.imageField = new Image();
        this.imageField.src = '../images/grass01.png'


        this.rectFieldInFieldImage = { sx: 0, sy: 0, sw: 512, sh: 512 };

        
        this.cardS1 = new Image();
        this.cardS1.src = '../images/s1.png';
        this.imageItem = new Image();
        this.imageItem.src = '../images/' + iconName;
        this.arectPlayerInItemsImage = [
            { sx: 2, sy: 2, sw: 16, sh: 16 },
            { sx: 2, sy: 2, sw: 16, sh: 16 },];    }
}