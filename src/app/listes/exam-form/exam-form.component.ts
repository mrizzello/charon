import { Component, Input } from '@angular/core';

import { Items } from '../../classes/items';
import { Settings } from "../../classes/settings";

@Component({
  selector: 'app-exam-form',
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.scss']
})
export class ExamFormComponent {

  exam1name: string = 'Examen 1';
  exam2name: string = 'Examen 2';
  schedule1: any[] = [];
  schedule2: any[] = [];

  @Input() items!: Items;

  getSchedules(): void {
    this.schedule1 = this.items.getSchedule(1);
    this.schedule2 = this.items.getSchedule(2);
  }

  setStart(op: string, minutes: number) {
    let time = new Date(this.items.getSetting('start'));
    if (op == 'add') {
      time.setMinutes(time.getMinutes() + minutes);
    }
    if (op == 'sub') {
      time.setMinutes(time.getMinutes() - minutes);
    }
    this.items.setSetting('start', time);
  }

  setMinutes(property: keyof Settings, minutes: number) {
    let tmp = this.items.getSetting(property);
    if (typeof tmp === 'number') {
      const nextValue = tmp + minutes;
      if (nextValue >= 0) {
        this.items.setSetting(property, nextValue);
      }
    }
  }

  onExamChange(name: string): void {
    if (name == 'exa1') {
      this.items.setSetting('exam1name', this.exam1name);
    }
    if (name == 'exa2') {
      this.items.setSetting('exam2name', this.exam2name);
    }
  }

}
