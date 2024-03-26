import { Item } from "./item";
import { Pause } from "./pause";
import { Settings } from "./settings";

type ExamType = 'exam1' | 'exam2';

export class Items {

    classe: string = '';
    items: Item[] = [];
    settings: Settings = new Settings();
    lastTime!: Date;
    pauseNoon!: Pause;
    schedule1: (Item | Pause)[] = [];
    schedule2: (Item | Pause)[] = [];

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

    getSetting(property: keyof Settings): string | Date | number {
        return this.settings.getProperty(property);
    }

    setSetting(property: keyof Settings, value: any): void {
        this.settings.setProperty(property, value);
        this.updateSchedule();
    }

    getSchedule(n: number = 1): any[] {
        return n == 1 ? this.schedule1 as any[] : this.schedule2 as any[];
    }

    removeItem(i: any) {
        this.items.splice(i, 1);
    }

    sortBy(property: keyof Item = 'draw') {
        this.items.sort((a, b) => {
            const valueA = a[property];
            const valueB = b[property];
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return valueA - valueB;
            } else {
                return String(valueA).localeCompare(String(valueB));
            }
        });
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

    initialize(): void {
        this.sortBy('draw');
        const B12 = JSON.parse(JSON.stringify(this.items));
        const midIndex = Math.ceil(B12.length / 2);
        const A12 = B12.splice(0, midIndex);
        const midIndexA = Math.ceil(A12.length / 2);
        const A11 = A12.splice(0, midIndexA);
        const midIndexB = Math.ceil(B12.length / 2);
        const B11 = B12.splice(0, midIndexB);

        this.schedule1 = [];
        this.schedule1 = this.schedule1.concat(A11);
        this.schedule1.push(new Pause({ title: 'Pause courte', subtype: 'short' }));
        this.schedule1 = this.schedule1.concat(A12);
        this.schedule1.push(new Pause({ title: 'Pause repas', subtype: 'noon' }));
        this.schedule1 = this.schedule1.concat(B12);
        this.schedule1.push(new Pause({ title: 'Pause courte', subtype: 'short' }));
        this.schedule1 = this.schedule1.concat(B11);

        const A21 = JSON.parse(JSON.stringify(A11));
        const A22 = JSON.parse(JSON.stringify(A12));
        const B21 = JSON.parse(JSON.stringify(B11));
        const B22 = JSON.parse(JSON.stringify(B12));

        this.schedule2 = [];
        this.schedule2 = this.schedule2.concat(A22);
        this.schedule2.push(new Pause({ title: 'Pause courte', subtype: 'short' }));
        this.schedule2 = this.schedule2.concat(A21);
        this.schedule2.push(new Pause({ title: 'Pause repas', subtype: 'noon' }));
        this.schedule2 = this.schedule2.concat(B22);
        this.schedule2.push(new Pause({ title: 'Pause courte', subtype: 'short' }));
        this.schedule2 = this.schedule2.concat(B21);

        this.updateSchedule();

        this.sortBy('n');
    }

    updateSchedule(): void {
        [this.schedule1, this.schedule2].forEach((schedule) => {
            let time = new Date(this.settings.start);
            schedule.forEach((item: (Item | Pause)) => {
                if ('tpsup' in item && item.type == 'item') {
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

                    item.schedule = {
                        'time1': new Date(time),
                        'time2': new Date(passage),
                        'time3': new Date(exam),
                    };

                    time = new Date(passage);
                    this.lastTime = new Date(exam);
                }
                if ('subtype' in item && item.type == 'pause') {
                    let duration = item.subtype == 'noon' ? this.settings.tpauseNoon : this.settings.tpauseShort;
                    item.schedule.time1 = new Date(this.lastTime);
                    item.schedule.time2 = new Date(item.schedule.time1);
                    item.schedule.time2.setMinutes(item.schedule.time2.getMinutes() + duration);
                    time = new Date(item.schedule.time2);
                    this.lastTime = new Date(item.schedule.time2);
                }
            });
        });
    }
}
