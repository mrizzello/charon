export interface ExamSchedule {
    time1: Date;
    time2: Date;
    time3: Date;
}

export class Item {
    n: number = 0;
    type: string = '';
    title: string = '';
    gender: string = '';
    lastname: string = '';
    firstname: string = '';
    classe: string = '';
    emails: string = '';
    bdate: string = '';
    classes: string = '';
    status: string = '';
    tpsup: boolean = false;
    draw: number = 0;
    drawDummy1: number = 0;
    drawDummy2: number = 0;
    drawDisplay1: number = 0;
    drawDisplay2: number = 0;
    schedule: ExamSchedule = { time1: new Date(), time2: new Date(), time3: new Date() };
    cssRowClass: string[] = ['item'];

    constructor(row: any, index: number) {
        this.type = 'item';
        this.title = '';
        this.gender = row['__EMPTY'];
        this.lastname = row['__EMPTY_1'];
        this.firstname = row['__EMPTY_2'];
        this.classe = row['__EMPTY_3'];
        this.emails = row['__EMPTY_4'];
        this.bdate = row['__EMPTY_5'];
        this.classes = row['__EMPTY_6'];
        this.status = row['__EMPTY_7'];
        this.n = index + 1;
    }

    // getTimeDifference(): string {

    //     let diffInMilliseconds = this.exam2.time1.getTime() - this.exam1.time3.getTime();
    //     if( this.exam1.time3.getTime() > this.exam2.time1.getTime() ){
    //         diffInMilliseconds = this.exam1.time1.getTime() - this.exam2.time3.getTime();
    //     }
    //     const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

    //     const hours = Math.floor(diffInMinutes / 60);
    //     const minutes = diffInMinutes % 60;

    //     if (hours >= 1) {
    //         return `${hours}:${String(minutes).padStart(2, '0')}`;
    //     } else {
    //         return String(minutes);
    //     }
    // }
}
