import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ordersFile = path.join(process.cwd(), 'src/data/orders.json');

// Google Apps Script API URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZ9YHlJE_It6JfRLDQVXkXURtdNqN4t0XQx0JA7reLPclRCEKw7nwbVkODoPBxSoEP/exec';

interface Order {
  id: string;
  name: string;
  contact: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  message: string;
  lang: string;
  longitude: number;
  isSouthern: boolean;
  bazi?: string;
  wuxing?: string;
  dayun?: string;
  status: 'pending' | 'confirmed' | 'paid' | 'completed';
  createdAt: string;
}

// 天干地支
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 南半球月令对冲映射
const southernZhiMap: Record<string, string> = {
  '子': '午', '丑': '未', '寅': '申', '卯': '酉',
  '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
  '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
};

// 五行对应
const wuxingMap: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

// 计算年柱
function getYearGanZhi(year: number): string {
  const diff = year - 1984;
  return GAN[(diff + 10) % 10] + ZHI[(diff + 12) % 12];
}

// 计算日柱（基于2000年1月1日=庚辰）
function getDayGanZhi(date: Date): string {
  // 创建UTC日期来避免时区问题
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  // 使用 UTC 时间创建基准日期
  const base = new Date(Date.UTC(2000, 0, 1));
  const target = new Date(Date.UTC(year, month - 1, day));

  const diff = Math.floor((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  const ganIdx = (diff + 6) % 10;  // 庚=6, index=6
  const zhiIdx = (diff + 4) % 12;  // 辰=4, index=4

  console.log('日柱计算:', { year, month, day, diff, ganIdx, zhiIdx });

  if (ganIdx < 0 || ganIdx >= GAN.length || zhiIdx < 0 || zhiIdx >= ZHI.length) {
    return '甲子'; // 默认值
  }

  return GAN[ganIdx] + ZHI[zhiIdx];
}

// 计算时柱
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

// 计算时干
function getTimeGan(dayGan: string, timeZhi: string): string {
  const dayGanIdx = GAN.indexOf(dayGan);
  const zhiIdx = ZHI.indexOf(timeZhi);
  const offset = [0, 0, 2, 2, 4, 4, 6, 6, 8, 8][dayGanIdx] || 0;
  return GAN[(offset + zhiIdx) % 10];
}

// 获取月支（简化版，忽略精确节气）
function getMonthZhi(month: number): string {
  const map = ['', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  return map[month] || '寅';
}

// 计算月干
function getMonthGan(yearGan: string, month: number): string {
  const yearGanIdx = GAN.indexOf(yearGan);
  if (yearGanIdx < 0) return '甲';
  return GAN[(yearGanIdx * 2 + month - 1) % 10];
}

// 真太阳时修正（含日期跨天处理）
function adjustTrueSolarTime(birthDateStr: string, birthTimeStr: string, longitude: number): { date: Date; hour: number; minute: number } {
  // 处理中文冒号
  const normalizedTime = birthTimeStr.replace('：', ':');
  const dateParts = birthDateStr.split('-').map(Number);
  if (dateParts.some(isNaN)) {
    throw new Error(`Invalid date: ${birthDateStr}`);
  }
  const [year, month, day] = dateParts;

  const timeParts = normalizedTime.split(':').map(Number);
  if (timeParts.length < 2 || timeParts.some(isNaN)) {
    throw new Error(`Invalid time: ${birthTimeStr}`);
  }
  const [hour, minute] = timeParts;

  const originalMinutes = hour * 60 + minute;
  const minuteDiff = (longitude - 120) * 4;
  let adjustedMinutes = originalMinutes + minuteDiff;
  let dayOffset = 0;

  if (adjustedMinutes >= 1440) {
    adjustedMinutes -= 1440;
    dayOffset = 1;
  } else if (adjustedMinutes < 0) {
    adjustedMinutes += 1440;
    dayOffset = -1;
  }

  const adjustedHour = Math.floor(adjustedMinutes / 60);
  const adjustedMinute = adjustedMinutes % 60;
  const adjustedDate = new Date(year, month - 1, day + dayOffset, adjustedHour, adjustedMinute);

  return { date: adjustedDate, hour: adjustedHour, minute: adjustedMinute };
}

// 计算八字（纯JS版）
function calculateBazi(birthDateStr: string, birthTimeStr: string, longitude: number, isSouthern: boolean) {
  try {
    const { date: adjustedDate, hour } = adjustTrueSolarTime(birthDateStr, birthTimeStr, longitude);

    console.log('调整后日期:', adjustedDate, '小时:', hour);

    if (!adjustedDate || isNaN(adjustedDate.getTime())) {
      throw new Error('Invalid adjusted date');
    }

    const year = adjustedDate.getFullYear();
    const month = adjustedDate.getMonth() + 1;

    // 年柱
    let yearGanZhi = getYearGanZhi(year);

    // 月柱
    const monthZhi = getMonthZhi(month);
    const monthGan = getMonthGan(yearGanZhi.charAt(0), month);
    let monthGanZhi = monthGan + monthZhi;

    // 日柱
    const dayGanZhi = getDayGanZhi(adjustedDate);
    if (!dayGanZhi) {
      throw new Error('Failed to calculate day gan zhi');
    }

    // 时柱
    const timeZhi = getTimeZhi(hour);
    const timeGan = getTimeGan(dayGanZhi.charAt(0), timeZhi);
    const hourGanZhi = timeGan + timeZhi;

    // 南半球月令对冲
    if (isSouthern) {
      const newMonthZhi = southernZhiMap[monthZhi] || monthZhi;
      monthGanZhi = monthGan + newMonthZhi;
    }

    // 八字字符串
    const baziString = `${yearGanZhi} ${monthGanZhi} ${dayGanZhi} ${hourGanZhi}`;

    // 五行统计
    const allText = yearGanZhi + monthGanZhi + dayGanZhi + hourGanZhi;
    let wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    for (const char of allText) {
      const wx = wuxingMap[char];
      if (wx) wuxingCount[wx as keyof typeof wuxingCount]++;
    }
    const wuxingString = `木${wuxingCount.木 * 10}% 火${wuxingCount.火 * 10}% 土${wuxingCount.土 * 10}% 金${wuxingCount.金 * 10}% 水${wuxingCount.水 * 10}%`;

    // 大运
    const startYear = year + 8;
    const dayunString = `${startYear}岁起运`;

    return {
      bazi: baziString,
      wuxing: wuxingString,
      dayun: dayunString
    };
  } catch (e) {
    console.error('八字计算错误:', e);
    return { bazi: '计算失败', wuxing: '', dayun: '' };
  }
}

function readOrders(): Order[] {
  try {
    if (fs.existsSync(ordersFile)) {
      const data = fs.readFileSync(ordersFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

function writeOrders(orders: Order[]) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

export async function GET() {
  const orders = readOrders();
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let baziResult = { bazi: '', wuxing: '', dayun: '' };
    try {
      baziResult = calculateBazi(
        body.birthDate,
        body.birthTime,
        body.longitude || 120,
        body.isSouthern || false
      );
    } catch (err) {
      console.error('八字计算失败:', err);
    }

    // 发送到 Google Sheets
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: new URLSearchParams({
        name: body.name || '',
        contact: body.contact || '',
        birthdate: body.birthDate || '',
        birthtime: body.birthTime || '',
        birthplace: body.birthPlace || '',
        note: body.message || '',
        language: body.lang || 'zh',
        longitude: String(body.longitude || 120),
        is_southern: String(body.isSouthern || false),
        bazi: baziResult.bazi,
        wuxing: baziResult.wuxing,
        dayun: baziResult.dayun,
      }),
    }).catch(err => console.error('Google提交失败:', err));

    // 本地保存
    const orders = readOrders();
    const newOrder: Order = {
      id: Date.now().toString(),
      name: body.name,
      contact: body.contact,
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthPlace: body.birthPlace,
      message: body.message,
      lang: body.lang,
      longitude: body.longitude || 120,
      isSouthern: body.isSouthern || false,
      bazi: baziResult.bazi,
      wuxing: baziResult.wuxing,
      dayun: baziResult.dayun,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    writeOrders(orders);

    return NextResponse.json({ success: true, order: newOrder });
  } catch (e) {
    console.error('API错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body;
  const orders = readOrders();

  const orderIndex = orders.findIndex((o: Order) => o.id === id);
  if (orderIndex > -1) {
    orders[orderIndex].status = status;
    writeOrders(orders);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Order not found' }, { status: 404 });
}
