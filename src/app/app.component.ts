import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { DefaultService } from './services/default.service';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DefaultService]
})
export class AppComponent implements OnInit {
  title = 'ta-frontend';

  client_id: string = '';
  client_secret: string = '';

  constructor(
    private router: Router,
    private defaultService: DefaultService,
    public updates: SwUpdate
  ) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.checkUpdate();
      });


    router.events.subscribe((url: any) => {
      this.checkUpdate();
    });

    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkUpdate();
      };
    });
  }




  ngOnInit(): void {
    this.relogCheck();

    setInterval(() => {
      this.relogCheck();
    }, 10000);



  }

  checkUpdate() {
    this.updates.available.subscribe(_ => this.updates.activateUpdate().then(() => {
      console.log('reload for update');
      document.location.reload(true);
      this.router.navigate(['/init']);
    }));
  }


  public relogCheck() {
    if (this.router.url != '/login' && this.router.url != '/') {
      if (this.defaultService.needRelog()) {
        console.log('je potřeba relog');

        this.client_id = localStorage.getItem('client_id',);
        this.client_secret = localStorage.getItem('client_secret');
        
        this.defaultService.getToken(this.client_id, this.client_secret)
          .subscribe((data: any) => {

            console.log("RELOOOOOOOG");

            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('logged_user', this.client_id);

            localStorage.setItem('client_id', this.client_id);
            localStorage.setItem('client_secret', this.client_secret);

            let now = new Date();
            now.setSeconds(now.getSeconds() + Number(data.expires_in));

            localStorage.setItem('token_expire', String(now));

          }, (error) => {
            this.defaultService.logout()
          });


      } else {
        console.log("není potřeba relog")
      }
    }
  }

}
