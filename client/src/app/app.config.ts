import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { HttpClientModule, provideHttpClient } from '@angular/common/http'; // Import HttpClientModule

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { CommonModule } from '@angular/common';

export const appConfig: ApplicationConfig = {
  
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ]
}
