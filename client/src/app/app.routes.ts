import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () => import('./hello/hello.module').then(m => m.HelloModule)
      }    
    ]
  }];
