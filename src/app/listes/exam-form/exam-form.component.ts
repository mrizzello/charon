import { Component, Input } from '@angular/core';

import { Items } from '../../classes/items';
import { Pause } from "../../classes/pause";

@Component({
  selector: 'app-exam-form',
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.scss']
})
export class ExamFormComponent {

  lastTime!: Date;
  pauseNoon!: Pause;

  @Input() items!: Items;

  process(): void {
    this.items.process();
    this.pauseNoon = this.items.getPauseNoon();    
  }

}
