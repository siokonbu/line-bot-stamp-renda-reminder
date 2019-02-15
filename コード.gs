
var moment = Moment.load();

// ボットにメッセージ送信/フォロー/アンフォローした時の処理
function doPost(e) {
  var events = JSON.parse(e.postData.contents).events;
  events.forEach(function(event) {
    
    Logger.log('here');
    if(event.type == "message") {
      var to = getTo(event);
      Logger.log('here');
      var sheet_info = getSheet(to);
      var sheet = sheet_info.sheet;
      var userDataRow = sheet_info.userDataRow;
      
      var text = event.message.text;
      var bomb_text = text;
      var state = getState(sheet, userDataRow);
      
      // state: {0, 1, 2} = {テキスト入力待ち, 回数入力待ち, 時刻入力待ち}
      switch(state) {
          
        case 0:
          userDataRow += 1;
          if(text == "スタンプ" || text == "すたんぷ") {
            bomb_text = "stamp";
            reply(event, "スタンプを連打するね！");
          } else {
            reply(event, "「"+ bomb_text +"」を連打するね！");
          }
          setTextCell(sheet, userDataRow, bomb_text);
          bomb(to, "何回連打する？\n「キャンセル」って言ってくれればやめるよ〜");
          break;
          
        case 1:
          if(text == "キャンセル") {
            cancel(sheet, userDataRow);
            reply(event, "取り消したよ！またなんかあったらいってね〜");
          } else {
            // 全角英数を半角に変換
            text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
              return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
            // メッセージが数字かどうか判定
            var match = text.match(/\d+/g);
            if(match) {
              var bomb_num = Number(match[0]);
              // bomb回数制限
              if(bomb_num > 100) {
                bomb_num = 100
              }
              // bomb回数をsheetに追加
              setNumCell(sheet, userDataRow, bomb_num);
              reply(event, bomb_num + "回だね！");
              bomb(to, "いつやる？\n例：「いま」「明日」「15時」「10分後」「明日の17時」「12:20」「3時52分」「7月12日」など。");
            } else {
              reply(event, "数字で指定してください！");
            }
          }
          break;
          
        case 2:
          if(text == "今" || text == "いま") {
            pushBomb(sheet, userDataRow, to);
          } else {
            setDate(sheet, userDataRow, text, event);
          }
          break;
          
      }
      
    } else if(event.type == "follow") {
      follow(event);
    } else if(event.type == "unfollow") {
      unFollow(event);
    }
  });
}


// トリガー発生
function triggered(e) {
  
  var sheet_info = triggeredSheet(e);
  var sheet = sheet_info.sheet;
  var userDataRow = sheet_info.userDataRow;
  
  pushBomb(sheet, userDataRow, e.triggerUid);
}

// bomb連投
function pushBomb(sheet, userDataRow, id) {
  
  bomb_info = getBombInfo(sheet, userDataRow, id);
  
  for(var i=0; i<bomb_info.bomb_num; i++) {
    bomb(bomb_info.to, bomb_info.bomb_text);
  }
  
  cancel(sheet, userDataRow);
}

//　送信先ID取得
function getTo(e) {
  var user_id = e.source.userId;
  var room_id = e.source.roomId;
  var group_id = e.source.groupId;
  var to;
  
  // 送信先id判定
  if(group_id) {
    to = group_id;;
  } else if(room_id) {
    to = room_id;
  } else {
    to = user_id;
  }
  
  return to;
}

function setDate(sheet, userDataRow, text, event) {
//function setDate() {
  
  //var sheet = 'debug';
  //var userDataRow = 1;
  //var text = '明日の9時';
  
  // 全角英数を半角に変換
  text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
  
  // 現在時刻取得
  var cur_date = Moment.moment();
  var date = 'Invalid date';
  
  var match = text.match(/[\u30e0-\u9fcf]+/g);
  
    Logger.log(match);
  if(match === null) {
    var koron = text.match(/\d+:\d+/g);
    if(koron) {
      var h = Number(text.match(/\d+/g)[0]);
      date = cur_date.set('hour', h);
      var m = Number(text.match(/\d+/g)[1]);
      date = cur_date.set('minute', m);
      date = cur_date.set('second', 0);
      date = date.format('YYYY年MM月DD日H時m分');
    }
  } else {
    switch(match[0]) {
      case '分後':
        var m = Number(text.match(/\d+/g)[0]);
        date = cur_date.add(m, 'minutes');
        date = date.format('YYYY年MM月DD日H時m分');
        break;
        
      case '時間後':
        var h = Number(text.match(/\d+/g)[0]);
        date = cur_date.add(h, 'hours');
        date = date.format('YYYY年MM月DD日H時m分');
        break;
        
      case '時間半後':
        var h = Number(text.match(/\d+/g)[0]);
        date = cur_date.add(h+0.5, 'hours');
        date = date.format('YYYY年MM月DD日H時m分');
        break;
        
      case '時':
        var h = Number(text.match(/\d+/g)[0]);
        date = cur_date.set('hour', h);
        if(match[1] === '分') {
          var m = Number(text.match(/\d+/g)[1]);
          date = cur_date.set('minute', m);
        }　else {
          date = cur_date.set('minute', 0);
        }
        date = cur_date.set('second', 0);
        date = date.format('YYYY年MM月DD日H時m分');
        break;
        
      case '時半':
        var h = Number(text.match(/\d+/g)[0]);
        date = cur_date.set('hour', h);
        date = cur_date.set('minute', 30);
        date = cur_date.set('second', 0);
        date = date.format('YYYY年MM月DD日H時m分');
        break;
        
      case '月':
        var m = Number(text.match(/\d+/g)[0]);
        date = cur_date.set('month', m);
        if(match[1] === '日') {
          var d = Number(text.match(/\d+/g)[1]);
          date = cur_date.set('day', d);
          if(match[2] === '時') {
            var h = Number(text.match(/\d+/g)[2]);
            date = cur_date.set('hour', h);
            if(match[3] === '分') {
              var m = Number(text.match(/\d+/g)[3]);
              date = cur_date.set('minute', m);
            } else {
              date = cur_date.set('minute', 0);
            }
          } else {
            date = cur_date.set('hour', 9);
            date = cur_date.set('minute', 0);
          }
          
          date = cur_date.set('second', 0);
          date = date.format('YYYY年MM月DD日H時m分');
        }
        break;
        
      case '日':
        var d = Number(text.match(/\d+/g)[0]);
        date = cur_date.set('day', d);
        if(match[2] === '時') {
          var h = Number(text.match(/\d+/g)[1]);
          date = cur_date.set('hour', h);
          if(match[3] === '分') {
            var m = Number(text.match(/\d+/g)[2]);
            date = cur_date.set('minute', m);
          } else {
            date = cur_date.set('minute', 0);
          }
        } else {
          date = cur_date.set('hour', 9);
          date = cur_date.set('minute', 0);
        }
        
        date = cur_date.set('second', 0);
        date = date.format('YYYY年MM月DD日H時m分');
        break;
        
      case '明日':
        date = cur_date.add(1, 'days');
        if(match[1] === '時') {
          var h = Number(text.match(/\d+/g)[0]);
          date = cur_date.set('hour', h);
          if(match[2] === '分') {
            var m = Number(text.match(/\d+/g)[1]);
            date = cur_date.set('minute', m);
          } else {
            date = cur_date.set('minute', 0);
          }
        } else {
          date = cur_date.set('hour', 9);
          date = cur_date.set('minute', 0);
        }
        date = cur_date.set('second', 0);
        date = date.format('YYYY年MM月DD日H時m分');
        break;
        
    }
  }
  
  if(date === 'Invalid date') {
    return reply(event, 'わかんない！いつ？');
  } else if(date < Moment.moment()) {
    return reply(event, '未来の日時で教えて！');
  }
  
  setTrigger(sheet, userDataRow, date);
  setDateCell(sheet, userDataRow, date);
  return reply(event, date + 'に連投するね！');
}
