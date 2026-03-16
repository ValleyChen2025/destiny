// 纯 JavaScript 八字计算引擎 - 无需外部库

// 天干
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 南半球月令六冲对冲表
const SOUTHERN_MONTH_MAP: Record<string, string> = {
  '寅': '申',
  '卯': '酉',
  '辰': '戌',
  '巳': '亥',
  '午': '子',
  '未': '丑',
};

// 节气日期（近似值，用于判断月令）
const SOLAR_TERMS = [
  { name: '小寒', month: 0, day: 5 },
  { name: '大寒', month: 0, day: 20 },
  { name: '立春', month: 1, day: 4 },
  { name: '雨水', month: 1, day: 19 },
  { name: '惊蛰', month: 2, day: 6 },
  { name: '春分', month: 2, day: 21 },
  { name: '清明', month: 3, day: 5 },
  { name: '谷雨', month: 3, day: 20 },
  { name: '立夏', month: 4, day: 6 },
  { name: '小满', month: 4, day: 21 },
  { name: '芒种', month: 5, day: 6 },
  { name: '夏至', month: 5, day: 21 },
  { name: '小暑', month: 6, day: 7 },
  { name: '大暑', month: 6, day: 23 },
  { name: '立秋', month: 7, day: 8 },
  { name: '处暑', month: 7, day: 23 },
  { name: '白露', month: 8, day: 8 },
  { name: '秋分', month: 8, day: 23 },
  { name: '寒露', month: 9, day: 8 },
  { name: '霜降', month: 9, day: 23 },
  { name: '立冬', month: 10, day: 7 },
  { name: '小雪', month: 10, day: 22 },
  { name: '大雪', month: 11, day: 7 },
  { name: '冬至', month: 11, day: 22 },
];

/**
 * 计算真太阳时
 */
function getTrueSolarTime(
  hour: number,
  minute: number,
  longitude: number
): { hour: number; minute: number; dayOffset: number } {
  const BEIJING_LONGITUDE = 120;
  const diff = longitude - BEIJING_LONGITUDE;
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

  return {
    hour: Math.floor(totalMinutes / 60),
    minute: totalMinutes % 60,
    dayOffset,
  };
}

/**
 * 获取儒略日
 */
function getJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  jd = jd - 0.5 + (hour + minute / 60) / 24;

  return jd;
}

/**
 * 计算年柱
 */
function getYearGanZhi(year: number): string {
  // 1984年是甲子年
  const baseYear = 1984;
  const baseGanZhiIndex = 0; // 甲子
  const diff = year - baseYear;
  const ganIndex = (diff + baseGanZhiIndex) % 10;
  const zhiIndex = (diff + baseGanZhiIndex) % 12;
  return GAN[ganIndex] + ZHI[zhiIndex];
}

/**
 * 计算日柱（使用儒略日）
 */
function getDayGanZhi(date: Date): string {
  // 已知 2000年1月1日 是庚辰日
  const baseDate = new Date(2000, 0, 1);
  const baseDayGanZhi = '庚辰';
  const baseGanIndex = GAN.indexOf('庚');
  const baseZhiIndex = ZHI.indexOf('辰');

  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const ganIndex = (diffDays + baseGanIndex) % 10;
  const zhiIndex = (diffDays + baseZhiIndex) % 12;

  return GAN[ganIndex] + ZHI[zhiIndex];
}

/**
 * 获取月令地支
 */
function getMonthBranch(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 节气判断 - 简化的节气表
  const monthStart = new Date(year, month - 1, 1);
  const monthDays = new Date(year, month, 0).getDate();

  // 粗略判断：每月节前后月令改变
  // 寅月(立春后), 卯月(惊蛰后), 辰月(清明后)...
  const termDays = [4, 19, 6, 21, 5, 20, 6, 21, 8, 23, 7, 22, 7, 23, 8, 23, 8, 23, 8, 23, 7, 22, 7, 22];

  // 简化的月令判断
  const termIndex = (month - 1) * 2;
  const termDay = termDays[termIndex] || 15;

  let monthZhiIndex: number;
  if (day >= termDay) {
    monthZhiIndex = month; // 节后
  } else {
    monthZhiIndex = month - 1; // 节前
  }

  // 调整到正确的地支（子月=11月开始）
  monthZhiIndex = ((monthZhiIndex + 1) % 12);
  return ZHI[monthZhiIndex];
}

/**
 * 计算时柱
 */
function getTimeGanZhi(hour: number, dayGan: string): string {
  // 子时 23:00-00:59
  let zhiIndex: number;
  if (hour >= 23 || hour < 1) {
    zhiIndex = 0; // 子
  } else {
    zhiIndex = Math.floor((hour + 1) / 2);
  }
  const zhi = ZHI[zhiIndex];

  // 日干分阴阳，时干计算
  const dayGanIndex = GAN.indexOf(dayGan);
  const offsetMap: Record<number, number> = {
    0: 0,  // 甲
    5: 0,  // 己
    1: 2,  // 乙
    6: 2,  // 庚
    2: 4,  // 丙
    7: 4,  // 辛
    3: 6,  // 丁
    8: 6,  // 壬
    4: 8,  // 戊
    9: 8,   // 癸
  };

  const offset = offsetMap[dayGanIndex] ?? 0;
  const ganIndex = (offset + zhiIndex) % 10;

  return GAN[ganIndex] + zhi;
}

/**
 * 南半球月令对冲
 */
function getSouthernMonthBranch(monthZhi: string): string {
  return SOUTHERN_MONTH_MAP[monthZhi] || monthZhi;
}

/**
 * 获取节气名称（简化版）
 */
function getSolarTerm(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // 使用简化判断
  const termDays = [5, 20, 4, 19, 6, 21, 5, 20, 6, 21, 6, 21, 7, 23, 8, 23, 8, 23, 8, 23, 8, 23, 7, 22, 7, 22];
  const termNames = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
                     '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];

  const idx = month * 2;
  if (day >= termDays[idx]) {
    return termNames[idx];
  }
  return '';
}

/**
 * 计算八字主函数
 */
export interface BaziResult {
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
  solarTerm: string;
  isSouthern: boolean;
  trueSolarTime: string;
}

export function calculateBazi(
  birthDateStr: string,
  birthTimeStr: string,
  longitude: number = 120,
  isSouthern: boolean = false
): BaziResult {
  const birthDate = new Date(birthDateStr);

  const timeMatch = birthTimeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    throw new Error('Invalid time format. Use HH:MM');
  }

  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);

  // 真太阳时
  const { hour: adjustedHour, minute: adjustedMinute, dayOffset } = getTrueSolarTime(hour, minute, longitude);

  // 调整日期
  const adjustedDate = new Date(birthDate);
  adjustedDate.setDate(adjustedDate.getDate() + dayOffset);

  const adjustedTimeStr = `${adjustedHour.toString().padStart(2, '0')}:${adjustedMinute.toString().padStart(2, '0')}`;

  // 年柱
  const year = birthDate.getFullYear();
  const yearGanZhi = getYearGanZhi(year);
  const yearGan = yearGanZhi.charAt(0);

  // 月柱
  const monthBranch = getMonthBranch(adjustedDate);
  const finalMonthBranch = isSouthern ? getSouthernMonthBranch(monthBranch) : monthBranch;
  const monthGanIndex = (GAN.indexOf(yearGan) % 5) * 2 + (adjustedDate.getMonth()) % 12;
  const monthGan = GAN[(monthGanIndex + 10) % 10];
  const monthGanZhi = monthGan + finalMonthBranch;

  // 日柱
  const dayGanZhi = getDayGanZhi(adjustedDate);
  const dayGan = dayGanZhi.charAt(0);

  // 时柱
  const timeGanZhi = getTimeGanZhi(adjustedHour, dayGan);

  // 节气
  const solarTerm = getSolarTerm(adjustedDate);

  return {
    yearGanZhi,
    monthGanZhi,
    dayGanZhi,
    timeGanZhi,
    solarTerm,
    isSouthern,
    trueSolarTime: adjustedTimeStr,
  };
}

export function formatBaziString(result: BaziResult): string {
  return `${result.yearGanZhi}年 ${result.monthGanZhi}月 ${result.dayGanZhi}日 ${result.timeGanZhi}时`;
}
