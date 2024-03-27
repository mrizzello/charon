import { Component, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';

import { Items } from './classes/items';
import { ExamFormComponent } from './listes/exam-form/exam-form.component';

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
          this.items = new Items(jsonData);
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
      this.examFormComponent.getSchedules();
    }

  }

}
