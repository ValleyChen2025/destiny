declare module 'lunar-javascript' {
  export class Lunar {
    static fromDate(date: Date): Lunar;
    getDayInGanZhi(): string;
    getYearInGanZhi(): string;
    getMonthInZhi(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  export class LunarMonth {
    static getMonthFromIndex(year: number, month: number): number;
  }

  export class Solar {
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    getJieQi(): { getName(): string } | null;
  }

  export class SolarUtil {
    static isLeapYear(year: number): boolean;
  }
}
