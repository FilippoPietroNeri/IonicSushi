import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
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
export class CarrelloPage {
  cartItems = this.cart.items;
  cartCount = this.cart.count;
  totale = this.cart.totale;

  codiceTavolo = signal(localStorage.getItem('codiceTavolo') ?? '');
  nome = signal(localStorage.getItem('nome') ?? '');

  constructor(private cart: CartService, private api: ApiService) {}

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
    });
  }
}
