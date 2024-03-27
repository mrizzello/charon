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
    schedule: ExamSchedule = { time1: new Date(), time2: new Date(), time3: new Date() };
    early: boolean = false;

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
}
