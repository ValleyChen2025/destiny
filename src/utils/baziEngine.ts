// 纯 JavaScript 八字计算引擎 - 简化版

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const SOUTHERN_MONTH_MAP: Record<string, string> = {
  '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
};

function getTrueSolarTime(hour: number, minute: number, longitude: number) {
  const diff = longitude - 120;
  const minuteDiff = diff * 4;
  let totalMinutes = hour * 60 + minute + minuteDiff;
  let dayOffset = 0;

  if (totalMinutes >= 1440) { totalMinutes -= 1440; dayOffset = 1; }
  else if (totalMinutes < 0) { totalMinutes += 1440; dayOffset = -1; }

  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60, dayOffset };
}

function getYearGanZhi(year: number): string {
  // 1984 = 甲子
  const diff = year - 1984;
  return GAN[(diff + 10) % 10] + ZHI[(diff + 12) % 12];
}

function getDayGanZhi(date: Date): string {
  // 简单算法：天数偏移
  const base = new Date(2000, 0, 1); // 庚辰
  const diff = Math.floor((date.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  const ganIndex = (diff + 7) % 10; // 庚=6, index=7
  const zhiIndex = (diff + 5) % 12; // 辰=4, index=5
  return GAN[ganIndex] + ZHI[zhiIndex];
}

function getMonthBranch(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // 简化的节气判断
  const termDays = [20, 4, 20, 5, 21, 5, 21, 6, 21, 6, 22, 7];
  const idx = (m - 1) * 2;
  const isAfterTerm = d >= termDays[idx];
  const zhiIdx = isAfterTerm ? (m % 12) : ((m + 10) % 12);
  return ZHI[zhiIdx];
}

function getTimeGanZhi(hour: number, dayGan: string): string {
  let zhiIdx = (hour + 1) / 2;
  if (hour === 23 || hour === 0) zhiIdx = 0;
  zhiIdx = Math.floor(zhiIdx) % 12;

  const dayGanIdx = GAN.indexOf(dayGan);
  const offset = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8][dayGanIdx] || 0;
  const ganIdx = (offset + zhiIdx) % 10;

  return GAN[ganIdx] + ZHI[zhiIdx];
}

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
  const birthDate = new Date(birthDateStr + 'T00:00:00');
  const timeMatch = birthTimeStr.match(/^(\d{1,2}):(\d{2})$/);

  if (!timeMatch) throw new Error('Invalid time');

  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);

  const { hour: adjHour, minute: adjMin, dayOffset } = getTrueSolarTime(hour, minute, longitude);

  const adjDate = new Date(birthDate);
  adjDate.setDate(adjDate.getDate() + dayOffset);

  const yearGanZhi = getYearGanZhi(birthDate.getFullYear());
  const monthBranch = getMonthBranch(adjDate);
  const finalMonthBranch = isSouthern ? (SOUTHERN_MONTH_MAP[monthBranch] || monthBranch) : monthBranch;

  // 月干计算
  const yearGan = yearGanZhi.charAt(0);
  const monthIdx = GAN.indexOf(yearGan);
  const monthGan = GAN[(monthIdx * 2 + adjDate.getMonth() + 10) % 10];
  const monthGanZhi = monthGan + finalMonthBranch;

  const dayGanZhi = getDayGanZhi(adjDate);
  const timeGanZhi = getTimeGanZhi(adjHour, dayGanZhi.charAt(0));

  return {
    yearGanZhi,
    monthGanZhi,
    dayGanZhi,
    timeGanZhi,
    solarTerm: '',
    isSouthern,
    trueSolarTime: `${adjHour}:${adjMin}`,
  };
}

export function formatBaziString(result: BaziResult): string {
  return `${result.yearGanZhi}年 ${result.monthGanZhi}月 ${result.dayGanZhi}日 ${result.timeGanZhi}时`;
}
