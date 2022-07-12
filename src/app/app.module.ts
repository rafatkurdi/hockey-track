import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { TimelineComponent } from './pages/timeline/timeline.component';
import { NavComponent } from './components/common/nav/nav.component';
import { ResizableModule } from 'angular-resizable-element';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { SelectComponent } from './pages/select/select.component';

import { HitComponent } from './components/canvas/hit/hit.component';
import { DumpInComponent } from './components/canvas/dumpIn/dumpIn.component';
import { ShootoutComponent } from './components/canvas/shootout/shootout.component';
import { ShotComponent } from './components/canvas/shot/shot.component';
import { FaceOffComponent } from './components/canvas/faceOff/faceOff.component';
import { ZoneEntryComponent } from './components/canvas/zoneEntry/zoneEntry.component';
import { DumpOutComponent } from './components/canvas/dumpOut/dumpOut.component';
import { PenaltyComponent } from './components/canvas/penalty/penalty.component';
import { ZoneExitComponent } from './components/canvas/zoneExit/zoneExit.component';
import { OffensiveZoneLossComponent } from './components/canvas/offensiveZoneLoss/offensiveZoneLoss.component';
import { MapComponent } from './components/common/map/map.component';
import { LoadingComponent } from './components/common/loading/loading.component';
import { LoadingSmallComponent } from './components/common/loading-small/loading-small.component';

import { NgxMaskModule } from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { DragulaModule } from 'ng2-dragula';

import { HttpClientModule } from '@angular/common/http';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgSelectModule, NgSelectConfig } from '@ng-select/ng-select';

import { SafePipe } from './pipes/safe.pipe';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-adapter.class';



export const MY_CUSTOM_FORMATS = {
  fullPickerInput: 'DD.MM.YYYY HH:mm:ss',
  parseInput: 'DD.MM.YYYY HH:mm:ss',
  datePickerInput: 'DD.MM.YYYY HH:mm:ss',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY'
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TimelineComponent,
    NavComponent,
    TrackingComponent,
    ShotComponent,
    ZoneEntryComponent,
    HitComponent,
    DumpInComponent,
    ShootoutComponent,
    FaceOffComponent,
    DumpOutComponent,
    PenaltyComponent,
    ZoneExitComponent,
    OffensiveZoneLossComponent,
    MapComponent,
    SelectComponent,
    LoadingComponent,
    LoadingSmallComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ResizableModule,
    FormsModule,
    NgSelectModule,
    HttpClientModule,
    DpDatePickerModule,
    NguiAutoCompleteModule,
    NgxMaskModule.forRoot(),
    DragulaModule.forRoot(),
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: true, registrationStrategy: 'registerImmediately' }),
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS }

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private config: NgSelectConfig,
  ) {
    this.config.notFoundText = 'Nebyl nalezen žádný hráč.';
  }
}
