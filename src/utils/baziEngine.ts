import {
  Lunar,
  LunarMonth,
  Solar,
  SolarUtil,
} from 'lunar-javascript';

// 天干
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 地支对应时辰
const ZHI_HOUR: Record<string, number> = {
  '子': 23,
  '丑': 1,
  '寅': 3,
  '卯': 5,
  '辰': 7,
  '巳': 9,
  '午': 11,
  '未': 13,
  '申': 15,
  '酉': 17,
  '戌': 19,
  '亥': 21,
};

/**
 * 南半球月令六冲对冲表
 */
const SOUTHERN_MONTH_MAP: Record<string, string> = {
  '寅': '申', // 正月→七月
  '卯': '酉', // 二月→八月
  '辰': '戌', // 三月→九月
  '巳': '亥', // 四月→十月
  '午': '子', // 五月→十一月
  '未': '丑', // 六月→十二月
};

/**
 * 计算真太阳时
 * @param hour 小时 (0-23)
 * @param minute 分钟 (0-59)
 * @param longitude 用户出生经度
 * @returns 调整后的小时和分钟
 */
function getTrueSolarTime(
  hour: number,
  minute: number,
  longitude: number
): { hour: number; minute: number; dayOffset: number } {
  // 北京时间基准经度
  const BEIJING_LONGITUDE = 120;
  // 经度差
  const diff = longitude - BEIJING_LONGITUDE;
  // 时间偏差（分钟）
  const minuteDiff = diff * 4;

  // 加上时差
  let totalMinutes = hour * 60 + minute + minuteDiff;

  // 处理跨天
  let dayOffset = 0;
  if (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    dayOffset = 1;
  } else if (totalMinutes < 0) {
    totalMinutes += 1440;
    dayOffset = -1;
  }

  const adjustedHour = Math.floor(totalMinutes / 60);
  const adjustedMinute = totalMinutes % 60;

  return { hour: adjustedHour, minute: adjustedMinute, dayOffset };
}

/**
 * 计算日柱
 * 使用 lunar-javascript 的儒略日计算
 */
function getDayGanZhi(date: Date): string {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const dayGanZhi = lunar.getDayInGanZhi();

  return dayGanZhi;
}

/**
 * 计算年柱
 */
function getYearGanZhi(date: Date): string {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const yearGanZhi = lunar.getYearInGanZhi();

  return yearGanZhi;
}

/**
 * 获取农历月份的地支
 */
function getMonthBranch(date: Date): string {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const monthZhi = lunar.getMonthInZhi();

  return monthZhi;
}

/**
 * 获取农历年的天干
 */
function getYearGan(date: Date): string {
  const yearGanZhi = getYearGanZhi(date);
  return yearGanZhi.charAt(0);
}

/**
 * 根据生时计算时柱
 * @param hour 真太阳时小时
 * @param dayGan 日柱天干
 */
function getTimeGanZhi(hour: number, dayGan: string): string {
  // 时柱地支计算：23:00-23:59 为子时，0:00-0:59 也算子时
  let zhiIndex: number;
  if (hour >= 23 || hour < 1) {
    zhiIndex = 0; // 子
  } else {
    zhiIndex = Math.floor((hour + 1) / 2);
  }
  const zhi = ZHI[zhiIndex];

  // 日干索引（0-9）
  const dayGanIndex = GAN.indexOf(dayGan);

  // 时干计算：日干分阴阳
  // 甲己日起甲子，乙庚日起丙子，丙辛日起戊子，丁壬日起庚子，戊癸日起壬子
  // 时干 = (日干序号 * 2 + 时支序号) % 10
  const offsetMap: Record<string, number> = {
    '甲': 0,
    '己': 0,
    '乙': 2,
    '庚': 2,
    '丙': 4,
    '辛': 4,
    '丁': 6,
    '壬': 6,
    '戊': 8,
    '癸': 8,
  };

  const offset = offsetMap[dayGan] ?? 0;
  const ganIndex = (offset + zhiIndex) % 10;
  const gan = GAN[ganIndex];

  return gan + zhi;
}

/**
 * 南半球月令对冲
 */
function getSouthernMonthBranch(monthZhi: string): string {
  return SOUTHERN_MONTH_MAP[monthZhi] || monthZhi;
}

/**
 * 获取节气
 */
function getSolarTerm(date: Date): string {
  const solar = Solar.fromDate(date);
  const jieQi = solar.getJieQi();

  if (jieQi && jieQi.getName()) {
    return jieQi.getName();
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
  birthDateStr: string,  // 格式: YYYY-MM-DD
  birthTimeStr: string,  // 格式: HH:mm 或 HH:MM
  longitude: number = 120,
  isSouthern: boolean = false
): BaziResult {
  // 解析出生日期
  const birthDate = new Date(birthDateStr);

  // 解析出生时间
  const timeMatch = birthTimeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    throw new Error('Invalid time format. Use HH:MM');
  }

  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);

  // 计算真太阳时
  const { hour: adjustedHour, minute: adjustedMinute, dayOffset } = getTrueSolarTime(
    hour,
    minute,
    longitude
  );

  // 根据真太阳时调整日期（处理跨天）
  const adjustedDate = new Date(birthDate);
  adjustedDate.setDate(adjustedDate.getDate() + dayOffset);

  // 格式化调整后的时间为字符串
  const adjustedTimeStr = `${adjustedHour.toString().padStart(2, '0')}:${adjustedMinute.toString().padStart(2, '0')}`;

  // 计算年柱
  const yearGanZhi = getYearGanZhi(birthDate);

  // 计算月柱（需要用调整后的日期来确定节气月）
  const monthBranch = getMonthBranch(adjustedDate);
  const finalMonthBranch = isSouthern ? getSouthernMonthBranch(monthBranch) : monthBranch;
  // 获取月干
  const yearGan = getYearGan(birthDate);
  const monthGanIndex = (GAN.indexOf(yearGan) % 5) * 2 + LunarMonth.getMonthFromIndex(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1) - 1;
  const monthGan = GAN[(monthGanIndex + 10) % 10];
  const monthGanZhi = monthGan + finalMonthBranch;

  // 计算日柱（使用调整后的日期）
  const dayGanZhi = getDayGanZhi(adjustedDate);

  // 计算时柱
  const dayGan = dayGanZhi.charAt(0);
  const timeGanZhi = getTimeGanZhi(adjustedHour, dayGan);

  // 获取节气
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

/**
 * 格式化八字结果为字符串（用于存储到 Google Sheets）
 */
export function formatBaziString(result: BaziResult): string {
  return `${result.yearGanZhi}年 ${result.monthGanZhi}月 ${result.dayGanZhi}日 ${result.timeGanZhi}时`;
}
