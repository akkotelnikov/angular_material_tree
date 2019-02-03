import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { FastMemoizeComponent } from './fast-memoize/fast-memoize.component';

@NgModule({
  declarations: [
    AppComponent,
    FastMemoizeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
