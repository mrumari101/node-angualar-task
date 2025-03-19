import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HelloComponent } from './hello.component';
import { provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [HelloComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: HelloComponent }]),
    CommonModule

  ],
  providers: [provideHttpClient()]
})
export class HelloModule { }
