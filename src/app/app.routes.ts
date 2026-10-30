
import { Routes } from '@angular/router';
import { NetworkCanvas } from './features/network/components/network-canvas/network-canvas';

export const routes: Routes = [
  {
    path: '',
    component: NetworkCanvas,
    title: 'Aphiwe Network Portfolio'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
