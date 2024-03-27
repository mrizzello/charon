import { Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { Items } from '../../classes/items';

@Component({
  selector: 'app-liste-form',
  templateUrl: './liste-form.component.html',
  styleUrls: ['./liste-form.component.scss']
})
export class ListeFormComponent {

  @Input() items!: Items;

  removeItem(i: any) {
    this.items.removeItem(i);
  }

  randomDraw() {
    this.items.randomDraw();
  }

  updateTpsup(event: MatCheckboxChange, item: any): void {
    item.tpsup = event.checked;
  }

  updateDraw(newValue: any, item: any): void {
    item.draw = newValue;
  }

}
