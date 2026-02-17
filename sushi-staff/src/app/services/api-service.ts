import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  baseUrl = 'https://expert-engine-76jrvpg4jp5hr6jw-5000.app.github.dev';

  constructor(private http: HttpClient) {}

  getMenu() {
    return this.http.get<any[]>(`${this.baseUrl}/menu`);
  }

  getOrdiniTavolo(codice: string) {
    return this.http.get<any[]>(`${this.baseUrl}/ordini/${codice}`);
  }

  getTuttiOrdini() {
    return this.http.get<any[]>(`${this.baseUrl}/ordini`);
  }

  aggiornaStato(ordineId: number, stato: string) {
    return this.http.put(`${this.baseUrl}/riga-ordine/${ordineId}/stato`, {
      stato: stato
    });
  }
}

