// 纯 JavaScript 八字计算引擎 - 极简稳定版

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function getYearGanZhi(year: number): string {
  const diff = year - 1984;
  return GAN[(diff + 10) % 10] + ZHI[(diff + 12) % 12];
}

function getDayGanZhi(date: Date): string {
  try {
    const base = new Date(2000, 0, 1);
    const diff = Math.floor((date.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
    const ganIdx = (diff + 7) % 10;
    const zhiIdx = (diff + 5) % 12;
    return GAN[ganIdx] + ZHI[zhiIdx];
  } catch (e) {
    return '甲子'; // 默认
  }
}

function getMonthBranch(month: number): string {
  const map = ['', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  return map[month] || '寅';
}

function getMonthGan(yearGan: string, month: number): string {
  const yearGanIdx = GAN.indexOf(yearGan);
  if (yearGanIdx < 0) return '甲';
  return GAN[(yearGanIdx * 2 + month - 1) % 10];
}

function getTimeZhi(hour: number): string {
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

function getTimeGan(dayGan: string, timeZhi: string): string {
  const dayIdx = GAN.indexOf(dayGan);
  const zhiIdx = ZHI.indexOf(timeZhi);
  const offset = [0, 0, 2, 2, 4, 4, 6, 6, 8, 8][dayIdx] || 0;
  return GAN[(offset + zhiIdx) % 10];
}

// 五行对应表
const wuxingMap: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

export interface BaziResult {
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
  solarTerm: string;
  isSouthern: boolean;
  trueSolarTime: string;
}

// 简化版返回格式（兼容现有代码）
export interface SimpleBaziResult {
  bazi: string;
  wuxing: string;
  dayun: string;
}

export function calculateBazi(
  birthDateStr: string,
  birthTimeStr: string,
  longitude: number = 120,
  isSouthern: boolean = false
): BaziResult {
  // 解析日期
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) {
    throw new Error('Invalid date');
  }

  // 解析时间
  const timeParts = birthTimeStr.split(':');
  let hour = parseInt(timeParts[0], 10) || 0;
  const minute = parseInt(timeParts[1], 10) || 0;

  // 真太阳时修正
  const diff = longitude - 120;
  const minuteDiff = diff * 4;
  let totalMinutes = hour * 60 + minute + minuteDiff;
  let dayOffset = 0;

  if (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    dayOffset = 1;
  } else if (totalMinutes < 0) {
    totalMinutes += 1440;
    dayOffset = -1;
  }

  hour = Math.floor(totalMinutes / 60);
  const adjMinute = totalMinutes % 60;

  // 调整后的日期
  const adjDate = new Date(birthDate);
  adjDate.setDate(adjDate.getDate() + dayOffset);

  // 年柱
  const year = birthDate.getFullYear();
  const yearGanZhi = getYearGanZhi(year);

  // 月柱
  const month = adjDate.getMonth() + 1;
  let monthBranch = getMonthBranch(month);
  if (isSouthern) {
    const southernMap: Record<string, string> = {
      '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥', '午': '子', '未': '丑'
    };
    monthBranch = southernMap[monthBranch] || monthBranch;
  }
  const monthGan = getMonthGan(yearGanZhi.charAt(0), month);
  const monthGanZhi = monthGan + monthBranch;

  // 日柱
  const dayGanZhi = getDayGanZhi(adjDate);

  // 时柱
  const timeZhi = getTimeZhi(hour);
  const timeGan = getTimeGan(dayGanZhi.charAt(0), timeZhi);
  const timeGanZhi = timeGan + timeZhi;

  return {
    yearGanZhi,
    monthGanZhi,
    dayGanZhi,
    timeGanZhi,
    solarTerm: '',
    isSouthern,
    trueSolarTime: `${hour}:${adjMinute}`,
  };
}

export function formatBaziString(result: BaziResult): string {
  return `${result.yearGanZhi}年 ${result.monthGanZhi}月 ${result.dayGanZhi}日 ${result.timeGanZhi}时`;
}

// 转换为简化格式（包含八字、五行、大运）
export function toSimpleResult(result: BaziResult, birthYear: number): SimpleBaziResult {
  const baziString = `${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.timeGanZhi}`;

  // 五行统计
  const allText = result.yearGanZhi + result.monthGanZhi + result.dayGanZhi + result.timeGanZhi;
  let wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const char of allText) {
    const wx = wuxingMap[char];
    if (wx) wuxingCount[wx as keyof typeof wuxingCount]++;
  }
  const wuxingString = `木${wuxingCount.木 * 10}% 火${wuxingCount.火 * 10}% 土${wuxingCount.土 * 10}% 金${wuxingCount.金 * 10}% 水${wuxingCount.水 * 10}%`;

  // 大运从8岁起
  const startYear = birthYear + 8;
  const dayunString = `${startYear}岁起运`;

  return {
    bazi: baziString,
    wuxing: wuxingString,
    dayun: dayunString
  };
}
