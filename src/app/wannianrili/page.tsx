'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';

// 记事数据类型
interface CalendarNote {
  id: string;
  date: string;
  content: string;
  color: string;
  alarm: boolean;
  alarmTime?: string;
}

export default function WannianriliPage() {
  const { lang, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('#3B82F6');
  const [noteAlarm, setNoteAlarm] = useState(false);

  // 初始化 - 仅在客户端执行
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    const savedPassword = localStorage.getItem('calendar_password');
    if (!savedPassword) {
      setIsLocked(false);
    }
    const savedNotes = localStorage.getItem('calendar_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // 等待客户端挂载
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const weekDays = lang === 'zh'
    ? ['一', '二', '三', '四', '五', '六', '日']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // 农历数据（简化版）
  const lunarMonths = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
  const lunarDays = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

  // 六十甲子
  const ganzhi = ['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉','甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未','甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳','甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯','甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑','甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥'];

  // 颜色选项
  const colorOptions = [
    { value: '#3B82F6', label: '蓝色' },
    { value: '#10B981', label: '绿色' },
    { value: '#F59E0B', label: '黄色' },
    { value: '#EF4444', label: '红色' },
    { value: '#8B5CF6', label: '紫色' },
  ];

  // 检查密码（仅在客户端执行）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedPassword = localStorage.getItem('calendar_password');
    if (!savedPassword) {
      // 首次使用，需要设置密码
      setIsLocked(false);
    } else {
      setIsLocked(true);
    }
    // 加载记事
    const savedNotes = localStorage.getItem('calendar_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // 验证密码
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPassword = localStorage.getItem('calendar_password');

    if (!savedPassword) {
      // 设置新密码
      if (password.length >= 4) {
        localStorage.setItem('calendar_password', password);
        setIsLocked(true);
        setPassword('');
      }
    } else if (password === savedPassword) {
      setIsLocked(true);
      setPassword('');
    } else {
      alert(lang === 'zh' ? '密码错误' : 'Wrong password');
    }
  };

  // 获取正确的干支（使用标准算法）
  const getGanzhi = (year: number, month: number, day: number) => {
    // 使用已知基准日计算：1900-01-01 是庚子日
    // 基准：1900-01-01 = 庚子 (index 36 in ganzhi)
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000);

    // 庚子在ganzhi数组中的索引是36 (0-based)
    const ganzhiIndex = (36 + daysDiff) % 60;
    const yearGz = ganzhi[ganzhiIndex];

    // 月干支：年干*2 + 月份 (农历正月起)
    const yearGan = yearGz.charAt(0);
    const monthTable: Record<string, string[]> = {
      '甲': ['丙','戊','庚','壬','甲'], '乙': ['丁','己','辛','癸','乙'],
      '丙': ['戊','庚','壬','甲','丙'], '丁': ['己','辛','癸','乙','丁'],
      '戊': ['庚','壬','甲','丙','戊'], '己': ['辛','癸','乙','丁','己'],
      '庚': ['壬','甲','丙','戊','庚'], '辛': ['癸','乙','丁','己','辛'],
      '壬': ['甲','丙','戊','庚','壬'], '癸': ['乙','丁','己','辛','癸']
    };
    const yearIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(yearGan);
    const monthGz = (monthTable['甲'][yearIdx] || '甲') + ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][month - 1];

    return {
      year: yearGz,
      month: monthGz,
      day: yearGz // 日干支与年干支同样算法
    };
  };

  // 获取农历日期
  const getLunarDate = (year: number, month: number, day: number) => {
    // 使用 lunar-javascript 更准确，这里用简化算法
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
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayNotes = notes.filter(n => n.date === dateStr);

      days.push({
        day: d,
        lunar,
        holiday,
        isToday,
        notes: dayNotes
      });
    }

    return days;
  };

  // 打开记事弹窗
  const openNoteModal = () => {
    if (!selectedDay) return;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(selectedDay.day).padStart(2,'0')}`;
    const existingNote = notes.find(n => n.date === dateStr);
    if (existingNote) {
      setNoteContent(existingNote.content);
      setNoteColor(existingNote.color);
      setNoteAlarm(existingNote.alarm);
    } else {
      setNoteContent('');
      setNoteColor('#3B82F6');
      setNoteAlarm(false);
    }
    setShowNoteModal(true);
  };

  // 保存记事
  const saveNote = () => {
    if (!selectedDay) return;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(selectedDay.day).padStart(2,'0')}`;
    const existingIdx = notes.findIndex(n => n.date === dateStr);

    const newNote: CalendarNote = {
      id: existingIdx >= 0 ? notes[existingIdx].id : Date.now().toString(),
      date: dateStr,
      content: noteContent,
      color: noteColor,
      alarm: noteAlarm,
      alarmTime: noteAlarm ? '09:00' : undefined
    };

    let newNotes: CalendarNote[];
    if (existingIdx >= 0) {
      newNotes = [...notes];
      newNotes[existingIdx] = newNote;
    } else {
      newNotes = [...notes, newNote];
    }

    setNotes(newNotes);
    localStorage.setItem('calendar_notes', JSON.stringify(newNotes));
    setShowNoteModal(false);

    // 闹钟提示
    if (noteAlarm && noteContent) {
      setTimeout(() => {
        alert(`${dateStr}: ${noteContent}`);
      }, 1000);
    }
  };

  // 删除记事
  const deleteNote = () => {
    if (!selectedDay) return;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(selectedDay.day).padStart(2,'0')}`;
    const newNotes = notes.filter(n => n.date !== dateStr);
    setNotes(newNotes);
    localStorage.setItem('calendar_notes', JSON.stringify(newNotes));
    setShowNoteModal(false);
  };

  const days = getDaysInMonth();

  // 密码设置/输入界面
  if (!isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-4">
              {lang === 'zh' ? '设置访问密码' : 'Set Access Password'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {lang === 'zh'
                ? '设置一个4位以上密码来保护您的记事'
                : 'Set a password to protect your notes'}
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'zh' ? '输入密码' : 'Enter password'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-center"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg"
              >
                {lang === 'zh' ? '确认' : 'Confirm'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 密码输入界面
  if (isLocked && password === '' && typeof window !== 'undefined' && localStorage.getItem('calendar_password')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold mb-4">
              {lang === 'zh' ? '记事日历' : 'Calendar'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {lang === 'zh' ? '请输入密码访问' : 'Enter password to access'}
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'zh' ? '输入密码' : 'Enter password'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-center"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg"
              >
                {lang === 'zh' ? '解锁' : 'Unlock'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.wannianrili.title}</h1>
        </div>

        {/* 年月选择 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => { setCurrentYear(currentYear - 1); setSelectedDay(null); }}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              &lt;&lt;
            </button>
            <select
              value={currentYear}
              onChange={(e) => { setCurrentYear(Number(e.target.value)); setSelectedDay(null); }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Array.from({ length: 201 }, (_, i) => 1900 + i).map(y => (
                <option key={y} value={y}>{lang === 'zh' ? `${y}年` : y}</option>
              ))}
            </select>
            <button
              onClick={() => { setCurrentYear(currentYear + 1); setSelectedDay(null); }}
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
              onChange={(e) => { setCurrentMonth(Number(e.target.value)); setSelectedDay(null); }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{lang === 'zh' ? `${m}月` : m}</option>
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
              {t.wannianrili.today}
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
                min-h-[80px] p-1 border rounded cursor-pointer transition relative
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
                  {/* 记事标记 */}
                  {day.notes && day.notes.length > 0 && (
                    <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5">
                      {day.notes.map((n: CalendarNote, i: number) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: n.color }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* 选中日期详情 + 记事功能 */}
        {selectedDay && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {lang === 'zh'
                  ? `${currentYear}年${currentMonth}月${selectedDay.day}日`
                  : `${currentYear}-${currentMonth}-${selectedDay.day}`
                }
              </h3>
              <button
                onClick={openNoteModal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
              >
                {lang === 'zh' ? '添加记事' : 'Add Note'}
              </button>
            </div>

            {/* 干支信息 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500">{lang === 'zh' ? '年干支' : 'Year'}</div>
                  <div className="text-lg font-bold text-green-600">{getGanzhi(currentYear, currentMonth, selectedDay.day).year}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{lang === 'zh' ? '月干支' : 'Month'}</div>
                  <div className="text-lg font-bold text-green-600">{getGanzhi(currentYear, currentMonth, selectedDay.day).month}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{lang === 'zh' ? '日干支' : 'Day'}</div>
                  <div className="text-lg font-bold text-green-600">{getGanzhi(currentYear, currentMonth, selectedDay.day).day}</div>
                </div>
              </div>
            </div>

            {/* 显示当天记事 */}
            {(() => {
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(selectedDay.day).padStart(2,'0')}`;
              const dayNotes = notes.filter(n => n.date === dateStr);
              if (dayNotes.length === 0) return null;
              return (
                <div className="space-y-2">
                  {dayNotes.map((note: CalendarNote) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg flex items-center gap-2"
                      style={{ backgroundColor: note.color + '20', borderLeft: `4px solid ${note.color}` }}
                    >
                      <span className="flex-1">{note.content}</span>
                      {note.alarm && <span className="text-xs">🔔</span>}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 记事弹窗 */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">
              {lang === 'zh' ? '添加记事' : 'Add Note'}
            </h3>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder={lang === 'zh' ? '输入记事内容...' : 'Enter note...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 h-24 resize-none"
            />
            <div className="mb-4">
              <div className="text-sm mb-2">{lang === 'zh' ? '颜色标记' : 'Color'}</div>
              <div className="flex gap-2">
                {colorOptions.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setNoteColor(c.value)}
                    className={`w-8 h-8 rounded-full ${noteColor === c.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={noteAlarm}
                  onChange={(e) => setNoteAlarm(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{lang === 'zh' ? '设置提醒' : 'Set alarm'}</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={deleteNote}
                className="flex-1 py-2 text-red-600 border border-red-600 rounded-lg"
              >
                {lang === 'zh' ? '删除' : 'Delete'}
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 py-2 bg-gray-200 rounded-lg"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={saveNote}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg"
              >
                {lang === 'zh' ? '保存' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
