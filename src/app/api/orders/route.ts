import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Lunar, Solar } from 'lunar-javascript';

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

// 南半球月令对冲映射
const southernZhiMap: Record<string, string> = {
  '子': '午', '丑': '未', '寅': '申', '卯': '酉',
  '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
  '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
};

// 五行对应关系
const wuxingMap: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

// 真太阳时修正（含日期跨天处理）
function adjustTrueSolarTime(birthDateStr: string, birthTimeStr: string, longitude: number): { date: Date; hour: number; minute: number } {
  const [year, month, day] = birthDateStr.split('-').map(Number);
  const [hour, minute] = birthTimeStr.split(':').map(Number);

  // 原始分钟数
  const originalMinutes = hour * 60 + minute;

  // 真太阳时修正：(经度 - 120) * 4 分钟
  const minuteDiff = (longitude - 120) * 4;
  let adjustedMinutes = originalMinutes + minuteDiff;

  // 日期偏移
  let dayOffset = 0;

  // 跨天处理
  if (adjustedMinutes >= 1440) {
    adjustedMinutes -= 1440;
    dayOffset = 1;
  } else if (adjustedMinutes < 0) {
    adjustedMinutes += 1440;
    dayOffset = -1;
  }

  // 计算调整后的小时和分钟
  const adjustedHour = Math.floor(adjustedMinutes / 60);
  const adjustedMinute = adjustedMinutes % 60;

  // 构建新日期（应用日期偏移）
  const adjustedDate = new Date(year, month - 1, day + dayOffset, adjustedHour, adjustedMinute);

  return { date: adjustedDate, hour: adjustedHour, minute: adjustedMinute };
}

// 计算八字
function calculateBazi(birthDateStr: string, birthTimeStr: string, longitude: number, isSouthern: boolean) {
  // 1. 真太阳时修正
  const { date: adjustedDate } = adjustTrueSolarTime(birthDateStr, birthTimeStr, longitude);

  // 2. 使用 lunar-javascript 获取八字
  const solar = Solar.fromDate(adjustedDate);
  const lunar = solar.getLunar();

  // 获取四柱
  let yearGanZhi = lunar.getYearInGanZhi();      // 年柱
  let monthGanZhi = lunar.getMonthInGanZhi();    // 月柱
  let dayGanZhi = lunar.getDayInGanZhi();        // 日柱
  let hourGanZhi = lunar.getHourInGanZhi();      // 时柱

  // 3. 南半球月令对冲处理
  if (isSouthern) {
    // 月支对冲
    const monthZhi = monthGanZhi.charAt(1);
    const newMonthZhi = southernZhiMap[monthZhi] || monthZhi;
    const monthGan = monthGanZhi.charAt(0);
    monthGanZhi = monthGan + newMonthZhi;
  }

  // 4. 生成八字字符串
  const baziString = `${yearGanZhi} ${monthGanZhi} ${dayGanZhi} ${hourGanZhi}`;

  // 5. 计算五行
  const allGanZhi = yearGanZhi + monthGanZhi + dayGanZhi + hourGanZhi;
  let wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  for (const char of allGanZhi) {
    const wx = wuxingMap[char];
    if (wx) wuxingCount[wx as keyof typeof wuxingCount]++;
  }

  const total = 10; // 八字共10个字
  const wuxingString = `木${wuxingCount.木 * 10}% 火${wuxingCount.火 * 10}% 土${wuxingCount.土 * 10}% 金${wuxingCount.金 * 10}% 水${wuxingCount.水 * 10}%`;

  // 6. 计算大运（简化版：根据日干和性别）
  const dayGan = dayGanZhi.charAt(0);
  const dayIdx = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(dayGan);

  // 大运干支顺序
  const dayunGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dayunZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 简单起运计算（实际需要结合性别，这里用简化公式）
  const birthYear = adjustedDate.getFullYear();
  const startYear = birthYear + 8; // 默认8岁起运
  const dayunString = `${startYear}岁起运`;

  return {
    bazi: baziString,
    wuxing: wuxingString,
    dayun: dayunString
  };
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
  const body = await request.json();

  // 计算八字
  let baziResult = { bazi: '', wuxing: '', dayun: '' };
  try {
    baziResult = calculateBazi(
      body.birthDate,
      body.birthTime,
      body.longitude || 120,
      body.isSouthern || false
    );
    console.log('八字计算结果:', baziResult);
  } catch (err) {
    console.error('八字计算失败:', err);
  }

  // 发送到 Google Sheets（异步，不阻塞）
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
  }).then(res => {
    console.log('Google Sheets 响应状态:', res.status);
  }).catch(err => {
    console.error('Google Sheets 提交失败:', err);
  });

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
