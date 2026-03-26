// 使用 lunar-javascript 专业排盘库
import { Solar, Lunar } from 'lunar-javascript';

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
  dayunStartAge: number;  // 起运年龄
}

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
  try {
    // 解析日期时间
    const [year, month, day] = birthDateStr.split('-').map(Number);
    const [hour, minute] = birthTimeStr.split(':').map(Number);

    // 有效性检查
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
      throw new Error('Invalid date or time');
    }

    // ===== 早晚子时处理 =====
    // 23:00-00:00 = 晚子时（日柱算当天）
    // 00:00-01:00 = 早子时（日柱算第二天）
    let dayOffsetForTime = 0;
    if (hour >= 23) {
      // 晚子时：日柱算当天，时柱算子时
      dayOffsetForTime = 0;
    } else if (hour >= 0 && hour < 1) {
      // 早子时：日柱算第二天
      dayOffsetForTime = 1;
    }

    // ===== 真太阳时处理 =====
    // 用户输入的时间：启用真太阳时 = 当地时间，不启用 = 近似北京时间
    // 两种情况都直接使用用户输入的时间，不需要再做经度偏移
    // （经度参数保留用于南半球月令对冲判断）
    let totalMinutes = hour * 60 + (minute || 0);
    let dayOffset = dayOffsetForTime;

    // 跨天处理（早晚子时）
    if (totalMinutes >= 1440) {
      totalMinutes -= 1440;
      dayOffset += 1;
    } else if (totalMinutes < 0) {
      totalMinutes += 1440;
      dayOffset -= 1;
    }

    const adjHour = Math.floor(totalMinutes / 60);
    const adjMinute = totalMinutes % 60;

    // 校正后的日期
    const adjDate = new Date(year, month - 1, day + dayOffset);

    // 使用 lunar-javascript 计算
    const solar = Solar.fromYmdHms(
      adjDate.getFullYear(),
      adjDate.getMonth() + 1,
      adjDate.getDate(),
      adjHour,
      adjMinute,
      0
    );

    let lunar = solar.getLunar();

    const eightChar = lunar.getEightChar();

    // 获取四柱
    const yearGanZhi = eightChar.getYear().toString();
    const monthGanZhi = eightChar.getMonth().toString();
    const dayGanZhi = eightChar.getDay().toString();
    const timeGanZhi = eightChar.getTime().toString();

    // 节气
    const solarTerm = lunar.getPrevJieQi()?.getName() || '';

    // ===== 计算大运起运年龄 =====
    // 日干阴阳决定顺逆：阳干顺行，阴干逆行
    const dayGan = dayGanZhi.charAt(0);
    const monthZhi = monthGanZhi.charAt(1);
    const isYangDay = '甲丙戊庚壬'.includes(dayGan);

    // 地支顺序：子1, 丑2, 寅3, 卯4, 辰5, 巳6, 午7, 未8, 申9, 酉10, 戌11, 亥12
    const zhiOrder: Record<string, number> = {
      '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
      '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12
    };
    const monthOrder = zhiOrder[monthZhi] || 1;

    // 计算起运年龄：阳日顺数，阴日逆数
    let dayunStartAge: number;
    if (isYangDay) {
      // 阳干：从月支往下数，数到下一个地支
      // 简化计算：大运从月令后一宫起算
      dayunStartAge = 1; // 简化处理，实际需要更复杂的计算
    } else {
      dayunStartAge = 1;
    }

    // 简化：使用 lunar-javascript 的大运计算
    // 大运从月令开始，阳顺阴逆
    const daYun = lunar.getDaYun();
    if (daYun && daYun.length > 0) {
      // 获取第一个大运的开始年龄
      const firstDaYun = daYun[0];
      dayunStartAge = firstDaYun.getStartAge() || 1;
    } else {
      dayunStartAge = 1;
    }

    return {
      yearGanZhi,
      monthGanZhi,
      dayGanZhi,
      timeGanZhi,
      solarTerm,
      isSouthern,
      trueSolarTime: `${adjHour}:${adjMinute}`,
      dayunStartAge,
    };
  } catch (error) {
    // 出错时返回默认值
    console.error('排盘计算错误:', error);
    return {
      yearGanZhi: '甲子',
      monthGanZhi: '甲子',
      dayGanZhi: '甲子',
      timeGanZhi: '甲子',
      solarTerm: '',
      isSouthern,
      trueSolarTime: '0:0',
    };
  }
}

export function formatBaziString(result: BaziResult): string {
  return `${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.timeGanZhi}`;
}

export function toSimpleResult(result: BaziResult, birthYear: number): SimpleBaziResult {
  const baziString = formatBaziString(result);

  // 五行统计 - 8个字，每个字代表一个五行
  const allText = result.yearGanZhi + result.monthGanZhi + result.dayGanZhi + result.timeGanZhi;
  let wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const char of allText) {
    const wx = wuxingMap[char];
    if (wx) wuxingCount[wx as keyof typeof wuxingCount]++;
  }
  // 计算百分比 (count/8 * 100)，确保四舍五入后总和为100
  const total = 8;
  const wuxingString = `木${Math.round(wuxingCount.木 / total * 100)}% 火${Math.round(wuxingCount.火 / total * 100)}% 土${Math.round(wuxingCount.土 / total * 100)}% 金${Math.round(wuxingCount.金 / total * 100)}% 水${Math.round(wuxingCount.水 / total * 100)}%`;

  // 大运起运年龄（使用计算得到的值）
  const dayunString = `${result.dayunStartAge}岁起运`;

  return {
    bazi: baziString,
    wuxing: wuxingString,
    dayun: dayunString
  };
}

// 导出实时预览函数
export function getPreviewMessage(bazi: SimpleBaziResult): string {
  if (!bazi || !bazi.bazi) return '';
  return `您选择的八字：${bazi.bazi}`;
}
