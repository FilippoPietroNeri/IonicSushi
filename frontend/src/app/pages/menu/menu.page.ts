import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/apiservice';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MenuPage implements OnInit {
  menu = signal<any[]>([]);

  codiceTavolo = signal(localStorage.getItem('codiceTavolo') ?? '');
  nome = signal(localStorage.getItem('nome') ?? '');

  selectedCategoria = signal('Tutte');
  cartPulse = signal(false);

  categorie = computed(() => {
    const items = this.menu();
    const set = new Set<string>();
    items.forEach(item => set.add(item.categoria ?? 'Altro'));
    return Array.from(set).sort();
  });

  gruppi = computed(() => {
    const items = this.menu();
    const categoria = this.selectedCategoria();
    const filtered = categoria === 'Tutte'
      ? items
      : items.filter(item => (item.categoria ?? 'Altro') === categoria);
    return this.buildGroups(filtered);
  });

  cartItems = this.cart.items;
  cartCount = this.cart.count;

  private cartPulseTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private api: ApiService,
    private cart: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.api.getMenu().subscribe(data => {
      this.menu.set(data);
    });
  }

  aggiungi(p: any) {
    this.cart.addItem(p);

    this.cartPulse.set(true);
    if (this.cartPulseTimer) {
      clearTimeout(this.cartPulseTimer);
    }
    this.cartPulseTimer = setTimeout(() => this.cartPulse.set(false), 300);
  }

  inviaOrdine() {
    this.api.creaOrdine({
      codice_tavolo: this.codiceTavolo(),
      nome_cliente: this.nome(),
      prodotti: this.cart.getOrderItems()
    }).subscribe(() => {
      alert('Ordine inviato!');
      this.cart.clear();
    });
  }

  vaiCarrello() {
    this.router.navigate(['/carrello']);
  }

  onCategoriaChange(event: CustomEvent) {
    const value = (event.detail as { value?: string }).value;
    this.selectedCategoria.set(value ?? 'Tutte');
  }

  private buildGroups(items: any[]) {
    const grouped = new Map<string, any[]>();
    items.forEach(item => {
      const categoria = item.categoria ?? 'Altro';
      if (!grouped.has(categoria)) {
        grouped.set(categoria, []);
      }
      grouped.get(categoria)?.push(item);
    });

    return Array.from(grouped.entries()).map(([categoria, groupItems]) => ({
      categoria,
      items: groupItems
    }));
  }
}
