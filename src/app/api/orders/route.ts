import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ordersFile = path.join(process.cwd(), 'src/data/orders.json');

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
  const orders = readOrders();

  const newOrder: Order = {
    id: Date.now().toString(),
    ...body,
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
