import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/apiservice';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-stato-ordine',
  templateUrl: './stato-ordine.page.html',
  styleUrls: ['./stato-ordine.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class StatoOrdinePage implements OnInit, OnDestroy {

  codiceTavolo = localStorage.getItem('codiceTavolo');
  ordini: any[] = [];

  intervalId: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.caricaOrdini();

    this.intervalId = setInterval(() => {
      this.caricaOrdini();
    }, 3000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  caricaOrdini() {
    if (!this.codiceTavolo) return;

    this.api.getOrdiniTavolo(this.codiceTavolo)
      .subscribe((data: any[]) => {
        this.ordini = data;
      });
  }
}