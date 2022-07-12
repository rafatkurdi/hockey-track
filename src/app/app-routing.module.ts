import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { TimelineComponent } from './pages/timeline/timeline.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { SelectComponent } from './pages/select/select.component';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'select', component: SelectComponent },

  { path: 'timeline/:id', component: TimelineComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'supervize/:id', component: TrackingComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'tracking/:id', component: TrackingComponent, canDeactivate: [CanDeactivateGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    CanDeactivateGuard
  ]
})
export class AppRoutingModule { }
