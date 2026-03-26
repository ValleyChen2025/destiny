'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function FortunePage() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'bazi' | 'calendar'>('bazi');

  // Bazi state
  const [dateInput, setDateInput] = useState('1990-01-15');
  const [timeVal, setTimeVal] = useState(13);
  const [genderVal, setGenderVal] = useState(1);
  const [loading, setLoading] = useState(false);
  const [baziResult, setBaziResult] = useState<any>(null);
  const [baziError, setBaziError] = useState('');

  // Calendar state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const weekDays = lang === 'zh'
    ? ['一', '二', '三', '四', '五', '六', '日']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // 农历数据
  const lunarMonths = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
  const lunarDays = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

  const ganzhi = ['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉','甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未','甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳','甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯','甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑','甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥'];

  // 计算八字
  const calculateBazi = async () => {
    if (!dateInput) {
      setBaziError('请输入出生日期');
      return;
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      setBaziError('日期格式不正确');
      return;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = timeVal;

    setLoading(true);
    setBaziError('');
    setBaziResult(null);

    try {
      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour })
      });

      if (!response.ok) throw new Error('API请求失败');

      const data = await response.json();
      setBaziResult(data);
    } catch (err: any) {
      setBaziError('计算失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 农历计算
  const getLunarDate = (year: number, month: number, day: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const dayOfYear = Math.floor((firstDay.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
    const lunarYear = year - 1900 + 36;
    const monthIdx = Math.floor((dayOfYear / 30) % 12);
    const dayIdx = dayOfYear % 30;
    return {
      month: lunarMonths[monthIdx] || '正月',
      day: lunarDays[dayIdx] || '初一'
    };
  };

  const getGanzhi = (year: number, month: number, day: number) => {
    const total = (year - 1900) * 365 + (month - 1) * 30 + day;
    const gan = ganzhi[total % 60 % 10];
    const zhi = ganzhi[total % 60 % 12];
    return `${gan}${zhi}`;
  };

  const holidays: Record<string, string> = {
    '1-1': '元旦', '2-14': '情人节', '3-8': '妇女节',
    '4-1': '愚人节', '5-1': '劳动节', '6-1': '儿童节',
    '10-1': '国庆节', '12-25': '圣诞节'
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    const days: any[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const lunar = getLunarDate(currentYear, currentMonth, d);
      const holiday = holidays[`${currentMonth}-${d}`];
      const today = new Date();
      const isToday = today.getFullYear() === currentYear &&
                      today.getMonth() + 1 === currentMonth &&
                      today.getDate() === d;

      days.push({ day: d, lunar, holiday, isToday });
    }

    return days;
  };

  const getDayDetail = (day: any) => {
    if (!day) return null;
    const yi = ['祭祀','祈福','出行','嫁娶','动土','安床','交易','立券'];
    const ji = ['开市','移徙','入宅','安葬','破土','动土'];
    return {
      yi: yi.filter(() => Math.random() > 0.5).slice(0, 4),
      ji: ji.filter(() => Math.random() > 0.5).slice(0, 3),
      ganzhi: getGanzhi(currentYear, currentMonth, day.day)
    };
  };

  const days = getDaysInMonth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {lang === 'zh' ? '命理工具' : 'Fortune Tools'}
          </h1>
        </div>

        {/* Tab 切换 */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('bazi')}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === 'bazi'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {lang === 'zh' ? '八字算命' : 'Bazi'}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === 'calendar'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {lang === 'zh' ? '万年日历' : 'Calendar'}
          </button>
        </div>

        {/* 八字页面 */}
        {activeTab === 'bazi' && (
          <div>
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

              {baziError && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {baziError}
                </div>
              )}
            </div>

            {baziResult && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-6">
                  {baziResult.birthday} {genderVal === 1 ? t.bazi.male : t.bazi.female}{lang === 'zh' ? '命' : ''}
                </h2>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex justify-center gap-4 flex-wrap">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">{t.bazi.yearPillar}</div>
                      <div className="text-3xl font-bold text-blue-600">{baziResult.year}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">{t.bazi.monthPillar}</div>
                      <div className="text-3xl font-bold text-blue-600">{baziResult.month}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">{t.bazi.dayPillar}</div>
                      <div className="text-3xl font-bold text-blue-600">{baziResult.day}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">{t.bazi.timePillar}</div>
                      <div className="text-3xl font-bold text-blue-600">{baziResult.time}</div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-gray-600 text-sm">
                  <p>{lang === 'zh' ? '八字已精确计算，包含节气修正' : 'Bazi calculated with solar term corrections'}</p>
                  <p className="mt-2">{t.bazi.complete}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 日历页面 */}
        {activeTab === 'calendar' && (
          <div>
            {/* 年月选择 */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={() => { setCurrentYear(currentYear - 1); setSelectedDay(null); }}
                  className="px-2 py-1 bg-gray-200 rounded"
                >&lt;&lt;</button>
                <select
                  value={currentYear}
                  onChange={(e) => { setCurrentYear(Number(e.target.value)); setSelectedDay(null); }}
                  className="px-3 py-1 border rounded"
                >
                  {Array.from({ length: 201 }, (_, i) => 1900 + i).map(y => (
                    <option key={y} value={y}>{lang === 'zh' ? `${y}年` : y}</option>
                  ))}
                </select>
                <button
                  onClick={() => { setCurrentYear(currentYear + 1); setSelectedDay(null); }}
                  className="px-2 py-1 bg-gray-200 rounded"
                >&gt;&gt;</button>

                <span className="mx-1"></span>

                <button
                  onClick={() => { setCurrentMonth(currentMonth - 1); if (currentMonth < 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); } setSelectedDay(null); }}
                  className="px-2 py-1 bg-gray-200 rounded"
                >&lt;</button>
                <select
                  value={currentMonth}
                  onChange={(e) => { setCurrentMonth(Number(e.target.value)); setSelectedDay(null); }}
                  className="px-3 py-1 border rounded"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{lang === 'zh' ? `${m}月` : m}</option>
                  ))}
                </select>
                <button
                  onClick={() => { setCurrentMonth(currentMonth + 1); if (currentMonth > 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); } setSelectedDay(null); }}
                  className="px-2 py-1 bg-gray-200 rounded"
                >&gt;</button>

                <button
                  onClick={() => { setCurrentYear(new Date().getFullYear()); setCurrentMonth(new Date().getMonth() + 1); setSelectedDay(null); }}
                  className="ml-2 px-3 py-1 bg-green-600 text-white rounded"
                >
                  {t.wannianrili.today}
                </button>
              </div>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekDays.map(day => (
                <div key={day} className="text-center font-bold py-2 bg-gray-100 rounded text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历格子 */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((day, idx) => (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDay(day)}
                  className={`
                    min-h-[60px] p-1 border rounded cursor-pointer transition text-xs
                    ${!day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
                    ${day?.isToday ? 'ring-2 ring-green-500' : ''}
                    ${selectedDay?.day === day?.day ? 'bg-green-50 ring-2 ring-green-400' : ''}
                  `}
                >
                  {day && (
                    <>
                      <div className={`text-center font-bold ${day.isToday ? 'text-green-600' : ''}`}>
                        {day.day}
                      </div>
                      <div className="text-[9px] text-center text-gray-500 truncate">
                        {day.lunar.month}{day.lunar.day}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* 选中日期详情 */}
            {selectedDay && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold text-center mb-3">
                  {lang === 'zh'
                    ? `${currentYear}年${currentMonth}月${selectedDay.day}日`
                    : `${currentYear}-${currentMonth}-${selectedDay.day}`
                  }
                </h3>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-bold text-green-700 mb-2">{t.wannianrili.yi}</div>
                    <div className="flex flex-wrap gap-1">
                      {getDayDetail(selectedDay)?.yi.map((item: string) => (
                        <span key={item} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="font-bold text-red-700 mb-2">{t.wannianrili.ji}</div>
                    <div className="flex flex-wrap gap-1">
                      {getDayDetail(selectedDay)?.ji.map((item: string) => (
                        <span key={item} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center text-gray-600 text-sm">
                  {t.wannianrili.ganzhi}: {getDayDetail(selectedDay)?.ganzhi}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
