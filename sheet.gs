
var ss = getSpreadSheet();
   
// ユーザのsheetを取得or作成
function getSheet(to) {
  var sheet = ss.getSheetByName(to);
  if(!sheet) {
    sheet = ss.insertSheet(to);
  }
  
  var userDataRow = sheet.getLastRow();
  
  if(!userDataRow) {
    sheet.appendRow(['stamp or 文字', '回数', '日時', 'トリガーのUniqueId']);
    userDataRow = 1; 
  }
  
  return {'sheet': sheet, 'userDataRow': userDataRow};
}

// 最新rowの状態を確認
// state: {0, 1, 2} = {テキスト入力待ち, 回数入力待ち, 時刻入力待ち}
function getState(sheet, userDataRow) {
  
  var state;
  
  if(!getDateCell(sheet, userDataRow).isBlank()) {
    state = 0;
  } else if(!getNumCell(sheet, userDataRow).isBlank()) {
    state = 2;
  } else {
    state = 1;
  }
  return state;
}

// sheetとuserDataRowの設定
function triggeredSheet(e) {
  var sheets = ss.getSheets();
  var uid = e.triggerUid;
  // 発生したトリガーが書かれているsheetを特定
  for(var i=0; i<sheets.length; i++) {
    var data = sheets[i].getDataRange().getValues();
    // 発生したトリガーが書かれているuserDataRowを特定
    for(var j=0; j<data.length; j++) {
      if(data[j][3] === uid) {
        var userDataRow = j+1;
        var sheet = sheets[i];
        
        return {'sheet': sheet, 'userDataRow': userDataRow};
      }
    }
  }
}

// bomb情報取得
function getBombInfo(sheet, userDataRow, id) {
  var to = sheet.getName();
  var bomb_text = getTextCell(sheet, userDataRow).getValue();
  var bomb_num = getNumCell(sheet, userDataRow).getValue();
  
  return {to: to, bomb_text: bomb_text, bomb_num: bomb_num};
}

function cancel(sheet, userDataRow) {
  sheet.deleteRow(userDataRow);
}

function appendToSheet(sheet, text) {
  sheet.appendRow([text]);
}


// セッター
function setTextCell(sheet, userDataRow, val) {
  sheet.getRange(userDataRow, 1).setValue(val);
}

function setNumCell(sheet, userDataRow, val) {
  sheet.getRange(userDataRow, 2).setValue(val);
}

function setDateCell(sheet, userDataRow, val) {
  sheet.getRange(userDataRow, 3).setValue(val);
}

function setTriggerCell(sheet, userDataRow, val) {
  sheet.getRange(userDataRow, 4).setValue(val);
}

// ゲッター
function getTextCell(sheet, userDataRow) {
  return sheet.getRange(userDataRow, 1);
}

function getNumCell(sheet, userDataRow) {
  return sheet.getRange(userDataRow, 2);
}

function getDateCell(sheet, userDataRow) {
  return sheet.getRange(userDataRow, 3);
}

function getTriggerCell(sheet, userDataRow) {
  return sheet.getRange(userDataRow, 4);
}
