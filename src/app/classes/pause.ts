export interface PauseSchedule {
    time1: Date;
    time2: Date;
    time3?: Date | null;
}

export class Pause {
    type: string;
    title: string;
    subtype: string;
    drawDummy1: number;
    drawDummy2: number;
    cssRowClass: any[];
    schedule: PauseSchedule = { time1: new Date(), time2: new Date() };
    
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
        this.schedule = {
            time1: exam1?.time1 ?? new Date(),
            time2: exam1?.time2 ?? new Date()
        };
    }

    // getTimeDifference(): number{
    //     const diffInMilliseconds = Math.abs(this.exam1.time2.getTime() - this.exam1.time1.getTime());
    //     const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    //     return diffInMinutes;
    // }
}
