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
        const chunkSize = Math.ceil(B12.length / 4);
        const chunks1: Item[][] = [];
        for (let i = 0; i < B12.length; i += chunkSize) {
            chunks1.push(B12.slice(i, i + chunkSize));
        }
        if (this.items.length % 4 !== 0) {
            const tmpChunks = chunks1[2].concat(chunks1[3]);
            const midIndexChunks = Math.ceil(tmpChunks.length / 2);
            const tmpChunks2 = tmpChunks.splice(0, midIndexChunks);
            chunks1[2] = tmpChunks;
            chunks1[3] = tmpChunks2;
            if (chunks1[2].length !== chunks1[3].length) {
                const dummy = this.getDummy(this.items.length);
                chunks1[2].push(dummy);
            }
        }

        this.schedule1 = [];
        this.schedule1 = this.schedule1.concat(chunks1[0]);
        this.schedule1.push(new Pause({ title: 'Pause courte', subtype: 'short' }));
        this.schedule1 = this.schedule1.concat(chunks1[1]);
        this.schedule1.push(new Pause({ title: 'Pause repas', subtype: 'noon' }));
        this.schedule1 = this.schedule1.concat(chunks1[2]);
        this.schedule1.push(new Pause({ title: 'Pause courte', subtype: 'short' }));
        this.schedule1 = this.schedule1.concat(chunks1[3]);

        const chunks2 = JSON.parse(JSON.stringify(chunks1));

        this.schedule2 = [];
        this.schedule2 = this.schedule2.concat(chunks2[1]);
        this.schedule2.push(new Pause({ title: 'Pause courte', subtype: 'short' }));
        this.schedule2 = this.schedule2.concat(chunks2[0]);
        this.schedule2.push(new Pause({ title: 'Pause repas', subtype: 'noon' }));
        this.schedule2 = this.schedule2.concat(chunks2[3]);
        this.schedule2.push(new Pause({ title: 'Pause courte', subtype: 'short' }));
        this.schedule2 = this.schedule2.concat(chunks2[2]);

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
        this.schedule1.forEach((item1: any) => {
            if (item1.type == 'item') {
                this.schedule2.forEach((item2: any) => {
                    if (item1.n == item2.n && item2.type == 'item') {
                        item1.early = false;
                        item2.early = false;
                        let diffMinutes = this.getMinutesDifference( item1.schedule.time1, item2.schedule.time3);
                        if (item2.schedule.time1 > item1.schedule.time3) {
                            diffMinutes = this.getMinutesDifference( item2.schedule.time1, item1.schedule.time3);
                        }
                        if( diffMinutes < 60 ){
                            item1.early = true;
                            item2.early = true;
                        }
                    }
                });
            }
        })
    }

    getMinutesDifference(date1: Date, date2: Date): number {
        const diffMilliseconds: number = Math.abs(date2.getTime() - date1.getTime());
        const diffMinutes: number = Math.floor(diffMilliseconds / (1000 * 60));
        return diffMinutes;
    }

    getDummy(n: number): Item {
        const dummy = new Item([], n);
        dummy.type = 'dummy';
        dummy.gender = '';
        dummy.lastname = '';
        dummy.firstname = '';
        dummy.emails = '';
        dummy.bdate = '';
        dummy.classes = '';
        dummy.status = '';
        dummy.tpsup = false;
        return dummy;
    }
}
