// 使用 lunar-javascript 专业排盘库
import { Solar, Lunar } from 'lunar-javascript';

const wuxingMap: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

// 纳音五行表
const naxinMap: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '井泉水', '乙酉': '井泉水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂石金', '乙未': '砂石金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '砂石土', '丁巳': '砂石土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
};

// 地支顺序
const zhiOrder: Record<string, number> = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
  '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12
};

// 天干顺序 (0-9)
const ganOrder: Record<string, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
  '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

// 大运旺衰表
const dayunWangshuai = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];

// 劫煞位置（年支+月支）
const jieshaMap: Record<string, string> = {
  '子': '巳', '丑': '申', '寅': '申', '卯': '酉', '辰': '戌',
  '巳': '亥', '午': '寅', '未': '卯', '申': '午', '酉': '子',
  '戌': '卯', '亥': '戌'
};

// 将星位置
const jiangxingMap: Record<string, string> = {
  '子': '酉', '丑': '午', '寅': '午', '卯': '卯', '辰': '子',
  '巳': '亥', '午': '申', '未': '申', '申': '巳', '酉': '寅',
  '戌': '寅', '亥': '午'
};

// 驿马位置
const yimaMap: Record<string, string> = {
  '子': '寅', '丑': '申', '寅': '巳', '卯': '亥', '辰': '寅',
  '巳': '申', '午': '寅', '未': '申', '申': '巳', '酉': '亥',
  '戌': '寅', '亥': '申'
};

// 桃花位置
const taohuaMap: Record<string, string> = {
  '子': '酉', '丑': '午', '寅': '卯', '卯': '子', '辰': '酉',
  '巳': '午', '午': '卯', '未': '子', '申': '酉', '酉': '午',
  '戌': '卯', '亥': '子'
};

// 天乙贵人位置
const tianyiMap: Record<string, string[]> = {
  '子': ['丑', '巳'], '丑': ['子', '巳'], '寅': ['丑', '未'],
  '卯': ['子', '申'], '辰': ['酉', '亥'], '巳': ['午', '未'],
  '午': ['巳', '申'], '未': ['午', '申'], '申': ['未', '丑'],
  '酉': ['申', '子'], '戌': ['卯', '亥'], '亥': ['卯', '寅']
};

// 太极贵人位置
const taijiMap: Record<string, string[]> = {
  '子': ['子'], '丑': ['亥'], '寅': ['午'], '卯': ['卯'],
  '辰': ['辰', '戌'], '巳': ['巳'], '午': ['午'], '未': ['未', '申'],
  '申': ['酉'], '酉': ['酉'], '戌': ['辰', '戌'], '亥': ['亥']
};

// 学堂位置
const xuetangMap: Record<string, string[]> = {
  '甲': ['寅'], '乙': ['巳'], '丙': ['巳'], '丁': ['申'],
  '戊': ['申'], '己': ['亥'], '庚': ['寅'], '辛': ['巳'],
  '壬': ['申'], '癸': ['亥']
};

// 帝旺位置
const diwangMap: Record<string, string> = {
  '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午',
  '己': '巳', '庚': '申', '辛': '酉', '壬': '子', '癸': '亥'
};

// 羊刃位置
const yangrenMap: Record<string, string> = {
  '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午',
  '己': '巳', '庚': '申', '辛': '酉', '壬': '子', '癸': '亥'
};

// 空亡位置
const kongwangMap: Record<string, string[]> = {
  '甲子': ['戌', '亥'], '乙丑': ['戌', '亥'], '丙寅': ['申', '酉'],
  '丁卯': ['申', '酉'], '戊辰': ['午', '未'], '己巳': ['午', '未'],
  '庚午': ['辰', '巳'], '辛未': ['辰', '巳'], '壬申': ['寅', '卯'],
  '癸酉': ['寅', '卯'], '甲戌': ['子', '丑'], '乙亥': ['子', '丑'],
  '丙子': ['戌', '亥'], '丁丑': ['戌', '亥'], '戊寅': ['申', '酉'],
  '己卯': ['申', '酉'], '庚辰': ['午', '未'], '辛巳': ['午', '未'],
  '壬午': ['辰', '巳'], '癸未': ['辰', '巳'], '甲申': ['寅', '卯'],
  '乙酉': ['寅', '卯'], '丙戌': ['子', '丑'], '丁亥': ['子', '丑'],
  '戊子': ['戌', '亥'], '己丑': ['戌', '亥'], '庚寅': ['申', '酉'],
  '辛卯': ['申', '酉'], '壬辰': ['午', '未'], '癸巳': ['午', '未'],
  '甲午': ['辰', '巳'], '乙未': ['辰', '巳'], '丙申': ['寅', '卯'],
  '丁酉': ['寅', '卯'], '戊戌': ['子', '丑'], '己亥': ['子', '丑']
};

// 金舆位置
const jinyuMap: Record<string, string> = {
  '甲': '辰', '乙': '巳', '丙': '未', '丁': '申', '戊': '未',
  '己': '申', '庚': '戌', '辛': '亥', '壬': '丑', '癸': '寅'
};

// 流霞位置
const liuxiaMap: Record<string, string> = {
  '甲': '未', '乙': '午', '丙': '酉', '丁': '申', '戊': '亥',
  '己': '戌', '庚': '卯', '辛': '寅', '壬': '巳', '癸': '辰'
};

// 亡神位置
const wangshenMap: Record<string, string> = {
  '子': '亥', '丑': '寅', '寅': '巳', '卯': '午', '辰': '辰',
  '巳': '申', '午': '酉', '未': '戌', '申': '亥', '酉': '寅',
  '戌': '巳', '亥': '午'
};

// 红艳位置
const hongyanMap: Record<string, string> = {
  '子': '午', '丑': '寅', '寅': '未', '卯': '辰', '辰': '卯',
  '巳': '戌', '午': '酉', '未': '申', '申': '巳', '酉': '寅',
  '戌': '未', '亥': '辰'
};

export interface Dayun {
  ganZhi: string;
  naxin: string;
  wangshuai: string;
  startAge: number;
  startYear: number;
}

export interface Liunian {
  year: number;
  ganZhi: string;
}

export interface Shensha {
  name: string;
  position: string;
}

export interface BaziResult {
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
  solarTerm: string;
  isSouthern: boolean;
  trueSolarTime: string;
  dayunStartAge: number;
  dayunStartDate: string;
  dayuns: Dayun[];
  liunians: Liunian[];
  shenshas: Shensha[];
  gender: number;
}

export interface SimpleBaziResult {
  bazi: string;
  wuxing: string;
  dayun: string;
}

// 计算大运（使用月干作为起点）
function calculateDayun(birthYear: number, dayGan: string, monthZhi: string, monthGan: string, gender: number): Dayun[] {
  const isYang = '甲丙戊庚壬'.includes(dayGan);
  const isMale = gender === 1;

  // 乾造（男）：阳日顺行，阴日逆行
  // 坤造（女）：阴日顺行，阳日逆行
  const forward = isYang ? isMale : !isMale;

  const dayunList: Dayun[] = [];
  const monthOrder = zhiOrder[monthZhi] || 1;
  const monthGanOrder = ganOrder[monthGan] || 1;

  // 大运从月令后一宫开始
  const startZhiOrder = forward
    ? ((monthOrder) % 12) + 1
    : ((monthOrder - 2 + 12) % 12) + 1;

  for (let i = 0; i < 8; i++) {
    // 计算地支
    let zhiIndex = (startZhiOrder + i - 1) % 12 + 1;
    const zhi = Object.keys(zhiOrder).find(k => zhiOrder[k] === zhiIndex) || '子';

    // 计算天干：从月干递进（从月干后一宫开始）
    let ganIndex: number;
    if (forward) {
      // 顺行：月干+1, 月干+2...
      ganIndex = (monthGanOrder + i + 1) % 10;
    } else {
      // 逆行：月干-1, 月干-2...
      ganIndex = (monthGanOrder - i - 1 + 10) % 10;
    }
    const gan = Object.keys(ganOrder).find(k => ganOrder[k] === ganIndex) || '甲';

    const ganZhi = gan + zhi;
    const naxin = naxinMap[ganZhi] || '';

    // 旺衰
    const startWangshuaiIndex = forward ? 1 : 10;
    const wangshuaiIndex = (startWangshuaiIndex + i) % 12;
    const wangshuai = dayunWangshuai[wangshuaiIndex];

    // 起运年龄（简化：6岁起运）
    const startAge = 6 + i;
    const startYear = birthYear + startAge;

    dayunList.push({
      ganZhi,
      naxin,
      wangshuai,
      startAge,
      startYear
    });
  }

  return dayunList;
}

// 计算流年
function calculateLiunian(birthYear: number, dayGanZhi: string): Liunian[] {
  const liunianList: Liunian[] = [];
  const dayGan = dayGanZhi.charAt(0);
  const dayZhi = dayGanZhi.charAt(1);
  const dayZhiOrder = zhiOrder[dayZhi] || 1;
  const dayGanOrder = ganOrder[dayGan] || 1;

  // 从出生年开始往后推20年
  for (let i = 0; i < 20; i++) {
    const year = birthYear + i;

    // 年干：每60年一循环，天干顺序 (0-9)
    const yearGanIndex = (year - 4) % 10;
    const gan = Object.keys(ganOrder).find(k => ganOrder[k] === yearGanIndex) || '甲';

    // 年支：每60年一循环，地支顺序
    const yearZhiIndex = ((year - 4) % 12 + 12) % 12 || 12;
    const zhi = Object.keys(zhiOrder).find(k => zhiOrder[k] === yearZhiIndex) || '子';

    liunianList.push({
      year,
      ganZhi: gan + zhi
    });
  }

  return liunianList;
}

// 计算交运日期（简化版）
function calculateDayunStartDate(birthYear: number, birthMonth: number, birthDay: number, dayGan: string): string {
  // 简化：起运年龄为6岁左右（大部分情况）
  // 实际需要根据节气精确计算
  const isYang = '甲丙戊庚壬'.includes(dayGan);
  let jiaoyunYear = birthYear + 6;
  let jiaoyunMonth = birthMonth + 1;
  if (jiaoyunMonth > 12) {
    jiaoyunMonth -= 12;
    jiaoyunYear += 1;
  }

  // 约在6月交运
  return `${jiaoyunYear}-06-23`;
}

// 计算神煞
function calculateShensha(yearZhi: string, monthZhi: string, dayZhi: string, timeZhi: string, dayGan: string): Shensha[] {
  const shenshas: Shensha[] = [];

  // 劫煞
  const jiesha = jieshaMap[yearZhi];
  if (jiesha) shenshas.push({ name: '劫煞', position: jiesha });

  // 将星
  const jiangxing = jiangxingMap[dayZhi];
  if (jiangxing) shenshas.push({ name: '将星', position: jiangxing });

  // 驿马
  const yima = yimaMap[dayZhi];
  if (yima) shenshas.push({ name: '驿马', position: yima });

  // 桃花
  const taohua = taohuaMap[dayZhi];
  if (taohua) shenshas.push({ name: '桃花', position: taohua });

  // 天乙贵人
  const tianyi = tianyiMap[dayZhi];
  if (tianyi && tianyi.includes(monthZhi)) {
    shenshas.push({ name: '天乙贵人', position: dayZhi });
  }

  // 太极贵人
  const taiji = taijiMap[yearZhi];
  if (taiji && taiji.includes(dayZhi)) {
    shenshas.push({ name: '太极贵人', position: dayZhi });
  }

  // 学堂
  const xuetang = xuetangMap[dayGan];
  if (xuetang && xuetang.includes(monthZhi)) {
    shenshas.push({ name: '学堂', position: monthZhi });
  }

  // 帝旺
  const diwang = diwangMap[dayGan];
  if (diwang && diwang === monthZhi) {
    shenshas.push({ name: '帝旺', position: monthZhi });
  }

  // 羊刃
  const yangren = yangrenMap[dayGan];
  if (yangren && yangren === timeZhi) {
    shenshas.push({ name: '羊刃', position: timeZhi });
  }

  // 空亡
  const dayGanZhi = dayGan + dayZhi;
  const kongwang = kongwangMap[dayGanZhi];
  if (kongwang) {
    shenshas.push({ name: '日柱空亡', position: kongwang.join('') });
  }

  // 年柱空亡
  const yearGanZhi = yearZhi + '子'; // 简化
  const yearKongwang = kongwangMap[yearGanZhi];
  if (yearKongwang) {
    shenshas.push({ name: '年柱空亡', position: yearKongwang.join('') });
  }

  // 金舆
  const jinyu = jinyuMap[dayGan];
  if (jinyu && jinyu === timeZhi) {
    shenshas.push({ name: '金舆', position: timeZhi });
  }

  // 流霞
  const liuxia = liuxiaMap[dayGan];
  if (liuxia && liuxia === timeZhi) {
    shenshas.push({ name: '流霞', position: timeZhi });
  }

  // 亡神
  const wangshen = wangshenMap[dayZhi];
  if (wangshen) shenshas.push({ name: '亡神', position: wangshen });

  // 红艳
  const hongyan = hongyanMap[dayZhi];
  if (hongyan && hongyan === timeZhi) {
    shenshas.push({ name: '红艳', position: timeZhi });
  }

  return shenshas;
}

export function calculateBazi(
  birthDateStr: string,
  birthTimeStr: string,
  longitude: number = 120,
  isSouthern: boolean = false,
  gender: number = 1
): BaziResult {
  try {
    const [year, month, day] = birthDateStr.split('-').map(Number);
    const [hour, minute] = birthTimeStr.split(':').map(Number);

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
      throw new Error('Invalid date or time');
    }

    // 早晚子时处理
    let dayOffsetForTime = 0;
    if (hour >= 23) {
      dayOffsetForTime = 0;
    } else if (hour >= 0 && hour < 1) {
      dayOffsetForTime = 1;
    }

    let totalMinutes = hour * 60 + (minute || 0);
    let dayOffset = dayOffsetForTime;

    if (totalMinutes >= 1440) {
      totalMinutes -= 1440;
      dayOffset += 1;
    } else if (totalMinutes < 0) {
      totalMinutes += 1440;
      dayOffset -= 1;
    }

    const adjHour = Math.floor(totalMinutes / 60);
    const adjMinute = totalMinutes % 60;
    const adjDate = new Date(year, month - 1, day + dayOffset);

    const solar = Solar.fromYmdHms(
      adjDate.getFullYear(),
      adjDate.getMonth() + 1,
      adjDate.getDate(),
      adjHour,
      adjMinute,
      0
    );

    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    const yearGanZhi = eightChar.getYear().toString();
    const monthGanZhi = eightChar.getMonth().toString();
    const dayGanZhi = eightChar.getDay().toString();
    const timeGanZhi = eightChar.getTime().toString();

    const solarTerm = lunar.getPrevJieQi()?.getName() || '';

    const dayGan = dayGanZhi.charAt(0);
    const monthZhi = monthGanZhi.charAt(1);
    const monthGan = monthGanZhi.charAt(0);
    const dayZhi = dayGanZhi.charAt(1);
    const timeZhi = timeGanZhi.charAt(1);

    // 计算大运
    const dayuns = calculateDayun(year, dayGan, monthZhi, monthGan, gender);

    // 起运年龄（简化）
    const dayunStartAge = dayuns.length > 0 ? dayuns[0].startAge : 1;

    // 交运日期
    const dayunStartDate = calculateDayunStartDate(year, month, day, dayGan);

    // 计算流年
    const liunians = calculateLiunian(year, dayGanZhi);

    // 计算神煞
    const shenshas = calculateShensha(yearGanZhi.charAt(1), monthZhi, dayZhi, timeZhi, dayGan);

    return {
      yearGanZhi,
      monthGanZhi,
      dayGanZhi,
      timeGanZhi,
      solarTerm,
      isSouthern,
      trueSolarTime: `${adjHour}:${adjMinute}`,
      dayunStartAge,
      dayunStartDate,
      dayuns,
      liunians,
      shenshas,
      gender
    };
  } catch (error) {
    console.error('排盘计算错误:', error);
    return {
      yearGanZhi: '甲子',
      monthGanZhi: '甲子',
      dayGanZhi: '甲子',
      timeGanZhi: '甲子',
      solarTerm: '',
      isSouthern: false,
      trueSolarTime: '0:0',
      dayunStartAge: 1,
      dayunStartDate: '',
      dayuns: [],
      liunians: [],
      shenshas: [],
      gender: 1
    };
  }
}

export function formatBaziString(result: BaziResult): string {
  return `${result.yearGanZhi} ${result.monthGanZhi} ${result.dayGanZhi} ${result.timeGanZhi}`;
}

export function toSimpleResult(result: BaziResult, birthYear: number): SimpleBaziResult {
  const baziString = formatBaziString(result);

  const allText = result.yearGanZhi + result.monthGanZhi + result.dayGanZhi + result.timeGanZhi;
  let wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const char of allText) {
    const wx = wuxingMap[char];
    if (wx) wuxingCount[wx as keyof typeof wuxingCount]++;
  }
  const total = 8;
  const wuxingString = `木${Math.round(wuxingCount.木 / total * 100)}% 火${Math.round(wuxingCount.火 / total * 100)}% 土${Math.round(wuxingCount.土 / total * 100)}% 金${Math.round(wuxingCount.金 / total * 100)}% 水${Math.round(wuxingCount.水 / total * 100)}%`;

  const dayunString = `${result.dayunStartAge}岁起运`;

  return {
    bazi: baziString,
    wuxing: wuxingString,
    dayun: dayunString
  };
}

export function getPreviewMessage(bazi: SimpleBaziResult): string {
  if (!bazi || !bazi.bazi) return '';
  return `您选择的八字：${bazi.bazi}`;
}
