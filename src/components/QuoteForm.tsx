'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { calculateBazi, toSimpleResult, SimpleBaziResult } from '@/utils/baziEngine';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// 城市模板 - 全球主要城市
const cityTemplates = [
  // 中国
  { name: '北京', country: 'CN', longitude: 116.4, isSouthern: false },
  { name: '上海', country: 'CN', longitude: 121.5, isSouthern: false },
  { name: '广州', country: 'CN', longitude: 113.2, isSouthern: false },
  { name: '深圳', country: 'CN', longitude: 114.1, isSouthern: false },
  { name: '成都', country: 'CN', longitude: 104.1, isSouthern: false },
  { name: '武汉', country: 'CN', longitude: 114.3, isSouthern: false },
  { name: '杭州', country: 'CN', longitude: 120.2, isSouthern: false },
  { name: '香港', country: 'CN', longitude: 114.2, isSouthern: false },
  { name: '台北', country: 'CN', longitude: 121.5, isSouthern: false },
  // 美国
  { name: 'New York', country: 'US', longitude: -74.0, isSouthern: false },
  { name: 'Los Angeles', country: 'US', longitude: -118.2, isSouthern: false },
  { name: 'San Francisco', country: 'US', longitude: -122.4, isSouthern: false },
  { name: 'Chicago', country: 'US', longitude: -87.6, isSouthern: false },
  // 英国
  { name: 'London', country: 'GB', longitude: -0.1, isSouthern: false },
  // 加拿大
  { name: 'Toronto', country: 'CA', longitude: -79.4, isSouthern: false },
  { name: 'Vancouver', country: 'CA', longitude: -123.1, isSouthern: false },
  // 澳大利亚
  { name: 'Sydney', country: 'AU', longitude: 151.2, isSouthern: true },
  { name: 'Melbourne', country: 'AU', longitude: 144.9, isSouthern: true },
  // 日本
  { name: 'Tokyo', country: 'JP', longitude: 139.7, isSouthern: false },
  { name: 'Osaka', country: 'JP', longitude: 135.5, isSouthern: false },
  // 韩国
  { name: 'Seoul', country: 'KR', longitude: 126.9, isSouthern: false },
  // 新马泰
  { name: 'Singapore', country: 'SG', longitude: 103.8, isSouthern: false },
  { name: 'Bangkok', country: 'TH', longitude: 100.5, isSouthern: false },
  // 欧洲
  { name: 'Paris', country: 'FR', longitude: 2.3, isSouthern: false },
  { name: 'Berlin', country: 'DE', longitude: 13.4, isSouthern: false },
  { name: 'Rome', country: 'IT', longitude: 12.5, isSouthern: false },
  // 其他
  { name: 'Dubai', country: 'AE', longitude: 55.3, isSouthern: false },
];

// 生成 Destiny ID
function generateDestinyId(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DZ${dateStr}${random}`;
}

export default function QuoteForm() {
  const { t, lang } = useLanguage();
  const isZh = lang === 'zh';
  const [showPayment, setShowPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [longitude, setLongitude] = useState<number>(116.4);
  const [isSouthern, setIsSouthern] = useState<boolean>(false);
  const [baziInfo, setBaziInfo] = useState<SimpleBaziResult | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [enableTrueSolarTime, setEnableTrueSolarTime] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [destinyId, setDestinyId] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    contact: string;
  } | null>(null);

  // PayPal Client ID - check if configured
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const isPayPalConfigured = paypalClientId.length > 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 计算八字 - 用户输入的是当地时间
  // 启用真太阳时 = 不做经度校正（用户输入的就是真太阳时）
  // 不启用真太阳时 = 假设用户输入的是北京时间（近似处理）
  const calculateBaziResult = (useTrueSolar: boolean) => {
    if (!birthDate || !birthTime || !selectedCity) return null;

    try {
      // useTrueSolar = true: 直接用用户输入的时间（真太阳时）
      // useTrueSolar = false: 传入120°作为经度（近似为北京时间）
      const effectiveLongitude = useTrueSolar ? longitude : 120;
      const calculated = calculateBazi(birthDate, birthTime, effectiveLongitude, isSouthern);
      const year = new Date(birthDate).getFullYear();
      return toSimpleResult(calculated, year);
    } catch (err) {
      console.error('排盘失败:', err);
      return null;
    }
  };

  const handleDateTimeChange = () => {
    // 不再在填表页实时计算八字，只在支付后计算
  };

  const handleCitySelect = (cityName: string) => {
    const city = cityTemplates.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city.name);
      setCitySearch(city.name);
      setLongitude(city.longitude);
      setIsSouthern(city.isSouthern);
    }
  };

  // 验证表单并进入支付流程
  const handleProceedToPay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formDataObj = new FormData(e.currentTarget);
    const name = formDataObj.get('name') as string;
    const contact = formDataObj.get('contact') as string;

    if (!name || !contact) {
      setError(isZh ? '请填写姓名和邮箱' : 'Please fill in name and email');
      return;
    }

    if (!birthDate) {
      setError(isZh ? '请选择出生日期' : 'Please select birth date');
      return;
    }

    if (!birthTime) {
      setError(isZh ? '请选择出生时间' : 'Please select birth time');
      return;
    }

    if (!selectedCity) {
      setError(isZh ? '请选择出生城市' : 'Please select birth city');
      return;
    }

    if (!isPayPalConfigured) {
      setError(isZh ? '支付系统暂不可用，请稍后再试' : 'Payment system unavailable, please try later');
      return;
    }

    // 确保八字已计算（根据是否启用真太阳时）
    const baziResult = calculateBaziResult(enableTrueSolarTime);
    if (!baziResult) {
      setError(isZh ? '请先选择出生城市以计算八字' : 'Please select birth city to calculate bazi');
      return;
    }
    setBaziInfo(baziResult);

    setFormData({ name, contact });
    setShowPayment(true);
    setError('');
  };

  // 提交订单到后端
  const submitOrder = async (paymentId?: string) => {
    if (!baziInfo || !formData || !birthDate || !birthTime) return;

    const orderData = {
      name: formData.name,
      contact: formData.contact,
      birthDate: birthDate,
      birthTime: birthTime,
      birthPlace: selectedCity,
      message: '',
      lang: lang,
      longitude: longitude,
      isSouthern: isSouthern,
      bazi: baziInfo.bazi,
      wuxing: baziInfo.wuxing,
      dayun: baziInfo.dayun,
      destinyId: destinyId,
      paymentId: paymentId || '',
      paid: true,
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
    } catch (err) {
      console.error('提交订单失败:', err);
    }
  };

  // 支付成功处理
  const handlePaymentSuccess = async (paymentId: string) => {
    setProcessingPayment(true);
    try {
      // 生成 Destiny ID
      const newDestinyId = generateDestinyId();
      setDestinyId(newDestinyId);

      // 提交订单到后端
      await submitOrder(paymentId);

      // 显示结果
      setIsPaid(true);
    } catch (err) {
      setError(isZh ? '支付处理失败' : 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  // 支付成功显示结果
  if (isPaid && baziInfo) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">🎯</div>
        <h2 className="text-xl font-bold mb-2">
          {isZh ? '您的深度命理报告已解锁！' : 'Your Destiny Report is Unlocked!'}
        </h2>

        {/* Destiny ID */}
        <div className="my-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg inline-block">
          <p className="text-xs text-gray-500 mb-1">
            {isZh ? '您的查询码' : 'Your Destiny ID'}
          </p>
          <p className="text-2xl font-bold text-amber-600 font-mono">{destinyId}</p>
        </div>

        {/* 八字信息 */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-left max-w-sm mx-auto">
          <p className="text-lg font-semibold text-center mb-2">{baziInfo.bazi}</p>
          <p className="text-sm text-gray-600">{baziInfo.wuxing}</p>
          <p className="text-sm text-gray-600">{baziInfo.dayun}</p>
        </div>

        <p className="text-gray-500 mt-4 text-sm">
          {isZh ? '报告已发送到您的邮箱' : 'Report sent to your email'}
        </p>

        <p className="text-gray-400 mt-2 text-xs">
          {isZh ? '请保存查询码以便日后查询' : 'Please save your Destiny ID for future queries'}
        </p>
      </div>
    );
  }

  // 支付界面
  if (showPayment) {
    return (
      <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'USD' }}>
        <div className="max-w-sm mx-auto space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold mb-1">
              {isZh ? '完成支付' : 'Complete Payment'}
            </h2>
            <p className="text-sm text-gray-500">
              {isZh ? '支付 $0.99 获取自动生成命理报告' : 'Pay $0.99 for Personalized Destiny Report'}
            </p>
          </div>

          {/* 订单摘要 */}
          <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">
            <p><span className="text-gray-500">{isZh ? '称呼' : 'Name'}:</span> {formData?.name}</p>
            <p><span className="text-gray-500">{isZh ? '邮箱' : 'Email'}:</span> {formData?.contact}</p>
            <p><span className="text-gray-500">{isZh ? '出生' : 'Birth'}:</span> {birthDate} {birthTime} @ {selectedCity}</p>
            <p><span className="text-gray-500">{isZh ? '八字' : 'Bazi'}:</span> {baziInfo?.bazi || '---'}</p>
            {baziInfo && (
              <>
                <p><span className="text-gray-500">{isZh ? '五行' : 'Wuxing'}:</span> {baziInfo.wuxing}</p>
                <p><span className="text-gray-500">{isZh ? '大运' : 'Dayun'}:</span> {baziInfo.dayun}</p>
              </>
            )}
          </div>

          {processingPayment ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">
                {isZh ? '正在处理支付...' : 'Processing payment...'}
              </p>
            </div>
          ) : (
            <PayPalButtons
              style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: 'CAPTURE',
                  purchase_units: [{
                    amount: { currency_code: 'USD', value: '0.99' },
                    description: isZh ? '专业八字详批报告' : 'Professional Bazi Analysis Report',
                  }],
                });
              }}
              onApprove={async (data, actions) => {
                if (actions.order) {
                  const capture = await actions.order.capture();
                  if (capture.status === 'COMPLETED') {
                    handlePaymentSuccess(capture.id || '');
                  }
                }
              }}
              onError={(err) => {
                console.error('PayPal Error:', err);
                setError(isZh ? '支付失败，请重试' : 'Payment failed, please try again');
                setShowPayment(false);
              }}
              onCancel={() => {
                setShowPayment(false);
              }}
            />
          )}

          {error && (
            <div className="p-2 bg-red-50 text-red-600 rounded text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={() => setShowPayment(false)}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            ← {isZh ? '返回填写表单' : 'Back to form'}
          </button>
        </div>
      </PayPalScriptProvider>
    );
  }

  if (!mounted) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <form onSubmit={handleProceedToPay} className="max-w-sm mx-auto space-y-3">
      {error && (
        <div className="p-2 bg-red-50 text-red-600 rounded text-sm">
          {error}
        </div>
      )}

      {/* 姓名 - 匿名化 */}
      <div>
        <label className="block text-xs font-medium mb-1">
          {isZh ? '称呼 (可用化名)' : 'Name (Nickname OK)'}
        </label>
        <input
          name="name"
          placeholder={isZh ? '只需一个称呼' : 'Any name works'}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 邮箱 */}
      <div>
        <label className="block text-xs font-medium mb-1">
          {isZh ? '接收结果的邮箱' : 'Email (For Result)'}
        </label>
        <input
          name="contact"
          type="email"
          placeholder="email@example.com"
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 出生日期和时间 - 同一行 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 出生日期 */}
        <div>
          <label className="block text-xs font-medium mb-1">
            {isZh ? '出生日期' : 'Birth Date'}
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 出生时间 - 简洁数字输入 */}
        <div>
          <label className="block text-xs font-medium mb-1">
            {isZh ? '出生时间' : 'Birth Time'}
          </label>
          <div className="flex gap-1">
            {/* 小时 */}
            <input
              type="number"
              min="0"
              max="24"
              value={birthTime.split(':')[0]}
              onChange={(e) => {
                let h = parseInt(e.target.value) || 0;
                if (h > 24) h = 24;
                if (h < 0) h = 0;
                const m = birthTime.split(':')[1] || '00';
                setBirthTime(`${h.toString().padStart(2, '0')}:${m}`);
              }}
              onFocus={(e) => e.target.select()}
              placeholder={isZh ? '时' : 'H'}
              className="flex-1 px-2 py-2 text-sm text-center rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500"
            />
            <span className="self-center text-gray-400">:</span>
            {/* 分钟 */}
            <input
              type="number"
              min="0"
              max="59"
              value={birthTime.split(':')[1]}
              onChange={(e) => {
                let m = parseInt(e.target.value) || 0;
                if (m > 59) m = 59;
                if (m < 0) m = 0;
                const h = birthTime.split(':')[0] || '00';
                setBirthTime(`${h}:${m.toString().padStart(2, '0')}`);
              }}
              onFocus={(e) => e.target.select()}
              placeholder={isZh ? '分' : 'M'}
              className="flex-1 px-2 py-2 text-sm text-center rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 城市搜索 */}
      <div>
        <label className="block text-xs font-medium mb-1">
          {isZh ? '出生城市' : 'Birth City'}
        </label>
        <input
          list="city-list"
          value={citySearch}
          onChange={(e) => {
            setCitySearch(e.target.value);
            const city = cityTemplates.find(c => c.name === e.target.value);
            if (city) handleCitySelect(city.name);
          }}
          placeholder={isZh ? '搜索城市...' : 'Search city...'}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500"
        />
        <datalist id="city-list">
          {cityTemplates.map((city) => (
            <option key={city.name} value={city.name} />
          ))}
        </datalist>
      </div>

      {/* 真太阳时校正选项 - 城市选择后启用 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enableTrueSolarTime"
          checked={enableTrueSolarTime}
          disabled={!selectedCity}
          onChange={(e) => setEnableTrueSolarTime(e.target.checked)}
          className="w-4 h-4 text-blue-600 disabled:opacity-50"
        />
        <label htmlFor="enableTrueSolarTime" className={`text-sm ${selectedCity ? 'text-gray-600' : 'text-gray-400'}`}>
          {isZh ? '启用真太阳时校正' : 'Enable True Solar Time correction'}
        </label>
      </div>
      {selectedCity && enableTrueSolarTime && (
        <p className="text-xs text-gray-500 -mt-2">
          {isZh ? `${selectedCity} (经度 ${longitude}°E)` : `${selectedCity} (longitude ${longitude}°E)`}
        </p>
      )}
      {selectedCity && !enableTrueSolarTime && (
        <p className="text-xs text-gray-400 -mt-2">
          {isZh ? `使用北京时间计算` : `Using Beijing Time calculation`}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
      >
        {loading ? (isZh ? '处理中...' : 'Processing...') : (isZh ? '在线立即批算' : 'Get Analysis Now')}
      </button>

      <p className="text-center text-xs text-gray-500">
        {isZh ? '支付后立即获取详细命理报告' : 'Pay now to get instant destiny report'}
      </p>
    </form>
  );
}
