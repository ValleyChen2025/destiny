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
  status: 'pending' | 'confirmed' | 'paid' | 'completed';
  createdAt: string;
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

  // 异步发送到 Google Sheets（不阻塞主流程）
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
    }),
  }).then(res => {
    console.log('Google Sheets 响应状态:', res.status);
  }).catch(err => {
    console.error('Google Sheets 提交失败（后台）:', err);
  });

  // 本地保存订单（保证成功）
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
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  writeOrders(orders);

  // 无论 Google 返回什么，都返回成功给前端
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
