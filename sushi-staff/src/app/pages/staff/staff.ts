import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type Ordine = {
  riga_id: number;
  ordine_id: number;
  nome_cliente: string;
  codice_tavolo: string;
  nome: string;
  immagine?: string;
  categoria?: string;
  quantita: number;
  stato: 'ordinato' | 'in_preparazione' | 'pronto' | 'servito';
};

@Component({
  selector: 'app-staff',
  imports: [CommonModule, FormsModule],
  templateUrl: './staff.html',
  styleUrl: './staff.css',
})
export class Staff implements OnInit, OnDestroy {
  ordini = signal<Ordine[]>([]);
  filtroStato = signal<string>('tutti');
  searchTavolo = signal<string>('');
  viewMode = signal<'kanban' | 'list'>('kanban');
  
  private intervalId: any;

  ordiniOrdinati = computed(() => 
    this.ordini().filter(o => o.stato === 'ordinato')
  );
  
  ordiniInPreparazione = computed(() =>
    this.ordini().filter(o => o.stato === 'in_preparazione')
  );
  
  ordiniPronti = computed(() =>
    this.ordini().filter(o => o.stato === 'pronto')
  );
  
  ordiniFiltrati = computed(() => {
    let risultato = this.ordini();
    
    if (this.filtroStato() !== 'tutti') {
      risultato = risultato.filter(o => o.stato === this.filtroStato());
    }
    
    const search = this.searchTavolo().toLowerCase();
    if (search) {
      risultato = risultato.filter(o => 
        o.codice_tavolo.toLowerCase().includes(search) ||
        o.nome_cliente.toLowerCase().includes(search)
      );
    }
    
    return risultato;
  });

  stats = computed(() => ({
    totale: this.ordini().length,
    ordinati: this.ordiniOrdinati().length,
    inPreparazione: this.ordiniInPreparazione().length,
    pronti: this.ordiniPronti().length
  }));

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.caricaOrdini();
    this.intervalId = setInterval(() => {
      this.caricaOrdini();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  caricaOrdini() {
    this.api.getTuttiOrdini().subscribe(data => {
      this.ordini.set(data);
    });
  }

  cambiaStato(rigaId: number, stato: 'ordinato' | 'in_preparazione' | 'pronto' | 'servito') {
    this.api.aggiornaStato(rigaId, stato).subscribe(() => {
      this.caricaOrdini();
    });
  }

  getStatoSuccessivo(statoCorrente: string): 'in_preparazione' | 'pronto' | 'servito' | null {
    const stati: { [key: string]: 'in_preparazione' | 'pronto' | 'servito' | null } = {
      'ordinato': 'in_preparazione',
      'in_preparazione': 'pronto',
      'pronto': 'servito',
      'servito': null
    };
    return stati[statoCorrente];
  }

  avanzaStato(ordine: Ordine) {
    const nuovoStato = this.getStatoSuccessivo(ordine.stato);
    if (nuovoStato) {
      this.cambiaStato(ordine.riga_id, nuovoStato);
    }
  }

  getCategoryIcon(categoria?: string): string {
    if (!categoria) return '🍱';
    const icons: { [key: string]: string } = {
      'Nigiri': '🍣',
      'Sashimi': '🐟',
      'Maki': '🍙',
      'Uramaki': '🌯',
      'Gunkan': '⛵',
      'Temaki': '🎋',
      'Hosomaki': '🥢',
      'Futomaki': '🎍',
      'Tataki': '🔥',
      'Carpaccio': '🥩',
      'Antipasti': '🥗',
      'Tempura': '🍤',
      'Ramen': '🍜',
      'Gyoza': '🥟',
      'Dolci': '🍡',
      'Bevande': '🍵'
    };
    return icons[categoria] || '🍱';
  }
}
