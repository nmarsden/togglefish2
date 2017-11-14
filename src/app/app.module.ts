import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WebglSceneComponent } from './webgl-scene/webgl-scene.component';
import { AlertComponent } from './alert/alert.component';

import { AlertService } from './service/index';

@NgModule({
  declarations: [
    AppComponent,
    WebglSceneComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    { provide: 'Window', useValue: window },
    AlertService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
