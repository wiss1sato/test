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

        this.teban = new Image();
        this.teban.src = '../images/teban.png'

        this.back = new Image();
        this.back.src = '../images/back.png'
        
        this.ok = new Image();
        this.ok.src = '../images/ok.png'
        this.kettei = new Image();
        this.kettei.src = '../images/kettei.png'
        this.pass = new Image();
        this.pass.src = '../images/pass.png'

        this.n11 = new Image();
        this.n11.src = '../images/11.png'
        this.n12 = new Image();
        this.n12.src = '../images/12.png'
        this.n13 = new Image();
        this.n13.src = '../images/13.png'
        this.n14 = new Image();
        this.n14.src = '../images/14.png'
        this.n15 = new Image();
        this.n15.src = '../images/15.png'
        this.n16 = new Image();
        this.n16.src = '../images/16.png'
        this.n17 = new Image();
        this.n17.src = '../images/17.png'
        this.n18 = new Image();
        this.n18.src = '../images/18.png'
        this.n19 = new Image();
        this.n19.src = '../images/19.png'
        this.n20 = new Image();
        this.n20.src = '../images/20.png'
        this.numberSet = [];
        this.numberSet.push(this.n11,this.n12,this.n13,this.n14,this.n15,this.n16,this.n17,this.n18,this.n19,this.n20);

        this.c11 = new Image();
        this.c11.src = '../images/11c.png'
        this.c12 = new Image();
        this.c12.src = '../images/12c.png'
        this.c13 = new Image();
        this.c13.src = '../images/13c.png'
        this.c14 = new Image();
        this.c14.src = '../images/14c.png'
        this.c15 = new Image();
        this.c15.src = '../images/15c.png'
        this.c16 = new Image();
        this.c16.src = '../images/16c.png'
        this.c17 = new Image();
        this.c17.src = '../images/17c.png'
        this.c18 = new Image();
        this.c18.src = '../images/18c.png'
        this.c19 = new Image();
        this.c19.src = '../images/19c.png'
        this.c20 = new Image();
        this.c20.src = '../images/20c.png'
        this.colorNumberSet = [];
        this.colorNumberSet.push(this.c11,this.c12,this.c13,this.c14,this.c15,this.c16,this.c17,this.c18,this.c19,this.c20);

        this.spade = new Image();
        this.spade.src = '../images/spade.png'
        this.heart = new Image();
        this.heart.src = '../images/heart.png'
        this.diamond = new Image();
        this.diamond.src = '../images/diamond.png'
        this.clover = new Image();
        this.clover.src = '../images/clover.png'
        this.markSet = [];

        this.markSet.push(this.spade,this.heart,this.diamond,this.clover);

        this.cspade = new Image();
        this.cspade.src = '../images/spadec.png'
        this.cheart = new Image();
        this.cheart.src = '../images/heartc.png'
        this.cdiamond = new Image();
        this.cdiamond.src = '../images/diamondc.png'
        this.cclover = new Image();
        this.cclover.src = '../images/cloverc.png'
        this.colorMarkSet = [];
        this.colorMarkSet.push(this.cspade,this.cheart,this.cdiamond,this.cclover); 
        
        this.playerIconList = [];

        this.frame = new Image();
        this.frame.src = '../images/frame.png'

        //　各トランプカード
        this.s1 = new Image();
        this.s2 = new Image();
        this.s3 = new Image();
        this.s4 = new Image();
        this.s5 = new Image();
        this.s6 = new Image();
        this.s7 = new Image();
        this.s8 = new Image();
        this.s9 = new Image();
        this.s10 = new Image();
        this.s11 = new Image();
        this.s12 = new Image();
        this.s13 = new Image();
        this.c1 = new Image();
        this.c2 = new Image();
        this.c3 = new Image();
        this.c4 = new Image();
        this.c5 = new Image();
        this.c6 = new Image();
        this.c7 = new Image();
        this.c8 = new Image();
        this.c9 = new Image();
        this.c10 = new Image();
        this.c11 = new Image();
        this.c12 = new Image();
        this.c13 = new Image();
        this.d1 = new Image();
        this.d2 = new Image();
        this.d3 = new Image();
        this.d4 = new Image();
        this.d5 = new Image();
        this.d6 = new Image();
        this.d7 = new Image();
        this.d8 = new Image();
        this.d9 = new Image();
        this.d10 = new Image();
        this.d11 = new Image();
        this.d12 = new Image();
        this.d13 = new Image();
        this.h1 = new Image();
        this.h2 = new Image();
        this.h3 = new Image();
        this.h4 = new Image();
        this.h5 = new Image();
        this.h6 = new Image();
        this.h7 = new Image();
        this.h8 = new Image();
        this.h9 = new Image();
        this.h10 = new Image();
        this.h11 = new Image();
        this.h12 = new Image();
        this.h13 = new Image();
        this.jo = new Image();
        this.s1.src = '../images/s1.png';
        this.s2.src ='../images/s2.png';
        this.s3.src ='../images/s3.png';
        this.s4.src ='../images/s4.png';
        this.s5.src ='../images/s5.png';
        this.s6.src ='../images/s6.png';
        this.s7.src ='../images/s7.png';
        this.s8.src ='../images/s8.png';
        this.s9.src ='../images/s9.png';
        this.s10.src ='../images/s10.png';
        this.s11.src ='../images/s11.png';
        this.s12.src ='../images/s12.png';
        this.s13.src ='../images/s13.png';
        this.c1.src = '../images/c1.png';
        this.c2.src ='../images/c2.png';
        this.c3.src ='../images/c3.png';
        this.c4.src ='../images/c4.png';
        this.c5.src ='../images/c5.png';
        this.c6.src ='../images/c6.png';
        this.c7.src ='../images/c7.png';
        this.c8.src ='../images/c8.png';
        this.c9.src ='../images/c9.png';
        this.c10.src ='../images/c10.png';
        this.c11.src ='../images/c11.png';
        this.c12.src ='../images/c12.png';
        this.c13.src ='../images/c13.png';
        this.d1.src = '../images/d1.png';
        this.d2.src ='../images/d2.png';
        this.d3.src ='../images/d3.png';
        this.d4.src ='../images/d4.png';
        this.d5.src ='../images/d5.png';
        this.d6.src ='../images/d6.png';
        this.d7.src ='../images/d7.png';
        this.d8.src ='../images/d8.png';
        this.d9.src ='../images/d9.png';
        this.d10.src ='../images/d10.png';
        this.d11.src ='../images/d11.png';
        this.d12.src ='../images/d12.png';
        this.d13.src ='../images/d13.png';
        this.h1.src = '../images/h1.png';
        this.h2.src ='../images/h2.png';
        this.h3.src ='../images/h3.png';
        this.h4.src ='../images/h4.png';
        this.h5.src ='../images/h5.png';
        this.h6.src ='../images/h6.png';
        this.h7.src ='../images/h7.png';
        this.h8.src ='../images/h8.png';
        this.h9.src ='../images/h9.png';
        this.h10.src ='../images/h10.png';
        this.h11.src ='../images/h11.png';
        this.h12.src ='../images/h12.png';
        this.h13.src ='../images/h13.png';
        this.jo.src ='../images/jo.png';
        this.cardSet = [];
        this.cardSet.push(this.s1,this.s2,this.s3,this.s4,this.s5,this.s6,this.s7,this.s8,this.s9,this.s10,this.s11,this.s12,this.s13,this.c1,this.c2,this.c3,this.c4,this.c5,this.c6,this.c7,this.c8,this.c9,this.c10,this.c11,this.c12,this.c13,this.d1,this.d2,this.d3,this.d4,this.d5,this.d6,this.d7,this.d8,this.d9,this.d10,this.d11,this.d12,this.d13,this.h1,this.h2,this.h3,this.h4,this.h5,this.h6,this.h7,this.h8,this.h9,this.h10,this.h11,this.h12,this.h13,this.jo);
   }

   // カードを返却するメソッド
   returnCard(cardId) {
       var ret = this.cardSet.filter(
           function(c){
                return (c.src.indexOf(cardId + '.png') > -1);
            }
           );
       return ret;
   }

   // アイコンとプレイヤー情報をリストに積み重ねるメソッド
   setPlayerIcon( player ) {
       let endFlg = false;
       // 既に追加したことのあるプレイヤーがいたらだったら何もしない
       this.playerIconList.forEach(
        ( p ) =>
        {  
            if (p.strSocketID === player.strSocketID) endFlg = true;
        } );
        if (endFlg) return;
        let icon = new Image();
        icon.src = '../images/' + player.iconName;
        let data =  
         {  strSocketID : player.strSocketID,
            icon  : icon
         }
        this.playerIconList.push(data);
   }

   returnIcon( strSocketID ) {
    let icon;
    this.playerIconList.forEach(
        ( playerIcon ) =>
        {  
            if (strSocketID === playerIcon.strSocketID){
                icon = playerIcon.icon
            }
        } );
        return icon;
   }


   // ナンバーを返却するメソッド
   returnNumber(number) {
    var ret = this.numberSet.filter(
        function(n){
             return (n.src.indexOf(number.num + '.png') > -1);
         }
        );
    return ret;
    }

   // ナンバーを返却するメソッド(色つき)
   returnColorNumber(number) {
    var ret = this.colorNumberSet.filter(
        function(c){
             return (c.src.indexOf(number.num + 'c.png') > -1);
         }
        );
    return ret;
    }    

   // ナンバーを返却するメソッド
   returnMark(mark) {
    var ret = this.markSet.filter(
        function(m){
             return (m.src.indexOf(mark.markId + '.png') > -1);
         }
        );
    return ret;
    }

   // ナンバーを返却するメソッド(色付き)
   returnColorMark(mark) {
    var ret = this.colorMarkSet.filter(
        function(m){
             return (m.src.indexOf(mark.markId + 'c.png') > -1);
         }
        );
    return ret;
    }        
}