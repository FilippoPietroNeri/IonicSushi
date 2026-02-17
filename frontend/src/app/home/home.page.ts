import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage {

  codiceTavolo = '';
  nome = '';

  constructor(private router: Router) {}

  entra() {
    localStorage.setItem('codiceTavolo', this.codiceTavolo);
    localStorage.setItem('nome', this.nome);
    this.router.navigate(['/menu']);
  }
}
