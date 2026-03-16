function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var params = e.parameter;

  var newRow = [
    new Date(),                    // timestamp - 时间戳
    params.name || '',             // name - 姓名
    params.contact || '',          // contact - 联系方式
    params.birthdate || '',       // birthdate - 出生日期
    params.birthtime || '',       // birthtime - 出生时间
    params.birthplace || '',      // birthplace - 出生地点
    params.note || '',            // note - 备注
    params.language || ''         // language - 语言
  ];

  sheet.appendRow(newRow);

  return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
