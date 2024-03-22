export class Settings {
    start: Date = new Date();
    tprep: number = 10;
    texam: number = 10;
    tsupprep: number = 5;
    tsupexam: number = 0;
    tpauseShort: number = 10;
    tpauseNoon: number = 60;

    constructor(start: string = '08:20') {
        const [hours, minutes] = start.split(":");
        this.start.setHours(parseInt(hours, 10));
        this.start.setMinutes(parseInt(minutes, 10));
        this.start.setSeconds(0);
    }
};