'use client';

import { useState, useEffect } from 'react';

export default function WannianriliPage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  // 农历数据（简化版）
  const lunarMonths = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
  const lunarDays = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

  // 六十甲子
  const ganzhi = ['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉','甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未','甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳','甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯','甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑','甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥'];

  // 获取农历日期
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

  // 获取干支
  const getGanzhi = (year: number, month: number, day: number) => {
    const total = (year - 1900) * 365 + (month - 1) * 30 + day;
    const gan = ganzhi[total % 60 % 10];
    const zhi = ganzhi[total % 60 % 12];
    return `${gan}年`;
  };

  // 节假日
  const holidays: Record<string, string> = {
    '1-1': '元旦',
    '2-14': '情人节',
    '3-8': '妇女节',
    '4-1': '愚人节',
    '5-1': '劳动节',
    '6-1': '儿童节',
    '10-1': '国庆节',
    '12-25': '圣诞节'
  };

  // 获取日历数据
  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const days: any[] = [];

    // 空白格子
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // 日期格子
    for (let d = 1; d <= daysInMonth; d++) {
      const lunar = getLunarDate(currentYear, currentMonth, d);
      const holiday = holidays[`${currentMonth}-${d}`];
      const today = new Date();
      const isToday = today.getFullYear() === currentYear &&
                      today.getMonth() + 1 === currentMonth &&
                      today.getDate() === d;

      days.push({
        day: d,
        lunar,
        holiday,
        isToday
      });
    }

    return days;
  };

  // 获取选中日期的详情
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">万年日历</h1>
          <p className="text-gray-600">查询吉凶宜忌</p>
        </div>

        {/* 年月选择 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => {
                setCurrentYear(currentYear - 1);
                setSelectedDay(null);
              }}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              &lt;&lt;
            </button>
            <select
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(Number(e.target.value));
                setSelectedDay(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Array.from({ length: 201 }, (_, i) => 1900 + i).map(y => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
            <button
              onClick={() => {
                setCurrentYear(currentYear + 1);
                setSelectedDay(null);
              }}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              &gt;&gt;
            </button>

            <span className="mx-2"></span>

            <button
              onClick={() => {
                setCurrentMonth(currentMonth - 1);
                if (currentMonth < 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); }
                setSelectedDay(null);
              }}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              &lt;
            </button>
            <select
              value={currentMonth}
              onChange={(e) => {
                setCurrentMonth(Number(e.target.value));
                setSelectedDay(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
            <button
              onClick={() => {
                setCurrentMonth(currentMonth + 1);
                if (currentMonth > 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); }
                setSelectedDay(null);
              }}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              &gt;
            </button>

            <span className="mx-2"></span>

            <button
              onClick={() => {
                setCurrentYear(new Date().getFullYear());
                setCurrentMonth(new Date().getMonth() + 1);
                setSelectedDay(null);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              回到今天
            </button>
          </div>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center font-bold py-2 bg-gray-100 rounded">
              {day}
            </div>
          ))}
        </div>

        {/* 日历格子 */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {days.map((day, idx) => (
            <div
              key={idx}
              onClick={() => day && setSelectedDay(day)}
              className={`
                min-h-[80px] p-1 border rounded cursor-pointer transition
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
                  <div className="text-[10px] text-center text-gray-500 truncate">
                    {day.lunar.month}{day.lunar.day}
                  </div>
                  {day.holiday && (
                    <div className="text-[10px] text-center text-red-500 truncate">
                      {day.holiday}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* 选中日期详情 */}
        {selectedDay && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-center mb-4">
              {currentYear}年{currentMonth}月{selectedDay.day}日
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-bold text-green-700 mb-2">宜</div>
                <div className="flex flex-wrap gap-2">
                  {getDayDetail(selectedDay)?.yi.map((item: string) => (
                    <span key={item} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="font-bold text-red-700 mb-2">忌</div>
                <div className="flex flex-wrap gap-2">
                  {getDayDetail(selectedDay)?.ji.map((item: string) => (
                    <span key={item} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-gray-600">
              干支: {getDayDetail(selectedDay)?.ganzhi}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
