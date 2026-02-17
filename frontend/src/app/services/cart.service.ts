import { computed, Injectable, signal } from '@angular/core';

type CartItem = {
  prodotto_id: number;
  nome: string;
  prezzo: number;
  quantita: number;
  immagine?: string;
};

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _items = signal<CartItem[]>([]);

  items = this._items.asReadonly();
  count = computed(() =>
    this._items().reduce((sum, item) => sum + (item.quantita ?? 0), 0)
  );
  totale = computed(() =>
    this._items().reduce((sum, item) => sum + item.prezzo * item.quantita, 0)
  );

  addItem(product: any) {
    this._items.update(items => {
      const found = items.find(x => x.prodotto_id === product.id);
      if (found) {
        return items.map(x =>
          x.prodotto_id === product.id
            ? { ...x, quantita: x.quantita + 1 }
            : x
        );
      }

      return [
        ...items,
        {
          prodotto_id: product.id,
          nome: product.nome,
          prezzo: product.prezzo,
          immagine: product.immagine,
          quantita: 1,
        },
      ];
    });
  }

  increment(item: CartItem) {
    this._items.update(items =>
      items.map(x =>
        x.prodotto_id === item.prodotto_id
          ? { ...x, quantita: x.quantita + 1 }
          : x
      )
    );
  }

  decrement(item: CartItem) {
    this._items.update(items => {
      const target = items.find(x => x.prodotto_id === item.prodotto_id);
      if (!target) {
        return items;
      }
      if (target.quantita <= 1) {
        return items.filter(x => x.prodotto_id !== item.prodotto_id);
      }
      return items.map(x =>
        x.prodotto_id === item.prodotto_id
          ? { ...x, quantita: x.quantita - 1 }
          : x
      );
    });
  }

  clear() {
    this._items.set([]);
  }

  getOrderItems() {
    return this._items().map(item => ({
      prodotto_id: item.prodotto_id,
      quantita: item.quantita,
    }));
  }
}
