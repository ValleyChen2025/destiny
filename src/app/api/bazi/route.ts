import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi } from '@/utils/baziEngine';

export async function POST(request: NextRequest) {
  try {
    const { year, month, day, hour, gender } = await request.json();

    if (!year || !month || !day) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // hour 是时辰索引（1,3,5,7,9,11,13,15,17,19,21,23）
    const hourValue = hour || 13;
    const h = hourValue === 23 ? 0 : hourValue;
    const minute = 30; // 简化：取时辰中间

    // 构造日期字符串
    const birthDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const birthTimeStr = `${h}:${minute}`;

    // 使用增强后的引擎计算
    const result = calculateBazi(birthDateStr, birthTimeStr, 120, false, gender || 1);

    return NextResponse.json({
      year: result.yearGanZhi,
      month: result.monthGanZhi,
      day: result.dayGanZhi,
      time: result.timeGanZhi,
      birthday: `${year}年${month}月${day}日`,
      hour: hour,
      gender: result.gender,
      dayunStartAge: result.dayunStartAge,
      dayunStartDate: result.dayunStartDate,
      dayuns: result.dayuns,
      liunians: result.liunians,
      shenshas: result.shenshas,
      solarTerm: result.solarTerm
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
