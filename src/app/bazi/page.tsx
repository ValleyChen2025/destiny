'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function BaziPage() {
  const { lang, t } = useLanguage();
  const [dateInput, setDateInput] = useState('1990-01-15');
  const [timeVal, setTimeVal] = useState(13);
  const [genderVal, setGenderVal] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // 调用Vercel API计算八字
  const calculateBazi = async () => {
    if (!dateInput) {
      setError('请输入出生日期');
      return;
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      setError('日期格式不正确');
      return;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = timeVal;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // TODO: 部署到Vercel后替换为实际URL
      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour })
      });

      if (!response.ok) throw new Error('API请求失败');

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError('计算失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.bazi.title}</h1>
          <p className="text-gray-600">{t.bazi.subtitle}</p>
        </div>

        {/* 表单 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* 日期输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.bazi.birthDate}
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 时辰选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.bazi.birthTime}
              </label>
              <select
                value={timeVal}
                onChange={(e) => setTimeVal(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>子时 23:00-00:59</option>
                <option value={3}>丑时 01:00-02:59</option>
                <option value={5}>寅时 03:00-04:59</option>
                <option value={7}>卯时 05:00-06:59</option>
                <option value={9}>辰时 07:00-08:59</option>
                <option value={11}>巳时 09:00-10:59</option>
                <option value={13}>午时 11:00-12:59</option>
                <option value={15}>未时 13:00-14:59</option>
                <option value={17}>申时 15:00-16:59</option>
                <option value={19}>酉时 17:00-18:59</option>
                <option value={21}>戌时 19:00-20:59</option>
                <option value={23}>亥时 21:00-22:59</option>
              </select>
            </div>

            {/* 性别 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.bazi.gender}
              </label>
              <select
                value={genderVal}
                onChange={(e) => setGenderVal(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>{t.bazi.male}</option>
                <option value={2}>{t.bazi.female}</option>
              </select>
            </div>
          </div>

          <button
            onClick={calculateBazi}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? t.bazi.calculating : t.bazi.calculate}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* 结果展示 */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              {result.birthday} {genderVal === 1 ? t.bazi.male : t.bazi.female}{lang === 'zh' ? '命' : ''}
            </h2>

            {/* 八字盘 */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex justify-center gap-4 flex-wrap">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">{t.bazi.yearPillar}</div>
                  <div className="text-3xl font-bold text-blue-600">{result.year}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">{t.bazi.monthPillar}</div>
                  <div className="text-3xl font-bold text-blue-600">{result.month}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">{t.bazi.dayPillar}</div>
                  <div className="text-3xl font-bold text-blue-600">{result.day}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">{t.bazi.timePillar}</div>
                  <div className="text-3xl font-bold text-blue-600">{result.time}</div>
                </div>
              </div>
            </div>

            {/* 说明 */}
            <div className="text-center text-gray-600 text-sm">
              <p>{lang === 'zh' ? '八字已精确计算，包含节气修正' : 'Bazi calculated with solar term corrections'}</p>
              <p className="mt-2">{t.bazi.complete}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
