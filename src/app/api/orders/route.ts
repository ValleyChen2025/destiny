import { NextRequest, NextResponse } from 'next/server';

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

// 内存存储（仅Vercel运行时有效）
let ordersCache: Order[] = [];

export async function GET() {
  return NextResponse.json(ordersCache);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 直接提交到 Google Sheets
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
        bazi: '',
        wuxing: '',
        dayun: '',
      }),
    }).catch(err => console.error('Google提交失败:', err));

    // 内存存储
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
      bazi: '',
      wuxing: '',
      dayun: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    ordersCache.unshift(newOrder);

    return NextResponse.json({ success: true, order: newOrder });
  } catch (e) {
    console.error('API错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const orderIndex = ordersCache.findIndex((o: Order) => o.id === id);
    if (orderIndex > -1) {
      ordersCache[orderIndex].status = status;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (e) {
    console.error('PATCH错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
