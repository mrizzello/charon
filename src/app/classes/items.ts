import { Item } from "./item";
import { Pause } from "./pause";

export class Settings {
    start: string = '08:20';
    tprep: number = 10;
    texam: number = 10;
    tsupprep: number = 5;
    tsupexam: number = 0;
    tpauseShort: number = 10;
    tpauseNoon: number = 60;
};

type ExamType = 'exam1' | 'exam2';

export class Items {

    classe: string = '';
    items: any[] = [];
    start: string = '08:20';
    settings: Settings = new Settings();
    lastTime!: Date;
    pauseNoon!: Pause;

    constructor(jsonData: any) {
        jsonData = jsonData.slice(1);
        this.classe = jsonData[0]['__EMPTY_3'];
        this.items = jsonData.map((row: any, index: number) => {
            return new Item(row, index);
        });
    }

    getClasse(): string {
        return this.classe;
    }

    getSettings(): Settings {
        return this.settings;
    }

    removeItem(i: any) {
        this.items.splice(i, 1);
    }

    sortBy(type: string = 'draw') {
        this.items.sort((a, b) => a[type] - b[type]);
    }

    randomDraw() {
        this.items.forEach((item, index) => {
            if (item.type == 'pause') {
                this.items.splice(index, 1);
            }
        });
        const numbersArray = Array.from({ length: this.items.length }, (_, index) => index + 1);
        const randomizedNumbers = this.shuffleArray(numbersArray);
        this.items.forEach((item) => {
            let value = randomizedNumbers.shift();
            item.draw = value;
            item.cssRowClass.push(value % 2 == 0 ? 'odd' : 'even');
        });
    }

    shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    process(): void {
        this.addDrawDummies();
        this.calculateExamSchedules('exam1');
        this.calculateExamSchedules('exam2');
        this.sortBy('drawDummy1');
    }

    getPauseNoon(){
        const orderNoon = Math.ceil(this.items.length / 2) - 1;        
        return this.items[orderNoon];
    }

    addDrawDummies() {
        this.removePauses();
        this.sortBy('draw');
        this.addPauses();
        this.items.forEach((item, index) => {
            item.drawDummy1 = index + 1;
        });

        let numbersArray = Array.from({ length: this.items.length }, (_, index) => index + 1);
        let sliceIndex = numbersArray.indexOf(Math.ceil(numbersArray.length / 2)) + 1;
        let firstPart = numbersArray.slice(sliceIndex);
        let secondPart = numbersArray.slice(0, sliceIndex);
        numbersArray = firstPart.concat(secondPart);

        this.items.forEach((item, index) => {
            item.drawDummy2 = numbersArray[index];
        });

        this.sortBy('drawDummy1');
        let count = 1;
        this.items.forEach((item, index) => {
            if (item.type == 'item') {
                item.drawDisplay1 = count;
                count++;
            }
        });

        this.sortBy('drawDummy2');
        count = 1;
        this.items.forEach((item, index) => {
            if (item.type == 'item') {
                item.drawDisplay2 = count;
                count++;
            }
        });
    }

    calculateExamSchedules(examType: ExamType, useLastTime: boolean = false): void {

        if (examType == 'exam1') {
            this.sortBy('drawDummy1');
        }
        if (examType == 'exam2') {
            this.sortBy('drawDummy2');
        }

        const [hours, minutes] = this.settings.start.split(":");

        let time = new Date();
        time.setHours(parseInt(hours, 10));
        time.setMinutes(parseInt(minutes, 10));
        time.setSeconds(0);
        if (useLastTime !== false) {
            time = new Date(this.lastTime);
        }

        this.items.forEach((item, index) => {
            if (item.type == 'item') {
                let passage = new Date(time);
                if (item.tpsup && this.settings.tsupprep > 0) {
                    passage.setMinutes(time.getMinutes() + this.settings.tprep + this.settings.tsupprep);
                } else {
                    passage.setMinutes(time.getMinutes() + this.settings.tprep);
                }

                let exam = new Date(passage);
                if (item.tpsup && this.settings.tsupexam > 0) {
                    exam.setMinutes(passage.getMinutes() + this.settings.texam + this.settings.tsupexam);
                } else {
                    exam.setMinutes(passage.getMinutes() + this.settings.texam);
                }

                item[examType] = {
                    'time1': new Date(time),
                    'time2': new Date(passage),
                    'time3': new Date(exam),
                };

                time = new Date(passage);
                this.lastTime = new Date(exam);
            }
            if (item.type == 'pause') {
                if (this.items[index - 1] !== undefined) {
                    let duration = item.subtype == 'noon' ? this.settings.tpauseNoon : this.settings.tpauseShort;
                    item[examType].time1 = new Date(this.items[index - 1][examType].time3);
                    item[examType].time2 = new Date(item[examType].time1);
                    item[examType].time2.setMinutes(item[examType].time2.getMinutes() + duration);
                    time = new Date(item[examType].time2);
                    this.lastTime = new Date(item[examType].time2);
                }
            }
        });

        if (examType == 'exam2') {
            const orderNoon = Math.ceil(this.items.length / 2) - 1;
            this.items[0][examType].time1 = new Date(this.items[orderNoon][examType].time3);
            this.items[0][examType].time2 = new Date(this.items[0][examType].time1);
            this.items[0][examType].time2.setMinutes(this.items[0][examType].time2.getMinutes() + this.settings.tpauseNoon);
        }

    }

    removePauses(){
        this.items.forEach((item, index) => {
            if (item.type == 'pause') {
                this.items.splice(index, 1);
            }
        });
    }

    addPauses(): void {

        const length = this.items.length;

        const orderAm = Math.ceil(length / 4);
        this.items.splice(orderAm, 0, new Pause({ title: 'Pause', subtype: 'short' }));

        const orderNoon = Math.ceil(length / 2) + 1;
        this.items.splice(orderNoon, 0, new Pause({ title: 'Pause repas', subtype: 'noon' }));

        const orderPm = Math.ceil(length / 4 * 3) + 2;
        this.items.splice(orderPm, 0, new Pause({ title: 'Pause', subtype: 'short' }));

    }

}
