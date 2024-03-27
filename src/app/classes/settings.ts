export class Settings {
    start: Date = new Date();
    tprep: number = 10;
    texam: number = 10;
    tsupprep: number = 5;
    tsupexam: number = 0;
    tpauseAm: number = 10;
    tpausePm: number = 10;
    tpauseNoon: number = 60;
    exam1name: string = '';
    exam2name: string = '';

    constructor(start: string = '08:20') {
        const [hours, minutes] = start.split(":");
        this.start.setHours(parseInt(hours, 10));
        this.start.setMinutes(parseInt(minutes, 10));
        this.start.setSeconds(0);
    }

    setProperty(property: keyof Settings, value: string | number | Date): void {
        switch (property) {
            case 'start':
                this.start = value as Date;
                break;
            case 'tprep':
            case 'texam':
            case 'tsupprep':
            case 'tsupexam':
            case 'tpauseAm':
            case 'tpausePm':
            case 'tpauseNoon':
                this[property] = value as number;
                break;
            case 'exam1name':
            case 'exam2name':
                this[property] = value as string;
                break;
        }
    }

    getProperty(property: keyof Settings): any {
        return this[property];
    }

};