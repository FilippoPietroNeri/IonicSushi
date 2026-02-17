import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.page').then( m => m.MenuPage)
  },
  {
    path: 'carrello',
    loadComponent: () => import('./pages/carrello/carrello.page').then(m => m.CarrelloPage)
  },
  {
    path: 'stato-ordine',
    loadComponent: () => import('./pages/stato-ordine/stato-ordine.page').then( m => m.StatoOrdinePage)
  }
];
