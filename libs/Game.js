// モジュール
const World = require('./World.js');
// 設定
const GameSettings = require('./GameSettings.js');
var fs = require("fs");
// ゲームクラス
// ・ワールドを保持する
// ・通信処理を有する
// ・周期的処理を有する
module.exports = class Game {
  // 始動
  start(io) {
    // 変数
    const world = new World(io); // setInterval()内での参照があるので、スコープを抜けても、生存し続ける（ガーベッジコレクションされない）。
    let iTimeLast = Date.now(); // setInterval()内での参照があるので、スコープを抜けても、生存し続ける（ガーベッジコレクションされない）。
    let playerNum = 0;
    let cardList = this.createCardList();
    let passCnt = 0;
    let teban = 1;
    let cards = null;
    let leftCards = null;
    let napoleon = null;
    let fieldCards = [];
    let kirifuda = null;
    let turn = 0;
    let currentReverse = false;
    let reverse = false;
    let fukukanCard = null;
    let fukukan = null;
    let changeCards = null;
    let phase = null;

    // 接続時の処理
    // ・サーバーとクライアントの接続が確立すると、
    // 　サーバーで、'connection'イベント
    // 　クライアントで、'connect'イベントが発生する
    io.on('connection', (socket) => {
      console.log('connection : socket.id = %s', socket.id);
      let player = null; // コネクションごとのプレイヤーオブジェクト。イベントをまたいで使用される。
      let number = null;
      let mark = null;
      // ゲーム開始時の処理の指定
      // ・クライアント側の接続確立時の「socket.emit( 'enter-the-game' );」に対する処理
      socket.on('enter-the-game', (objConfig) => { // 自プレイヤーの作成
        console.log('enter-the-game : socket.id = %s', socket.id);
        // 何故かheroku上だとenter-the-gameしていないのにここが動いてしまいobjConfigがundefinedって怒られるので条件文を入れる
        if (objConfig !== undefined) {
          player = world.createPlayer(socket.id, objConfig.strNickName, objConfig.iconName);
          if (world.setPlayer.size >= 6) player.giveViewerMode();
          io.emit('enter-the-game', Array.from(world.setPlayer));
          playerNum = 0;
          world.setPlayer.forEach(
            // プレイヤー採番(一旦適当)
            (player) => {
              playerNum = playerNum + 1;
              // 採番ごとに配置する
              player.setPlayer(playerNum);
            });
          if (playerNum === GameSettings.PLAYER_NUM) {
            // ゲーム開始を各プレイヤーに送信
            // カード生成
            for (let i = 1; i <= 4; i++) {
              for (let j = 2; j <= 13; j++) {
                if (i === 1) {
                  world.createCard('s' + j);
                }
                if (i === 2) {
                  world.createCard('h' + j);
                }
                if (i === 3) {
                  world.createCard('d' + j);
                }
                if (i === 4) {
                  world.createCard('c' + j);
                }
              }
              if (i === 1) {
                world.createCard('s' + 1);
              }
              if (i === 2) {
                world.createCard('h' + 1);
              }
              if (i === 3) {
                world.createCard('d' + 1);
              }
              if (i === 4) {
                world.createCard('c' + 1);
              }
            }
            // ジョーカー
            world.createCard('jo');
            // 数字を作成する
            let fX = 650;
            let fY = 270;
            for (let i = 11; i <= 20; i++) {
              if (i === 16) {
                fX = 650;
                fY = fY + 30;
              }
              number = world.createNumber(i);
              number.setPosition(fX, fY);
              fX = fX + 60;
            }
            // マークを作成する
            mark = world.createMark('spade');
            mark.setPosition(650, 175);
            mark = world.createMark('heart');
            mark.setPosition(725, 175);
            mark = world.createMark('diamond');
            mark.setPosition(800, 175);
            mark = world.createMark('clover');
            mark.setPosition(875, 175);
            // ボタンを作成する
            io.emit('start-the-game');
          }
          // 最新状況をクライアントに送信
          // io.emit( 'enter-the-game', Array.from( world.setPlayer ));
          // // ゲーム開始を各プレイヤーに送信
          // io.emit( 'start-the-game', Array.from( world.setPlayer ));
        }
      });
      // 切断時の処理の指定
      // ・クライアントが切断したら、サーバー側では'disconnect'イベントが発生する
      socket.on('disconnect', () => {
        console.log('disconnect : socket.id = %s', socket.id);
        if (!player) {
          return;
        }
        playerNum = playerNum - 1;
        world.destroyPlayer(player);
        player = null; // 自プレイヤーの解放
        // ゲームが終わったら、いろいろ初期化
        if (playerNum !== 5) {
          // カードを全部消す
          world.destroyCard();
          // カードを全部消す
          world.destroyNumber();
          // マークを全部消す
          world.destroyMark();
          passCnt = 0;
          teban = 1;
          fukukanCard = null;
          fukukan = null;
          reverse = false;
          currentReverse = false;
          phase = null;
          fieldCards = [];
          leftCards = null;
          turn = 0;                
          // データはもう一回作る
          cardList = this.createCardList()
        }
      });
      // カードがクリックされた時の処理（ちょっと上にあげる）
      socket.on('card-clicked', (card) => {
        world.setCard.forEach(
          (c) => {
            if (c.cardId === card.cardId) {
              c.cardClicked();
            }
          });
      });
      // カードがクリックされた時の処理（ちょっと上にあげる）
      socket.on('card-unclicked', (card) => {
        world.setCard.forEach(
          (c) => {
            if (c.cardId === card.cardId) {
              c.cardUnclicked();
            }
          });
      });
      socket.on('number-clicked', (number) => {
        world.setNumber.forEach(
          (n) => {
            if (n.num === number.num) {
              n.numberClicked();
            }
          });
      });
      socket.on('number-unclicked', (number) => {
        world.setNumber.forEach(
          (n) => {
            if (n.num === number.num) {
              n.numberUnclicked();
            }
          });
      });
      // マークがクリックされた時の処理(セレクト済みにする)
      socket.on('mark-clicked', (mark) => {
        world.setMark.forEach(
          (m) => {
            if (m.markId === mark.markId) {
              m.markClicked();
            }
          });
      });

      // マークがクリックされた時の処理(セレクト済みにする)
      socket.on('designation-card-clicked', (designationCard) => {
        fukukanCard = designationCard;
      });

      socket.on('mark-unclicked', (mark) => {
        world.setMark.forEach(
          (m) => {
            if (m.markId === mark.markId) {
              m.markUnclicked();
            }
          });
      });
      // ボタン押下時の処理
      socket.on('button-clicked', () => {});
      // カードを配る処理
      socket.on('deal-card', () => {
        if (!player) {
          return;
        }
        // プレイヤーにカードを配る
        cards = cardList.splice(0, 10);
        player.dealCards(cards);
        // 左端のカード（初期座標）
        let fX = player.fX - 60;
        let fY = player.fY + 180;
        world.setCard.forEach(
          (c) => {
            cards.forEach(
              (card) => {
                if (c.cardId === card) {
                  c.setPosition(fX, fY, player);
                  fX = fX + 20;
                }
              });
          });
        // 残ったカードを真ん中に配置する
        if (cardList.length === 3) {
          leftCards = cardList.splice(0, 3);
          // 左端のカード（初期座標）
          let fX = 680;
          let fY = 80;
          world.setCard.forEach(
            (c) => {
              leftCards.forEach(
                (leftCard) => {
                  if (c.cardId === leftCard) {
                    c.setLeftCard(fX, fY);
                    fX = fX + 50;
                  }
                });
            });
            phase = 'declaration';
            io.emit('deal-end');
        }
      });
      // 宣言中に決定が押されたとき
      socket.on('kettei-clicked', (player) => {
        if (!player) {
          return;
        }
        passCnt = 0;
        teban += 1;
        if (teban === GameSettings.PLAYER_NUM + 1) teban = 1;
        napoleon = player;
      });      
      // 宣言中にパスが押されたとき
      socket.on('pass-clicked', (mark, number) => {
        passCnt += 1;
        teban += 1;
        if (teban === GameSettings.PLAYER_NUM + 1) teban = 1;
        // マークとナンバーが設定されてなかったらリターン
        if (!mark || !number) return;
        // 自分以外の人がパスしたら、宣言フェーズ終了
        if (passCnt === GameSettings.PLAYER_NUM - 1) {
          // 自分以外のマークを消す
          world.destroyMark2(mark);
          // 自分を配置する
          world.setMark.forEach(
            (m) => {
              if (m.markId === mark.markId) {
                m.markUnclicked();
               m.setPosition(650, 0);
              }
            });
          kirifuda = mark.markId;
          // 自分以外のナンバーを消す
          world.destroyNumber2(number);
          // 自分を配置する
          world.setNumber.forEach(
            (n) => {
              if (n.num === number.num) {
                n.setPosition(740, 0);
              }
            });
          console.log('ナポレオン:' + napoleon);
          phase = 'designation';
          io.emit('declaration-end', mark, number);
        }
      });

      // 副官札指定後に決定が押されたとき(メインフェーズ開始時)
      socket.on('kettei-clicked-designation', (designationCard) => {
        // 副官カードを指定
        fukukanCard = designationCard;
        // 元のプレイヤーの手札に3枚追加する
        cards = player.returnCards();
        cards.push(leftCards[0]);
        cards.push(leftCards[1]);
        cards.push(leftCards[2]);
        console.log(cards);
        // カード情報を書き換える
        player.dealCards(cards);
        let fX = player.fX - 60;
        let fY = player.fY + 180;
        // 改めて、カードを配置し直す
        world.setCard.forEach(
          (c) => {
            cards.forEach(
              (card) => {
                if (c.cardId === card) {
                  c.setPosition(fX, fY, player);
                  fX = fX + 20;
                }
              });
          });
          phase = 'change';
        io.emit('designation-end', designationCard);
      });
      // 交換時
      socket.on('change-discards', (changes) => {
        // はじめに、全てのカードを出せるようにする
        world.setCard.forEach(
          (card) => {
              card.setRequest();
          });        
        changeCards = changes;
        let fX = player.fX + 200;
        world.setCard.forEach(
          (c) => {
            changes.forEach(
              (change) => {
                if (c.cardId === change.cardId) {
                  c.setChanges(fX, player.fY + 55, change);
                  fX = fX + 40;
                }
              });
          });
        console.log(cards);
        // 持っているカードから,交換で捨てた分を減らす
        for (let i = cards.length - 1; i >= 0; i--) {
          for (let j = 0; j < changes.length; j++) {
            if (cards[i] === changes[j].cardId) {
              cards.splice(i, 1);
            }
          }
        }
        // 改めて、カードを配置し直す
        fX = player.fX - 60;
        let fY = player.fY + 180;
        world.setCard.forEach(
          (c) => {
            cards.forEach(
              (card) => {
                if (c.cardId === card) {
                  c.setPosition(fX, fY, player);
                  fX = fX + 20;
                }
              });
          });
        player.discardChanges(changes);
        phase = 'mainGame';
        io.emit('change-end');
      });
      socket.on('daifuda-joker', () => {
        io.emit('daifuda-joker-true');
      });          
      // カード出したとき
      socket.on('discard', (card, mark) => {
        if (card.cardId === fukukanCard) {
          fukukan = card.playerId;
        }
        cards = player.returnCards();
        if (!player) {
          return;
        }
        // カードを捨てたプレイヤーによって座標を変える
        let fX = 0;
        let fY = 0;
        if (player.playerNum === 1) {
          fX = 730;
          fY = 310;
        }
        if (player.playerNum === 2) {
          fX = 590;
          fY = 270;
        }
        if (player.playerNum === 3) {
          fX = 590;
          fY = 140;
        }
        if (player.playerNum === 4) {
          fX = 860;
          fY = 140;
        }
        if (player.playerNum === 5) {
          fX = 860;
          fY = 270;
        }
        world.setCard.forEach(
          (c) => {
            if (c.cardId === card.cardId) {
              c.cardUnclicked();
              c.setPosition(fX, fY, player);
            }
          });
        // 持っているカードから,捨てた分を減らす
        for (let i = 0; i < cards.length; i++) {
          if (cards[i] === card.cardId) {
            cards.splice(i, 1);
          }
        }
        // 改めて、カードを配置し直す
        fX = player.fX - 60;
        fY = player.fY + 180;
        world.setCard.forEach(
          (c) => {
            cards.forEach(
              (card) => {
                if (c.cardId === card) {
                  c.setPosition(fX, fY, player);
                  fX = fX + 20;
                }
              });
          });
        player.discard(card);
        fieldCards.push(card);
        currentReverse = this.judgeReverse(card, kirifuda, currentReverse);
        if (!reverse) {
          teban += 1;
          if (teban == GameSettings.PLAYER_NUM + 1) teban = 1;
        } else {
          teban -= 1;
          if (teban == 0) teban = GameSettings.PLAYER_NUM;
        }
        // 場のカードが1枚のときに、台札を決め、すべてのプレイヤーが出せるカードを限定する
        if (fieldCards.length == 1) {
          let daifuda = fieldCards[0].cardId;
          // マークが渡ってきたら（=ジョーカーが来てたら)、台札のマークをそれにする。
          if(mark) daifuda = mark.slice(0,1);
            // まず、jo以外の全てのカードを出せなくする
            world.setCard.forEach(
              (c) => {
                if (c.cardId !== 'jo') {
                  c.setNotRequest();
                }
              });
            // 台札のスートを見る
            world.setPlayer.forEach(
              (player) => {
                let cards = player.returnCards();
                let requestCards = cards.filter(function (c) {
                  return (c.slice(0,1) === daifuda.slice(0,1));
                });
                // 出せるカードがある場合、それしか出せない
                if(requestCards.length) {
                  requestCards.forEach((rc) => {
                    world.setCard.forEach(
                      (c) => {
                        if (c.cardId === rc) {
                          c.setRequest();
                        }
                      });
                  });
                // 出せるカードがない場合は、全部出せる
                } else {
                  cards.forEach((card) => {
                    world.setCard.forEach(
                      (c) => {
                        if (c.cardId === card) {
                          c.setRequest();
                        }
                      });
                  });
                }
              });
            // 台札がjo請求のときだけ特別処理
            if(daifuda === 'c3') {
              // まず、joを持ってるプレーヤーを探す
              world.setPlayer.forEach(
                (player) => {
                  let retCards = player.returnCards();
                  let joFlg = retCards.indexOf("jo") >= 0;
                  // joを持ってるプレーヤーの場合
                  if (joFlg) {
                    retCards.forEach((rc) => {
                      // jo以外のカードを出せなくする
                      world.setCard.forEach(
                        (c) => {
                          if (c.cardId === rc && rc !== 'jo') {
                            c.setNotRequest();
                          } else if(c.cardId === rc && rc === 'jo') {
                            c.setRequest();
                          }
                        });
                    });
                  }
                });
            }
        }        
        // 場のカードが5枚になったとき
        if (fieldCards.length == GameSettings.PLAYER_NUM) {
          turn = turn + 1;
          let winner = this.judgeWinner(fieldCards, turn, kirifuda);
          // 判定のために14にしたものがある場合、1に戻す
          for (let i = 0; i < fieldCards.length; i++ ) {
            let num = fieldCards[i].cardId.replace(/[^0-9]/g, '');
            if (num == 14) fieldCards[i].cardId = fieldCards[i].cardId.slice(0, 1) + 1;
          }          
          teban = winner;
          // 場からカードを消す。ついでに絵札の枚数をカウントする
          let efuda = 0;
          fieldCards.forEach((fieldCard) => {
            let num = fieldCard.cardId.replace(/[^0-9]/g, '');
            if (num >= 10 || num == 1) efuda += 1;
            world.destroyCard2(fieldCard)
          });
          if(changeCards) {
              changeCards.forEach(
              (changeCard) => {
                let num = changeCard.cardId.replace(/[^0-9]/g, '');
                if (num >= 10 || num == 1) efuda += 1;                  
                world.destroyCard2(changeCard)}
              );
          }
          console.log('winner:' + winner + ', 絵札枚数:' + efuda)          
          // 勝者に絵札を渡す
          world.setPlayer.forEach(
            (player) => {
              if (player.playerNum === winner) {
                player.increaseEfuda(efuda);
              }
            });          
          // 最初に出したカードがあったら、それも消す
          // 初期化する
          fieldCards = [];
          changeCards = null;
          // 実際の周りもここで決める
          reverse = currentReverse;
          // 全てのカードを出せるようにする
          world.setCard.forEach(
            (card) => {
                card.setRequest();
            });
        }
        io.emit('discard-end');
        if(mark) io.emit('daifuda-joker-end');
      });
    });
    // 周期的処理（1秒間にFRAMERATE回の場合、delayは、1000[ms]/FRAMERATE[回]）
    setInterval(
      () => {
        // 経過時間の算出
        const iTimeCurrent = Date.now(); // ミリ秒単位で取得
        const fDeltaTime = (iTimeCurrent - iTimeLast) * 0.001; // 秒に変換
        iTimeLast = iTimeCurrent;
        //console.log( 'DeltaTime = %f[s]', fDeltaTime );
        // 処理時間計測用
        const hrtime = process.hrtime(); // ナノ秒単位で取得
        // ゲームワールドの更新
        world.update(fDeltaTime);
        const hrtimeDiff = process.hrtime(hrtime);
        const iNanosecDiff = hrtimeDiff[0] * 1e9 + hrtimeDiff[1];
        // 最新状況をクライアントに送信
        io.emit('update', Array.from(world.setPlayer),
          Array.from(world.setCard), Array.from(world.setNumber), Array.from(world.setMark), teban, passCnt, fukukanCard, currentReverse, phase,
           napoleon, fukukan, fieldCards.length, iNanosecDiff); // 送信
      }, 1000 / GameSettings.FRAMERATE); // 単位は[ms]。1000[ms] / FRAMERATE[回]
  }
  createCardList() {
    let cardId = '';
    let cardList = [];
    // カードデータを全て生成する
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 13; j++) {
        if (i === 1) {
          cardId = 's' + j;
        }
        if (i === 2) {
          cardId = 'c' + j;
        }
        if (i === 3) {
          cardId = 'd' + j;
        }
        if (i === 4) {
          cardId = 'h' + j;
        }
        cardList.push(cardId);
      }
    }
    cardList.push('jo');
    for (let i = cardList.length - 1; i >= 0; i--) {
      // 0~iのランダムな数値を取得
      let rand = Math.floor(Math.random() * (i + 1));
      // 配列の数値を入れ替える
      [cardList[i], cardList[rand]] = [cardList[rand], cardList[i]]
    }
    return cardList;
  }
  judgeReverse(card, kirifuda, currentReverse) {
    if (kirifuda === 'spade' || kirifuda === 'clover') {
      if (card.cardId === 'd11' || card.cardId === 'h11') return !currentReverse;
    }
    if (kirifuda === 'heart' || kirifuda === 'diamond') {
      if (card.cardId === 's11' || card.cardId === 'c11') return !currentReverse;
    }
    // 何事もない場合は、そのまま
    return currentReverse;
  }
  judgeWinner(fieldCards, turn, kirifuda) {
    let mighty = false;
    let yoromeki = false;
    let joker = false;
    let trueJack = null;
    let falseJack = null;
    let mark = null;
    let prevMark = null;
    let sameTwoFlg = true;
    let winner = null;
    let daifuda = fieldCards[0].cardId.slice(0, 1)
    fieldCards.forEach(
      // 役札を確認する
      (fieldCard) => {
        console.log('ターン:' + turn + ', プレイヤー:' + fieldCard.playerNum + ', カード:' + fieldCard.cardId)
        mark = fieldCard.cardId.slice(0, 1);
        if (fieldCard.cardId === 's1') mighty = true;
        if (fieldCard.cardId === 'h12') yoromeki = true;
        if (fieldCard.cardId === 'jo') joker = true;
        if (kirifuda === 'spade') {
          if (fieldCard.cardId === 's11') trueJack = 's11';
          if (fieldCard.cardId === 'c11') falseJack = 'c11';
        } else if (kirifuda === 'clover') {
          if (fieldCard.cardId === 'c11') trueJack = 'c11';
          if (fieldCard.cardId === 's11') falseJack = 's11';
        } else if (kirifuda === 'heart') {
          if (fieldCard.cardId === 'h11') trueJack = 'h11';
          if (fieldCard.cardId === 'd11') falseJack = 'd11';
        } else if (kirifuda === 'diamond') {
          if (fieldCard.cardId === 'd11') trueJack = 'd11';
          if (fieldCard.cardId === 'h11') falseJack = 'h11';
        }
        // 後のセイムツー判定のためにスートの確認もする
        if (prevMark && sameTwoFlg) {
          if (mark === prevMark) {
            sameTwoFlg = true;
          } else {
            sameTwoFlg = false;
          }
        }
        prevMark = mark;
      });
    // マイティかつよろめきの場合
    if (mighty && yoromeki) {
      winner = fieldCards.filter(function (f) {
        return (f.cardId === 'h12');
      });
      return winner[0].playerNum;
    }
    //  マイティのみの場合
    if (mighty && !yoromeki) {
      winner = fieldCards.filter(function (f) {
        return (f.cardId === 's1');
      });
      return winner[0].playerNum;
    }
    //  joの場合
    if (joker) {
      winner = fieldCards.filter(function (f) {
        return (f.cardId === 'jo');
      });
      return winner[0].playerNum;
    }
    //  正ジャックの場合
    if (trueJack) {
      winner = fieldCards.filter(function (f) {
        return (f.cardId === trueJack);
      });
      return winner[0].playerNum;
    }
    //  裏ジャックの場合
    if (falseJack) {
      winner = fieldCards.filter(function (f) {
        return (f.cardId === falseJack);
      });
      return winner[0].playerNum;
    }
    //  1ターン目以外でセイムツーの場合
    if (sameTwoFlg && turn != 1) {
      // 台札のスート
      winner = fieldCards.filter(function (f) {
        return (f.cardId === daifuda + '2');
      });
      if (winner.length) return winner[0].playerNum;
    }
    // それ以外の場合
    // Aのカードがある場合、強さ判定のために数字を14にする
    for (let i = 0; i < fieldCards.length; i++ ) {
      let num = fieldCards[i].cardId.replace(/[^0-9]/g, '');
      if (num == 1) fieldCards[i].cardId = fieldCards[i].cardId.slice(0, 1) + 14;
    }
    // 切り札を探す
    let kirifudaCards = fieldCards.filter(function (f) {
      return (f.cardId.slice(0, 1) === kirifuda.slice(0, 1));
    });
    // 切り札がある場合、切り札の中で一番強いカードを返却
    if (kirifudaCards.length){
        kirifudaCards.sort(function(val1,val2){
          var val1 = val1.cardId;
          var val2 = val2.cardId;
          return val2.match(/\d+/) - val1.match(/\d+/);
      });
      return kirifudaCards[0].playerNum;
    }
      // 切り札がない場合、台札の中で一番強いカードを返却
      // 台札を探す
      let daifudaCards = fieldCards.filter(function (f) {
        return (f.cardId.slice(0, 1) === daifuda);
      });      
      daifudaCards.sort(function(val1,val2){
        var val1 = val1.cardId;
        var val2 = val2.cardId;
        return val2.match(/\d+/) - val1.match(/\d+/);
      });
      return daifudaCards[0].playerNum;
  }
}