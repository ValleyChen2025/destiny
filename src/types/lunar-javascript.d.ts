declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getLunar(): Lunar;
  }

  export class Lunar {
    getEightChar(): EightChar;
    getPrevJieQi(): JieQi | null;
  }

  export class EightChar {
    getYear(): GanZhi;
    getMonth(): GanZhi;
    getDay(): GanZhi;
    getTime(): GanZhi;
  }

  export class GanZhi {
    toString(): string;
  }

  export class JieQi {
    getName(): string;
  }
}
