import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WebglSceneComponent } from './webgl-scene/webgl-scene.component';

@NgModule({
  declarations: [
    AppComponent,
    WebglSceneComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }