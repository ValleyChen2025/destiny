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
  const [selectedDayun, setSelectedDayun] = useState<number | null>(null);

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
    setSelectedDayun(null);

    try {
      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour, gender: genderVal })
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.bazi.title}</h1>
          <p className="text-gray-600">{t.bazi.subtitle}</p>
        </div>

        {/* 表单 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.bazi.birthDate}
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.bazi.birthTime}
              </label>
              <select
                value={timeVal}
                onChange={(e) => setTimeVal(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value={23}>子时(晚) 23:00-00:59</option>
                <option value={0}>子时(早) 00:00-00:59</option>
                <option value={1}>丑时 01:00-02:59</option>
                <option value={3}>寅时 03:00-04:59</option>
                <option value={5}>卯时 05:00-06:59</option>
                <option value={7}>辰时 07:00-08:59</option>
                <option value={9}>巳时 09:00-10:59</option>
                <option value={11}>午时 11:00-12:59</option>
                <option value={13}>未时 13:00-14:59</option>
                <option value={15}>申时 15:00-16:59</option>
                <option value={17}>酉时 17:00-18:59</option>
                <option value={19}>戌时 19:00-20:59</option>
                <option value={21}>亥时 21:00-22:59</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.bazi.gender}
              </label>
              <select
                value={genderVal}
                onChange={(e) => setGenderVal(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value={1}>{t.bazi.male}</option>
                <option value={2}>{t.bazi.female}</option>
              </select>
            </div>
          </div>

          <button
            onClick={calculateBazi}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
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
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-center mb-4">
                {result.birthday} {genderVal === 1 ? t.bazi.male : t.bazi.female}{lang === 'zh' ? '命' : ''}
              </h2>

              {/* 四柱 + 神煞十神支藏 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-center gap-2 flex-wrap">
                  <div className="text-center px-3">
                    <div className="text-xs text-gray-500">{t.bazi.yearPillar}</div>
                    <div className="text-2xl font-bold text-blue-600">{result.year}</div>
                    <div className="text-xs text-purple-600">{result.yearShichen}</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="text-xs text-gray-500">{t.bazi.monthPillar}</div>
                    <div className="text-2xl font-bold text-blue-600">{result.month}</div>
                    <div className="text-xs text-purple-600">{result.monthShichen}</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="text-xs text-gray-500">{t.bazi.dayPillar}</div>
                    <div className="text-2xl font-bold text-blue-600">{result.day}</div>
                    <div className="text-xs text-purple-600">{result.dayShichen}</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="text-xs text-gray-500">{t.bazi.timePillar}</div>
                    <div className="text-2xl font-bold text-blue-600">{result.time}</div>
                    <div className="text-xs text-purple-600">{result.timeShichen}</div>
                  </div>
                </div>

                {/* 神煞 */}
                {result.shenshas && result.shenshas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">{lang === 'zh' ? '神煞' : 'Shensha'}</h3>
                    <div className="flex flex-wrap gap-1">
                      {result.shenshas.map((sha: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          {sha.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-gray-500 text-xs">
                {result.solarTerm && <span className="mr-2">{result.solarTerm}</span>}
                {lang === 'zh' ? '八字已精确计算' : 'Bazi calculated with solar terms'}
              </div>
            </div>

            {/* 大运 - 横向排列 + 十神 */}
            {result.dayuns && result.dayuns.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {lang === 'zh' ? '大运' : 'Dayun'}
                </h3>
                {/* 横向滚动大运卡片 */}
                <div className="flex overflow-x-auto gap-2 pb-2 -mb-2">
                  {result.dayuns.map((dayun: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDayun(selectedDayun === idx ? null : idx)}
                      className={`
                        flex-shrink-0 p-3 rounded-lg cursor-pointer transition w-24
                        ${selectedDayun === idx ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'}
                      `}
                    >
                      <div className="text-sm font-bold text-blue-600">{dayun.ganZhi}</div>
                      <div className="text-xs text-green-600">{dayun.shishen}</div>
                      <div className="text-xs text-gray-400">{dayun.startAge}{lang === 'zh' ? '岁' : 'yo'}</div>
                    </div>
                  ))}
                </div>

                {/* 选中大运的流年矩阵 - 横向滚动 */}
                {selectedDayun !== null && result.dayuns[selectedDayun] && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <h4 className="font-bold text-green-700 mb-2 text-sm">
                      {result.dayuns[selectedDayun].ganZhi} {lang === 'zh' ? '流年' : 'Liunian'}
                    </h4>
                    {(() => {
                      const filteredLiunians = result.liunians && result.liunians
                        .filter((ln: any) => ln.year >= result.dayuns[selectedDayun].startYear && ln.year < result.dayuns[selectedDayun].startYear + 10);
                      if (!filteredLiunians || filteredLiunians.length === 0) return null;
                      return (
                        <>
                          <div className="flex overflow-x-auto gap-1 mb-1 pb-1">
                            {filteredLiunians.map((ln: any, i: number) => (
                              <div key={i} className="flex-shrink-0 w-10 text-center text-xs font-bold text-green-700">{ln.ganZhi}</div>
                            ))}
                          </div>
                          <div className="flex overflow-x-auto gap-1">
                            {filteredLiunians.map((ln: any, i: number) => (
                              <div key={i} className="flex-shrink-0 w-10 text-center text-xs text-gray-500">{ln.year}</div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* 流年总表 - 横向滚动 */}
            {result.liunians && result.liunians.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {lang === 'zh' ? '流年总表' : 'Liunian'}
                </h3>
                {(() => {
                  const liunians = result.liunians.slice(0, 30);
                  return (
                    <div className="overflow-x-auto">
                      <div className="flex gap-1 mb-1">
                        {liunians.map((ln: any, i: number) => (
                          <div key={i} className="flex-shrink-0 w-10 text-center text-xs font-bold text-blue-600">{ln.ganZhi}</div>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {liunians.map((ln: any, i: number) => (
                          <div key={i} className="flex-shrink-0 w-10 text-center text-xs text-gray-400">{ln.year}</div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
