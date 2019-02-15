
var channel_access_token = getAccessToken();

// メッセージ返信
function reply(e, text) {
  var message = {
    "replyToken" : e.replyToken,
    "messages" : [
      {
        "type" : "text",
        "text" : text
      }
    ]
  };
  var replyData = {
    "method" : "post",
    "headers" : {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer " + channel_access_token
    },
    "payload" : JSON.stringify(message)
  };
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", replyData);
}

// bomb投下
function bomb(to, bomb_text) {
  
  if(bomb_text == "stamp") {
    // 投下するスタンプの情報
    var messages = [
      {
        "type": "sticker",
        "packageId": "4",
        "stickerId": "279"
      }
    ]; 
  } else {
    //投下するメッセージの情報
    var messages = [
      {
        "type": "text",
        "text": bomb_text
      }
    ]; 
  }
  
  var message = {
    "to": to,
    "messages" : messages
  };
  var postData = {
    "method" : "post",
    "headers" : {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer " + channel_access_token
    },
    "payload" : JSON.stringify(message)
  };
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", postData);
}

/* フォローされた時の処理 */
function follow(e) {
  
}

/* アンフォローされた時の処理 */
function unFollow(e){
  
}