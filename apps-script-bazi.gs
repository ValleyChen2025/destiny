// Google Apps Script 八字计算引擎
// 复制到 Google Apps Script 中使用

var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 计算八字
function calculateBazi(birthDate, birthTime, longitude, isSouthern) {
  // 解析日期
  var birth = new Date(birthDate);
  var year = birth.getFullYear();
  var month = birth.getMonth() + 1;
  var day = birth.getDate();

  // 解析时间
  var timeParts = birthTime.split(':');
  var hour = parseInt(timeParts[0], 10) || 0;
  var minute = parseInt(timeParts[1], 10) || 0;

  // 真太阳时修正
  var diff = longitude - 120;
  var minuteDiff = diff * 4;
  var totalMinutes = hour * 60 + minute + minuteDiff;
  var dayOffset = 0;

  if (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    dayOffset = 1;
  } else if (totalMinutes < 0) {
    totalMinutes += 1440;
    dayOffset = -1;
  }

  hour = Math.floor(totalMinutes / 60);

  // 调整后的日期
  var adjDate = new Date(birth);
  adjDate.setDate(adjDate.getDate() + dayOffset);
  var adjMonth = adjDate.getMonth() + 1;

  // 年柱
  var yearDiff = year - 1984;
  var yearGanZhi = GAN[(yearDiff + 10) % 10] + ZHI[(yearDiff + 12) % 12];

  // 月柱
  var monthBranch = getMonthBranch(adjMonth);
  if (isSouthern === true || isSouthern === 'true') {
    var southernMap = {'寅': '申', '卯': '酉', '辰': '戌', '巳': '亥', '午': '子', '未': '丑'};
    monthBranch = southernMap[monthBranch] || monthBranch;
  }
  var monthGan = GAN[(GAN.indexOf(yearGanZhi.charAt(0)) * 2 + adjMonth - 1) % 10];
  var monthGanZhi = monthGan + monthBranch;

  // 日柱
  var dayGanZhi = getDayGanZhi(adjDate);

  // 时柱
  var timeZhi = getTimeZhi(hour);
  var timeGan = getTimeGan(dayGanZhi.charAt(0), timeZhi);
  var timeGanZhi = timeGan + timeZhi;

  return yearGanZhi + '年 ' + monthGanZhi + '月 ' + dayGanZhi + '日 ' + timeGanZhi + '时';
}

function getMonthBranch(month) {
  var map = ['', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  return map[month] || '寅';
}

function getDayGanZhi(date) {
  var base = new Date(2000, 0, 1); // 庚辰日
  var diff = Math.floor((date.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  var ganIdx = (diff + 7) % 10;
  var zhiIdx = (diff + 5) % 12;
  return GAN[ganIdx] + ZHI[zhiIdx];
}

function getTimeZhi(hour) {
  if (hour >= 23 || hour < 1) return '子';
  if (hour >= 1 && hour < 3) return '丑';
  if (hour >= 3 && hour < 5) return '寅';
  if (hour >= 5 && hour < 7) return '卯';
  if (hour >= 7 && hour < 9) return '辰';
  if (hour >= 9 && hour < 11) return '巳';
  if (hour >= 11 && hour < 13) return '午';
  if (hour >= 13 && hour < 15) return '未';
  if (hour >= 15 && hour < 17) return '申';
  if (hour >= 17 && hour < 19) return '酉';
  if (hour >= 19 && hour < 21) return '戌';
  if (hour >= 21 && hour < 23) return '亥';
  return '子';
}

function getTimeGan(dayGan, timeZhi) {
  var dayIdx = GAN.indexOf(dayGan);
  var zhiIdx = ZHI.indexOf(timeZhi);
  var offset = [0, 0, 2, 2, 4, 4, 6, 6, 8, 8][dayIdx] || 0;
  return GAN[(offset + zhiIdx) % 10];
}

// 修改后的 doPost 函数
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var params = e.parameter;

  // 获取原始数据
  var birthDate = params.birthdate || '';
  var birthTime = params.birthtime || '';
  var longitude = parseFloat(params.longitude) || 120;
  var isSouthern = params.is_southern || 'false';

  // 计算八字
  var bazi = '';
  try {
    bazi = calculateBazi(birthDate, birthTime, longitude, isSouthern);
  } catch (err) {
    bazi = '计算错误';
  }

  // 构建新行数据
  var newRow = [
    new Date(),           // timestamp
    params.name || '',    // name
    params.contact || '', // contact
    birthDate,            // birthdate
    birthTime,            // birthtime
    params.birthplace || '', // birthplace
    params.note || '',    // note
    params.language || '', // language
    bazi,                 // bazi - 自动计算的八字
    longitude,            // longitude
    isSouthern            // is_southern
  ];

  sheet.appendRow(newRow);

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}
