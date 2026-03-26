import { NextRequest, NextResponse } from 'next/server';
import { Solar, Lunar } from 'lunar-typescript';

export async function POST(request: NextRequest) {
  try {
    const { year, month, day, hour } = await request.json();

    if (!year || !month || !day) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // hour 是时辰索引（1,3,5,7,9,11,13,15,17,19,21,23）
    // 转换为小时
    const hourValue = hour || 0;
    // 23点是特殊情况用0
    const h = hourValue === 23 ? 0 : hourValue;

    // 使用lunar-typescript计算八字（包含时间）
    const solar = Solar.fromYmdHms(year, month, day, h, 30, 0);
    const lunar = solar.getLunar();

    // 获取年柱、月柱、日柱
    const yearGan = lunar.getYearGan();
    const yearZhi = lunar.getYearZhi();
    const monthGan = lunar.getMonthGan();
    const monthZhi = lunar.getMonthZhi();
    const dayGan = lunar.getDayGan();
    const dayZhi = lunar.getDayZhi();

    // 获取时柱
    const timeZhi = lunar.getTimeInGanZhi();

    const result = {
      year: yearGan + yearZhi,
      month: monthGan + monthZhi,
      day: dayGan + dayZhi,
      time: timeZhi,
      birthday: `${year}年${month}月${day}日`,
      hour: hour
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
