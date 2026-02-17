import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/apiservice';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-carrello',
  templateUrl: './carrello.page.html',
  styleUrls: ['./carrello.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
})
export class CarrelloPage implements OnInit, OnDestroy {
  cartItems = this.cart.items;
  cartCount = this.cart.count;
  totale = this.cart.totale;

  codiceTavolo = signal(localStorage.getItem('codiceTavolo') ?? '');
  nome = signal(localStorage.getItem('nome') ?? '');
  
  selectedView = signal<'carrello' | 'ordini'>('carrello');
  ordini = signal<any[]>([]);
  private intervalId: any;

  constructor(private cart: CartService, private api: ApiService) {}

  ngOnInit() {
    this.caricaOrdini();
    this.intervalId = setInterval(() => {
      if (this.selectedView() === 'ordini') {
        this.caricaOrdini();
      }
    }, 3000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onSegmentChange(event: CustomEvent) {
    const value = (event.detail as { value?: string }).value;
    this.selectedView.set(value as 'carrello' | 'ordini');
    if (value === 'ordini') {
      this.caricaOrdini();
    }
  }

  caricaOrdini() {
    const codice = this.codiceTavolo();
    if (!codice) return;

    this.api.getOrdiniTavolo(codice).subscribe((data: any[]) => {
      this.ordini.set(data);
    });
  }

  increment(item: any) {
    this.cart.increment(item);
  }

  decrement(item: any) {
    this.cart.decrement(item);
  }

  inviaOrdine() {
    this.api.creaOrdine({
      codice_tavolo: this.codiceTavolo(),
      nome_cliente: this.nome(),
      prodotti: this.cart.getOrderItems(),
    }).subscribe(() => {
      alert('Ordine inviato!');
      this.cart.clear();
      this.caricaOrdini();
      this.selectedView.set('ordini');
    });
  }

  getStatoColor(stato: string): string {
    const colors: { [key: string]: string } = {
      'ordinato': 'warning',
      'in_preparazione': 'primary',
      'pronto': 'success',
      'servito': 'medium'
    };
    return colors[stato] || 'medium';
  }

  getStatoIcon(stato: string): string {
    const icons: { [key: string]: string } = {
      'ordinato': 'time-outline',
      'in_preparazione': 'restaurant-outline',
      'pronto': 'checkmark-circle-outline',
      'servito': 'checkmark-done-outline'
    };
    return icons[stato] || 'ellipse-outline';
  }

  getStatoText(stato: string): string {
    const texts: { [key: string]: string } = {
      'ordinato': 'Ordinato',
      'in_preparazione': 'In Preparazione',
      'pronto': 'Pronto',
      'servito': 'Servito'
    };
    return texts[stato] || stato;
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }
}
