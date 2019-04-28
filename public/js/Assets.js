// アセット群クラス
class Assets
{
    // コンストラクタ
    constructor()
    {
        // 背景画像
        this.imageField = new Image();
        this.imageField.src = '../images/grass01.png'


        this.rectFieldInFieldImage = { sx: 0, sy: 0, sw: 512, sh: 512 };

        
        this.cardS1 = new Image();
        this.cardS1.src = '../images/s1.png';
   }
}