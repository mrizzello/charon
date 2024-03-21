export interface PauseSchedule {
    time1: Date | null;
    time2: Date | null;
}

export class Pause {
    type: string;
    title: string;
    subtype: string;
    drawDummy1: number;
    drawDummy2: number;
    cssRowClass: any[];
    exam1: PauseSchedule;
    exam2: PauseSchedule;

    constructor(obj: any = {}) {

        const {
            type = 'pause',
            subtype = '',
            title = '',
            drawDummy1 = 0,
            drawDummy2 = 0,
            cssRowClass = ['pause'],
            exam1 = { time1: null, time2: null, title: null },
            exam2 = { time1: null, time2: null, title: null },
        } = obj;

        this.type = type;
        this.subtype = subtype;
        this.title = title;
        this.drawDummy1 = drawDummy1;
        this.drawDummy2 = drawDummy2;
        this.cssRowClass = cssRowClass;
        this.exam1 = {
            time1: exam1?.time1 ?? null,
            time2: exam1?.time2 ?? null
        };
        this.exam2 = {
            time1: exam2?.time1 ?? null,
            time2: exam2?.time2 ?? null
        };
    }
}
