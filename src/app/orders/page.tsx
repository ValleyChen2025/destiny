'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';

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

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: Order['status']) => {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  if (loading) return <div className="text-center py-16">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">📋 {t.orders.title}</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-800 rounded-xl p-6 border"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="font-bold">{order.name}</h3>
                  <p className="text-sm text-gray-500">{order.contact}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                  {t.orders[order.status as keyof typeof t.orders] || order.status}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Birth:</span> {order.birthDate} {order.birthTime}
                </div>
                <div>
                  <span className="text-gray-500">Place:</span> {order.birthPlace}
                </div>
                <div>
                  <span className="text-gray-500">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>

              {order.message && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{order.message}</p>
              )}

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(order.id, 'confirmed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    {t.orders.confirm}
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus(order.id, 'paid')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                  >
                    {t.orders.markPaid}
                  </button>
                )}
                {order.status === 'paid' && (
                  <button
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm"
                  >
                    {t.orders.markCompleted}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
