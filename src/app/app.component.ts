import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as XLSX from 'xlsx';

import { Items } from './classes/items';
import { Item } from './classes/item';
import { Pause } from './classes/pause';
import { ExamFormComponent } from './listes/exam-form/exam-form.component';
import { InfoComponent } from './pages/info/info.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  xlsx: any;
  items?: Items;
  classe: string = '';
  selectedTab: number = 0;
  disabledTab: boolean[] = [false, true, true];
  errorMessage: string = '';
  uploadDone: boolean = false;

  @ViewChild(ExamFormComponent) examFormComponent!: ExamFormComponent;

  constructor(
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private titleService: Title
  ) { }

  handleFileInput(event: any) {

    const file = event.target.files[0];

    if (file) {
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop();
      if (fileExtension === 'xlsx') {
        this.errorMessage = "";
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.xlsx = new Uint8Array(e.target.result);
          const workbook = XLSX.read(this.xlsx, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 2, range: 3 }) as any[];
          this.items = new Items(jsonData, this.titleService);
        };

        reader.readAsArrayBuffer(file);
        this.uploadDone = true;

      } else {
        this.errorMessage = "Veuillez vérifiez le format de fichier.";
      }
    }
  }

  reloadApp() {
    window.location.reload();
  }

  activateTab(i: number) {
    this.selectedTab = i;
    for (let n = 0; n <= 2; n++) {
      this.disabledTab[n] = true;
    }
    this.disabledTab[i] = false;
    if (i == 1) {
      this.items?.initialize();
    }
  }

  printPage(): void {
    window.print();
  }

  export2Excel(): void {
    const settings = this.items?.getSettings();
    const workbook = XLSX.utils.book_new();
    [this.items?.schedule1, this.items?.schedule2].forEach((schedule: any, sIndex: number) => {
      const data: any[] = [];
      const toMerge: any[] = [];
      const examName = sIndex == 0 ? settings?.exam1name : settings?.exam2name;
      data.push([examName]);
      data.push(['Élève', 'préparation', 'passage']);
      toMerge.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });
      let rowCounter = 2;
      schedule.forEach((item: Item | Pause, index: number) => {
        if (item.type != 'dummy') {
          const _item: any = [];
          if (item.type == 'item') {
            _item.push((item as Item).firstname + ' ' + (item as Item).lastname + ((item as Item).tpsup ? '*' : ''));
            _item.push(this.formatTime((item as Item).schedule.time1) + ' - ' + this.formatTime((item as Item).schedule.time2));
            _item.push(this.formatTime((item as Item).schedule.time2) + ' - ' + this.formatTime((item as Item).schedule.time3));
            data.push(_item);
            rowCounter++;
          }
          if (item.type == 'pause') {
            const pauseItem = item as Pause;
            if (pauseItem.getTimeDifference() > 0) {
              _item.push((item as Pause).getLabel());
              _item.push(this.formatTime((item as Pause).schedule.time1) + ' - ' + this.formatTime((item as Pause).schedule.time2));
              toMerge.push({ s: { r: rowCounter, c: 1 }, e: { r: rowCounter, c: 2 } });
              data.push(_item);
              rowCounter++;
            }
          }
        }
      });
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      worksheet['!merges'] = toMerge;
      XLSX.utils.book_append_sheet(workbook, worksheet, examName);
    })
    
    XLSX.writeFile(workbook, this.items?.getClasse() + '-liste-passage-exa-oraux.xlsx');
  }

  formatTime(date: Date): string {
    return this.datePipe.transform(date, 'HH:mm') || '';
  }

  openInfoDialog(): void {
    const dialogRef = this.dialog.open(InfoComponent, {
      width: '640px',
    });
  }

}
